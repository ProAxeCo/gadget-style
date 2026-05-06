"""
Generate a 1024x1024 PNG logo for Gadget Style brand.
Used for Pinterest dev app icon, profile photos, etc.

Design: white background, GS monogram in Corporate Blue (#1060A8),
with concentric ring decoration matching the live header logo.

Output: C:\\Users\\User\\Desktop\\gadgetstyle-logo.png
"""
from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 1024
BLUE = (16, 96, 168)  # #1060A8 Corporate Blue
DARK = (15, 23, 42)   # near-black foreground
WHITE = (255, 255, 255)

OUT_PATH = os.path.expanduser("~/Desktop/gadgetstyle-logo.png")

img = Image.new("RGB", (SIZE, SIZE), WHITE)
draw = ImageDraw.Draw(img)

# Concentric ring decoration (GS concentric ring style)
center = SIZE // 2
ring_outer = 380
ring_thickness = 18
gap = 30

for i in range(3):
    r = ring_outer - i * (ring_thickness + gap)
    bbox = (center - r, center - r, center + r, center + r)
    draw.ellipse(bbox, outline=BLUE, width=ring_thickness)

# Try to load a bold system font, fallback to default
def load_font(size, bold=True):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

# "GS" monogram in the center — large, bold
gs_font = load_font(420, bold=True)
text = "GS"
bbox = draw.textbbox((0, 0), text, font=gs_font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (SIZE - tw) // 2 - bbox[0]
ty = (SIZE - th) // 2 - bbox[1] - 30  # slight upward shift
draw.text((tx, ty), text, fill=BLUE, font=gs_font)

# Wordmark "GADGET STYLE" at bottom — smaller, condensed
word_font = load_font(74, bold=True)
g_text = "GADGET "
s_text = "STYLE"
g_bbox = draw.textbbox((0, 0), g_text, font=word_font)
s_bbox = draw.textbbox((0, 0), s_text, font=word_font)
gw = g_bbox[2] - g_bbox[0]
sw = s_bbox[2] - s_bbox[0]
total_w = gw + sw
wx = (SIZE - total_w) // 2 - g_bbox[0]
wy = SIZE - 150
draw.text((wx, wy), g_text, fill=DARK, font=word_font)
draw.text((wx + gw, wy), s_text, fill=BLUE, font=word_font)

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
img.save(OUT_PATH, "PNG", optimize=True)
print(f"Wrote: {OUT_PATH} ({os.path.getsize(OUT_PATH) // 1024} KB)")
