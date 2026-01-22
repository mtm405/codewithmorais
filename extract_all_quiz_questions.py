import easyocr
import os
import json

print("Initializing EasyOCR (this may take a moment to download models)...")
reader = easyocr.Reader(['en'], gpu=False)

image_folder = r'c:\Users\ISNPS\codewithmorais\images-quiz-2'
output_file = r'c:\Users\ISNPS\codewithmorais\quiz_questions_extracted.txt'

images = sorted([f for f in os.listdir(image_folder) if f.endswith('.png')])

print(f"\nFound {len(images)} quiz images")
print(f"Starting OCR extraction...\n")

all_text = []

for idx, img_name in enumerate(images, 1):
    img_path = os.path.join(image_folder, img_name)
    
    print(f"[{idx}/{len(images)}] Processing: {img_name}...")
    
    try:
        # Read text from image
        result = reader.readtext(img_path, detail=0)
        
        # Join all text found
        text = '\n'.join(result)
        
        all_text.append({
            'image_number': idx,
            'filename': img_name,
            'extracted_text': text
        })
        
        print(f"    ✓ Extracted {len(result)} text blocks")
        
    except Exception as e:
        print(f"    ✗ Error: {e}")
        all_text.append({
            'image_number': idx,
            'filename': img_name,
            'extracted_text': f"ERROR: {e}"
        })

# Write to file
print(f"\n{'='*60}")
print("Writing results to file...")

with open(output_file, 'w', encoding='utf-8') as f:
    for item in all_text:
        f.write(f"\n{'='*60}\n")
        f.write(f"IMAGE {item['image_number']}: {item['filename']}\n")
        f.write(f"{'='*60}\n")
        f.write(item['extracted_text'])
        f.write(f"\n\n")

print(f"✓ Complete! Results saved to:\n  {output_file}")
print(f"\nTotal images processed: {len(all_text)}")
print("\nNow I can read the quiz questions and create lesson plans!")
