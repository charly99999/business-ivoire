from pathlib import Path

from PIL import Image

paths = [
    Path("assets/images/icon.png"),
    Path("assets/images/splash-icon.png"),
    Path("assets/images/favicon.png"),
    Path("assets/images/android-icon-foreground.png"),
]

for path in paths:
    image = Image.open(path).convert("RGBA")
    image.thumbnail((720, 720), Image.Resampling.LANCZOS)
    image.save(path, format="PNG", optimize=True, compress_level=9)
