from PIL import Image
import os

image_folder = r'c:\Users\ISNPS\codewithmorais\exam 1'
images = sorted([f for f in os.listdir(image_folder) if f.endswith('.png')])

print(f"Found {len(images)} images\n")

# Open first few images to see dimensions and basic info
for idx, img_name in enumerate(images[:5], 1):
    img_path = os.path.join(image_folder, img_name)
    try:
        with Image.open(img_path) as img:
            print(f"{idx}. {img_name}")
            print(f"   Size: {img.size}")
            print(f"   Mode: {img.mode}")
            
            # Try to show the image (will open in default viewer)
            if idx == 1:
                print(f"\n   Opening first image in viewer...")
                img.show()
                print(f"   Please describe what you see in the image!")
                break
    except Exception as e:
        print(f"   Error: {e}")
    print()

print("\nPlease look at the image that opened and tell me:")
print("1. What is the question number?")
print("2. What is the question asking?")
print("3. What are the answer choices (if multiple choice)?")
print("4. Any code snippets shown?")
print("\nI'll use this info to extract all questions from the remaining images.")
