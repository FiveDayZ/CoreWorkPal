"""
Regenerate Windows/Tauri icon assets from src/assets/icons/app_icon.png.

The source PNG has fully transparent pixels with mostly black RGB values. If a
resizer samples straight RGBA directly, those hidden black pixels can bleed into
small icon edges and make bright details, especially the mouth, look dirty on
the Windows desktop. This script resizes in premultiplied-alpha space before
writing PNG and ICO assets.
"""

from __future__ import annotations

import io
import os
import struct
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src" / "assets" / "icons" / "app_icon.png"
ICON_DIR = ROOT / "src-tauri" / "icons"
ICO_PATH = ICON_DIR / "icon.ico"

PNG_SIZES = {
    "32x32.png": 32,
    "64x64.png": 64,
    "128x128.png": 128,
    "128x128@2x.png": 256,
    "icon.png": 512,
    "Square30x30Logo.png": 30,
    "Square44x44Logo.png": 44,
    "Square71x71Logo.png": 71,
    "Square89x89Logo.png": 89,
    "Square107x107Logo.png": 107,
    "Square142x142Logo.png": 142,
    "Square150x150Logo.png": 150,
    "Square284x284Logo.png": 284,
    "Square310x310Logo.png": 310,
    "StoreLogo.png": 50,
}

BMP_ICO_SIZES = [16, 24, 32, 48]
PNG_ICO_SIZES = [64, 128, 256]
ALL_ICO_SIZES = BMP_ICO_SIZES + PNG_ICO_SIZES


def resize_premultiplied(image: Image.Image, size: int) -> Image.Image:
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    r, g, b, _ = image.split()
    premultiplied = Image.merge(
        "RGBA",
        (
            ImageChops.multiply(r, alpha),
            ImageChops.multiply(g, alpha),
            ImageChops.multiply(b, alpha),
            alpha,
        ),
    )
    resized = premultiplied.resize((size, size), Image.Resampling.LANCZOS)

    pixels = []
    pixel_data = (
        resized.get_flattened_data()
        if hasattr(resized, "get_flattened_data")
        else resized.getdata()
    )
    for red, green, blue, alpha_value in pixel_data:
        if alpha_value == 0:
            pixels.append((0, 0, 0, 0))
        else:
            pixels.append(
                (
                    min(255, round(red * 255 / alpha_value)),
                    min(255, round(green * 255 / alpha_value)),
                    min(255, round(blue * 255 / alpha_value)),
                    alpha_value,
                )
            )

    output = Image.new("RGBA", resized.size)
    output.putdata(pixels)
    return output


def make_bmp_blob(image: Image.Image, size: int) -> bytes:
    resized = resize_premultiplied(image, size)
    r, g, b, a = resized.split()
    bgra = Image.merge("RGBA", (b, g, r, a))
    flipped = bgra.transpose(Image.Transpose.FLIP_TOP_BOTTOM)

    width = size
    height = size
    bpp = 32
    header_size = 40
    xor_size = width * height * 4
    and_stride = ((width + 31) // 32) * 4
    and_size = and_stride * height

    header = struct.pack(
        "<IiiHHIIiiII",
        header_size,
        width,
        height * 2,
        1,
        bpp,
        0,
        xor_size,
        0,
        0,
        0,
        0,
    )

    return header + flipped.tobytes() + bytes(and_size)


def make_png_blob(image: Image.Image, size: int) -> bytes:
    resized = resize_premultiplied(image, size)
    buffer = io.BytesIO()
    resized.save(buffer, format="PNG")
    return buffer.getvalue()


def write_ico(image: Image.Image) -> None:
    blobs = [make_bmp_blob(image, size) for size in BMP_ICO_SIZES]
    blobs.extend(make_png_blob(image, size) for size in PNG_ICO_SIZES)

    header_size = 6 + len(blobs) * 16
    offsets = []
    offset = header_size
    for blob in blobs:
        offsets.append(offset)
        offset += len(blob)

    with ICO_PATH.open("wb") as file:
        file.write(struct.pack("<HHH", 0, 1, len(blobs)))

        for size, blob, offset in zip(ALL_ICO_SIZES, blobs, offsets):
            width = size if size < 256 else 0
            height = size if size < 256 else 0
            file.write(
                struct.pack(
                    "<BBBBHHII",
                    width,
                    height,
                    0,
                    0,
                    1,
                    32,
                    len(blob),
                    offset,
                )
            )

        for blob in blobs:
            file.write(blob)


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE).convert("RGBA")

    print(f"Source: {SOURCE}")
    print(f"Source size: {source.size}")

    for filename, size in PNG_SIZES.items():
        output = ICON_DIR / filename
        resize_premultiplied(source, size).save(output)
        print(f"Wrote {output.relative_to(ROOT)} ({size}x{size}, {os.path.getsize(output):,} bytes)")

    write_ico(source)
    print(f"Wrote {ICO_PATH.relative_to(ROOT)} ({os.path.getsize(ICO_PATH):,} bytes)")

    ico = Image.open(ICO_PATH)
    print(f"ICO sizes: {sorted(ico.info.get('sizes', []))}")


if __name__ == "__main__":
    main()
