"""Build delivery-sized WebP assets from the retained KIE original.

This script only resizes, crops and encodes the approved generated plate.
It does not create or modify any identity or existing personal photograph.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

build_dir = Path(__file__).resolve().parent
project_dir = build_dir.parents[2]
source = build_dir / "originals" / "stochastic-kie.png"
output_dir = project_dir / "assets" / "stochastic"
output_dir.mkdir(parents=True, exist_ok=True)
image = Image.open(source).convert("RGB")
width, height = image.size

desktop_width = min(width, 1920)
desktop_height = round(height * desktop_width / width)
desktop = image.resize((desktop_width, desktop_height), Image.Resampling.LANCZOS)
desktop_path = output_dir / "stochastic-desktop.webp"
desktop.save(desktop_path, "WEBP", quality=85, method=6)

# Art-directed phone plate uses the rightmost portrait crop: the contextual trajectories remain
# visible while the pale upper field stays behind the compact headline.
crop_width = round(height * 9 / 16)
crop_left = max(0, width - crop_width)
mobile_crop = (crop_left, 0, width, height)
mobile_width = min(crop_width, 768)
mobile_height = round(height * mobile_width / crop_width)
mobile = image.crop(mobile_crop).resize((mobile_width, mobile_height), Image.Resampling.LANCZOS)
mobile_path = output_dir / "stochastic-mobile.webp"
mobile.save(mobile_path, "WEBP", quality=84, method=6)

def describe(file):
    with Image.open(file) as asset:
        return {
            "path": file.relative_to(project_dir).as_posix(),
            "width": asset.width,
            "height": asset.height,
            "bytes": file.stat().st_size,
            "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
        }

manifest = {
    "operation": "Resize and WebP encode; right-aligned 9:16 crop for mobile",
    "mobile_crop_pixels": list(mobile_crop),
    "files": [describe(source), describe(desktop_path), describe(mobile_path)],
}
(build_dir / "asset-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps(manifest, indent=2))
