from PIL import Image, ImageColor

# Path to the uploaded image and output path
input_path = r"C:\Users\ml_devdat\.gemini\antigravity-ide\brain\542364a4-2763-4793-9bc0-c8ccc9640312\media__1784990723518.jpg"
output_path = r"c:\Users\ml_devdat\local_projects\Portiter\public\og_image.jpg"

try:
    img = Image.open(input_path)
    # The target size for OG Image
    target_width = 1200
    target_height = 630

    # Get original dimensions
    orig_width, orig_height = img.size

    # Calculate scale factor to fit within 1200x630 while maintaining aspect ratio
    # Usually banner is wide, so we fit width
    scale = min(target_width / orig_width, target_height / orig_height)
    new_width = int(orig_width * scale)
    new_height = int(orig_height * scale)

    # Resize original image
    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Create a new black background image 1200x630
    # The banner has a black background, so padding with black works perfectly
    new_img = Image.new("RGB", (target_width, target_height), (0, 0, 0))

    # Calculate padding to center it
    x_offset = (target_width - new_width) // 2
    y_offset = (target_height - new_height) // 2

    # Paste the resized image onto the center of the black background
    new_img.paste(resized_img, (x_offset, y_offset))

    # Save to public directory
    new_img.save(output_path, quality=95)
    print(f"Successfully generated 1200x630 OG image at {output_path}")

except Exception as e:
    print(f"Error: {e}")
