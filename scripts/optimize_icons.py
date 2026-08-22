from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "assets/images/icon.png",
    ROOT / "assets/images/splash-icon.png",
    ROOT / "assets/images/favicon.png",
    ROOT / "assets/images/android-icon-foreground.png",
]


def optimize_icon(path: Path) -> None:
    with Image.open(path) as source:
        image = source.convert("RGBA")
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True, compress_level=9)


for target in TARGETS:
    optimize_icon(target)
    print(f"Optimized {target.name}: {target.stat().st_size} bytes")
