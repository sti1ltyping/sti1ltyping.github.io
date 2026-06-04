from pathlib import Path
from PIL import Image

INPUT_FOLDER = "anime/images"
OUTPUT_FOLDER = "anime/images3"

WIDTH = 1600
HEIGHT = 400
QUALITY = 80

input_path = Path(INPUT_FOLDER)
output_path = Path(OUTPUT_FOLDER)
output_path.mkdir(exist_ok=True)

for image_file in input_path.iterdir():
    if image_file.suffix.lower() not in [".png", ".jpg", ".jpeg", ".webp"]:
        continue

    try:
        with Image.open(image_file) as img:
            img = img.convert("RGB")

            # Resize to standard banner size
            img = img.resize((WIDTH, HEIGHT), Image.LANCZOS)

            output_file = output_path / f"{image_file.stem}.webp"

            img.save(
                output_file,
                "WEBP",
                quality=QUALITY,
                method=6
            )

            print(f"✓ Converted: {image_file.name}")

    except Exception as e:
        print(f"✗ Failed: {image_file.name} - {e}")

print("Done!")