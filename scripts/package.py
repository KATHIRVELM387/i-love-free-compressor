"""Package only public assets for Cloudflare Pages drag-and-drop deployment."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
target = root / "i-love-free-compressor.zip"
with ZipFile(target, "w", ZIP_DEFLATED) as archive:
    for path in sorted((root / "public").rglob("*")):
        if path.is_file():
            archive.write(path, path.relative_to(root / "public"))
print(f"Created {target}")
