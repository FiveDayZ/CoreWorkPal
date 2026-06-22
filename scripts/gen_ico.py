"""
Regenerate icon.ico with proper format:
- BMP-format frames for 16, 32, 48 (Windows taskbar/shell uses BMP for small sizes)
- PNG-format frames for 64, 128, 256 (high-res, Windows 7+ supports PNG in ICO)
This matches what tools like ImageMagick and Visual Studio produce.
"""
from PIL import Image, BmpImagePlugin
import struct
import io
import os

src = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons', 'icon.png'))
dst = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'icons', 'icon.ico'))

print(f"Source: {src}")
print(f"Output: {dst}")

img = Image.open(src).convert("RGBA")
print(f"Source: {img.size}, mode={img.mode}")

# Small sizes → BMP-in-ICO (ARGB), Large sizes → PNG-in-ICO
BMP_SIZES = [16, 24, 32, 48]
PNG_SIZES = [64, 128, 256]
ALL_SIZES = BMP_SIZES + PNG_SIZES

def make_bmp_blob(image, size):
    """Create a raw BMP blob suitable for ICO embedding (BITMAPINFOHEADER + ARGB pixels)."""
    resized = image.resize((size, size), Image.LANCZOS)
    # Convert to BGRA (BMP stores BGR + alpha as BGRA)
    r, g, b, a = resized.split()
    bgra = Image.merge("RGBA", (b, g, r, a))
    raw_pixels = bgra.tobytes()

    width = size
    height = size
    bpp = 32
    header_size = 40  # BITMAPINFOHEADER
    # In ICO, height is doubled (XOR mask + AND mask)
    xor_size = width * height * 4
    and_stride = ((width + 31) // 32) * 4
    and_size = and_stride * height
    data_size = header_size + xor_size + and_size

    hdr = struct.pack('<IiiHHIIiiII',
        header_size,    # biSize
        width,          # biWidth
        height * 2,     # biHeight (doubled for XOR+AND)
        1,              # biPlanes
        bpp,            # biBitCount
        0,              # biCompression (BI_RGB)
        xor_size,       # biSizeImage
        0, 0,           # biXPelsPerMeter, biYPelsPerMeter
        0, 0,           # biClrUsed, biClrImportant
    )

    # XOR mask: flip vertically (BMP is bottom-up)
    flipped = bgra.transpose(Image.FLIP_TOP_BOTTOM)
    xor_data = flipped.tobytes()

    # AND mask: all zeros (we use alpha channel)
    and_data = bytes(and_size)

    blob = hdr + xor_data + and_data
    print(f"  BMP frame {size}x{size}: {len(blob):,} bytes")
    return blob

def make_png_blob(image, size):
    resized = image.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    resized.save(buf, format='PNG')
    blob = buf.getvalue()
    print(f"  PNG frame {size}x{size}: {len(blob):,} bytes")
    return blob

blobs = []
for s in BMP_SIZES:
    blobs.append(make_bmp_blob(img, s))
for s in PNG_SIZES:
    blobs.append(make_png_blob(img, s))

n = len(blobs)
header_size = 6 + n * 16
offsets = []
offset = header_size
for blob in blobs:
    offsets.append(offset)
    offset += len(blob)

with open(dst, 'wb') as f:
    # ICONDIR header
    f.write(struct.pack('<HHH', 0, 1, n))

    # ICONDIRENTRY for each image
    for i, (s, blob) in enumerate(zip(ALL_SIZES, blobs)):
        w = s if s < 256 else 0
        h = s if s < 256 else 0
        is_bmp = s in BMP_SIZES
        bpp = 32
        f.write(struct.pack('<BBBBHHII',
            w, h,
            0,       # bColorCount
            0,       # bReserved
            1,       # wPlanes
            bpp,     # wBitCount
            len(blob),
            offsets[i],
        ))

    for blob in blobs:
        f.write(blob)

file_size = os.path.getsize(dst)
print(f"\nSaved ICO: {file_size:,} bytes with {n} frames ({len(BMP_SIZES)} BMP + {len(PNG_SIZES)} PNG)")

# Verify
with open(dst, 'rb') as f:
    hdr = f.read(6)
_, type_, count = struct.unpack('<HHH', hdr)
print(f"Verify — type={type_}, count={count}")
print("Done!")
