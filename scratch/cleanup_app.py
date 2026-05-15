import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '{/* OLD CONTENT REMOVED */}' in line:
        skip = True
        continue
    if skip:
        # We want to skip until we hit the end of that section
        # The section ends with </div> and then the total cost section starts
        if 'analysisResult.fertilizerDetails.chemical.totalCost' in line:
            skip = False
            # We need to find the </div> that closes the previous section
            # Looking back, the new section ended with </div> already.
            # So we just need to keep this line and subsequent lines.
        else:
            continue
    
    new_lines.append(line)

# Wait, I need to be more precise. Let's just find the start and end indices.
start_index = -1
end_index = -1

for i, line in enumerate(lines):
    if '{/* OLD CONTENT REMOVED */}' in line:
        start_index = i
    if start_index != -1 and 'analysisResult.fertilizerDetails.chemical.totalCost' in line:
        # The line before totalCost is <div> (total cost container)
        # The line before that is </div> (chemical list container)
        # We want to keep from 2 lines before this line onwards.
        end_index = i - 2
        break

if start_index != -1 and end_index != -1:
    final_lines = lines[:start_index] + lines[end_index:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(final_lines)
    print(f"Successfully cleaned up {file_path}")
else:
    print(f"Could not find cleanup markers: start={start_index}, end={end_index}")
