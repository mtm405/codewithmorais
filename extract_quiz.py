import os
from PIL import Image
import pytesseract

# Set tesseract path (common Windows installation)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

image_folder = r'c:\Users\ISNPS\codewithmorais\exam 1'
output_file = r'c:\Users\ISNPS\codewithmorais\exam_1_questions.txt'

# Get all PNG files sorted
images = sorted([f for f in os.listdir(image_folder) if f.endswith('.png')])

with open(output_file, 'w', encoding='utf-8') as out:
    for idx, img_name in enumerate(images, 1):
        img_path = os.path.join(image_folder, img_name)
        print(f"Processing {idx}/{len(images)}: {img_name}")
        
        try:
            # Open and extract text
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img)
            
            out.write(f"\n{'='*60}\n")
            out.write(f"IMAGE {idx}: {img_name}\n")
            out.write(f"{'='*60}\n")
            out.write(text)
            out.write("\n")
            
        except Exception as e:
            out.write(f"ERROR: {e}\n")
            print(f"Error processing {img_name}: {e}")

print(f"\n✅ Complete! Quiz extracted to: {output_file}")
