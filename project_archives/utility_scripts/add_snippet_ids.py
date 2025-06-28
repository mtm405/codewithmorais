import os
import json
import re

LESSON_DIR = "lessons"  # Change this if your lessons are in a different folder

def get_lesson_number(filename):
    # Extracts lesson number from filename like lesson_1_2.json
    match = re.search(r'lesson_(\d+)_?(\d+)?', filename)
    if match:
        return '_'.join(filter(None, match.groups()))
    return "unknown"

def add_ids_to_code_snippets(path, lesson_num):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    changed = False
    # Support both {"blocks": [...]} and top-level list
    blocks = data.get('blocks') if isinstance(data, dict) and 'blocks' in data else data
    if not isinstance(blocks, list):
        return False
    snippet_count = 1
    for block in blocks:
        if isinstance(block, dict) and block.get('code'):
            block['id'] = f"lesson{lesson_num}_snippet{snippet_count}"
            snippet_count += 1
            changed = True
    if changed:
        if isinstance(data, dict) and 'blocks' in data:
            data['blocks'] = blocks
        else:
            data = blocks
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated {os.path.basename(path)}")
    return changed

for fname in os.listdir(LESSON_DIR):
    if fname.endswith('.json') and fname.startswith('lesson_'):
        path = os.path.join(LESSON_DIR, fname)
        lesson_num = get_lesson_number(fname)
        add_ids_to_code_snippets(path, lesson_num)

print("All lesson code snippets now have unique, systematic IDs.")
