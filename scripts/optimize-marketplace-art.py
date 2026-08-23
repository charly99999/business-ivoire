from pathlib import Path

from PIL import Image

assets = [
    ("assets/images/marketplace-banner.png", (1400, 800)),
    ("assets/images/category-vehicles.png", (360, 360)),
    ("assets/images/category-real-estate.png", (360, 360)),
    ("assets/images/category-electronics.png", (360, 360)),
    ("assets/images/category-services.png", (360, 360)),
    ("assets/images/category-agriculture.png", (360, 360)),
    ("assets/images/category-home.png", (360, 360)),
    ("assets/images/category-fashion.png", (360, 360)),
]

for filename, bounds in assets:
    path = Path(filename)
    image = Image.open(path).convert("RGB")
    image.thumbnail(bounds, Image.Resampling.LANCZOS)
    image.save(path, format="PNG", optimize=True, compress_level=9)
