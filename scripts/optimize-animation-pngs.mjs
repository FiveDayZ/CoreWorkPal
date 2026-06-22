import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const repoRoot = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const animationDir = path.join(repoRoot, "src", "assets", "pets", "animation");
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const crcTable = createCrcTable();

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

let totalBefore = 0;
let totalAfter = 0;
let optimizedCount = 0;

for (const fileName of readdirSync(animationDir).filter((file) => file.endsWith(".png"))) {
  const filePath = path.join(animationDir, fileName);
  const originalPng = readFileSync(filePath);
  const parsed = parsePng(originalPng);

  totalBefore += originalPng.length;

  if (
    parsed.bitDepth !== 8 ||
    parsed.colorType !== 6 ||
    parsed.interlaceMethod !== 0
  ) {
    totalAfter += originalPng.length;
    console.log(`${fileName}: skipped unsupported PNG format`);
    continue;
  }

  const originalPixels = unfilterScanlines(
    parsed.imageData,
    parsed.width,
    parsed.height,
    4,
  );
  const filtered = filterScanlines(originalPixels, parsed.width, parsed.height, 4);
  const compressed = deflateSync(filtered, {
    level: 9,
    memLevel: 9,
  });
  const optimizedPng = writePng(parsed, compressed);
  const optimizedParsed = parsePng(optimizedPng);
  const optimizedPixels = unfilterScanlines(
    optimizedParsed.imageData,
    optimizedParsed.width,
    optimizedParsed.height,
    4,
  );

  assert.equal(optimizedParsed.width, parsed.width, `${fileName} width changed`);
  assert.equal(optimizedParsed.height, parsed.height, `${fileName} height changed`);
  assert.equal(
    Buffer.compare(originalPixels, optimizedPixels),
    0,
    `${fileName} pixel data changed`,
  );

  if (optimizedPng.length < originalPng.length || force) {
    optimizedCount += 1;
    totalAfter += optimizedPng.length;
    if (!dryRun) {
      writeFileSync(filePath, optimizedPng);
    }
    console.log(
      `${fileName}: ${formatBytes(originalPng.length)} -> ${formatBytes(
        optimizedPng.length,
      )} (${formatPercent(originalPng.length, optimizedPng.length)} saved)`,
    );
  } else {
    totalAfter += originalPng.length;
    console.log(`${fileName}: kept original, optimized stream was not smaller`);
  }
}

console.log(
  `Animation PNG total: ${formatBytes(totalBefore)} -> ${formatBytes(
    totalAfter,
  )} (${formatPercent(totalBefore, totalAfter)} saved), files optimized: ${optimizedCount}`,
);

function parsePng(png) {
  assert.equal(Buffer.compare(png.subarray(0, 8), pngSignature), 0, "bad PNG signature");

  let offset = 8;
  let ihdr = null;
  const chunks = [];
  const idatChunks = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = Buffer.from(png.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;

    if (type === "IHDR") {
      ihdr = data;
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type !== "IEND") {
      chunks.push({ data, type });
    }

    if (type === "IEND") {
      break;
    }
  }

  assert.ok(ihdr, "missing IHDR");

  return {
    bitDepth: ihdr[8],
    chunks,
    colorType: ihdr[9],
    compressionMethod: ihdr[10],
    filterMethod: ihdr[11],
    height: ihdr.readUInt32BE(4),
    ihdr,
    imageData: inflateSync(Buffer.concat(idatChunks)),
    interlaceMethod: ihdr[12],
    width: ihdr.readUInt32BE(0),
  };
}

function writePng(parsed, compressedImageData) {
  return Buffer.concat([
    pngSignature,
    createChunk("IHDR", parsed.ihdr),
    ...parsed.chunks.map((item) => createChunk(item.type, item.data)),
    createChunk("IDAT", compressedImageData),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

function unfilterScanlines(scanlines, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(stride * height);
  let inputOffset = 0;
  let outputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = scanlines[inputOffset];
    inputOffset += 1;
    const row = scanlines.subarray(inputOffset, inputOffset + stride);
    inputOffset += stride;
    const previousRow =
      y > 0 ? pixels.subarray(outputOffset - stride, outputOffset) : null;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? pixels[outputOffset + x - bytesPerPixel] : 0;
      const up = previousRow ? previousRow[x] : 0;
      const upLeft = previousRow && x >= bytesPerPixel ? previousRow[x - bytesPerPixel] : 0;
      let value = row[x];

      if (filter === 1) {
        value = (value + left) & 255;
      } else if (filter === 2) {
        value = (value + up) & 255;
      } else if (filter === 3) {
        value = (value + ((left + up) >> 1)) & 255;
      } else if (filter === 4) {
        value = (value + paethPredictor(left, up, upLeft)) & 255;
      } else if (filter !== 0) {
        throw new Error(`unsupported PNG filter ${filter}`);
      }

      pixels[outputOffset + x] = value;
    }

    outputOffset += stride;
  }

  return pixels;
}

function filterScanlines(pixels, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const scanlines = Buffer.alloc((stride + 1) * height);
  let outputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const previousRow = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;
    let best = null;

    for (let filter = 0; filter <= 4; filter += 1) {
      const candidate = filterRow(row, previousRow, bytesPerPixel, filter);
      if (!best || candidate.score < best.score) {
        best = candidate;
      }
    }

    scanlines[outputOffset] = best.filter;
    outputOffset += 1;
    best.row.copy(scanlines, outputOffset);
    outputOffset += stride;
  }

  return scanlines;
}

function filterRow(row, previousRow, bytesPerPixel, filter) {
  const filtered = Buffer.alloc(row.length);
  let score = 0;

  for (let index = 0; index < row.length; index += 1) {
    const left = index >= bytesPerPixel ? row[index - bytesPerPixel] : 0;
    const up = previousRow ? previousRow[index] : 0;
    const upLeft = previousRow && index >= bytesPerPixel
      ? previousRow[index - bytesPerPixel]
      : 0;
    let value = row[index];

    if (filter === 1) {
      value = (value - left) & 255;
    } else if (filter === 2) {
      value = (value - up) & 255;
    } else if (filter === 3) {
      value = (value - ((left + up) >> 1)) & 255;
    } else if (filter === 4) {
      value = (value - paethPredictor(left, up, upLeft)) & 255;
    }

    filtered[index] = value;
    score += value < 128 ? value : 256 - value;
  }

  return { filter, row: filtered, score };
}

function paethPredictor(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left;
  }
  if (upDistance <= upLeftDistance) {
    return up;
  }
  return upLeft;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuffer.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32([typeBuffer, data]), 8 + data.length);
  return chunk;
}

function createCrcTable() {
  const table = new Uint32Array(256);

  for (let n = 0; n < table.length; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }

  return table;
}

function crc32(parts) {
  let crc = 0xffffffff;

  for (const part of parts) {
    for (let index = 0; index < part.length; index += 1) {
      crc = crcTable[(crc ^ part[index]) & 255] ^ (crc >>> 8);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function formatBytes(value) {
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function formatPercent(before, after) {
  return `${(((before - after) / before) * 100).toFixed(2)}%`;
}
