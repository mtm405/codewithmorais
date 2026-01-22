from PIL import Image
import json
import os

image_folder = r'c:\Users\ISNPS\codewithmorais\images-quiz-2'
output_file = r'c:\Users\ISNPS\codewithmorais\quiz_content_manual.json'

images = sorted([f for f in os.listdir(image_folder) if f.endswith('.png')])

print(f"Found {len(images)} quiz screenshots")
print("\nI'll open each image one by one.")
print("For each image, please tell me:")
print("  - Question number")
print("  - Question text")
print("  - Topic (loops, conditionals, functions, errors, etc.)")
print("  - Any code shown\n")

quiz_data = []

for idx, img_name in enumerate(images, 1):
    img_path = os.path.join(image_folder, img_name)
    
    print(f"\n{'='*60}")
    print(f"Opening Image {idx} of {len(images)}: {img_name}")
    print('='*60)
    
    try:
        img = Image.open(img_path)
        img.show()
        
        print("\nWhat do you see?")
        print("Enter 'skip' to move to next, 'done' to finish, or describe the question:")
        
        # For now, just create placeholders
        quiz_data.append({
            "image_number": idx,
            "image_file": img_name,
            "question_number": f"Q{idx}",
            "topic": "Unknown",
            "question_text": "To be filled in",
            "code_snippet": "",
            "notes": ""
        })
        
        # Only show first 3 for now
        if idx >= 3:
            print("\n[Showing first 3 images as examples]")
            break
            
    except Exception as e:
        print(f"Error: {e}")

# Save what we have
with open(output_file, 'w') as f:
    json.dump(quiz_data, f, indent=2)

print(f"\n\nTemplate saved to: {output_file}")
print("\nNEXT STEP: Please describe what you see in the images that opened,")
print("and I'll use that info to create targeted lesson plans!")
