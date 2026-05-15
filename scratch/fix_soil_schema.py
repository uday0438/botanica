import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\api\index.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the soilFertility schema in the prompt
old_prompt_segment = r""""soilFertility": "status","""
new_prompt_segment = r""""soilFertility": { "status": "Optimizing", "pH": "6.5", "nitrogen": "Low", "phosphorus": "Medium", "potassium": "High", "soilType": "Loamy" },"""

content = content.replace(old_prompt_segment, new_prompt_segment)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed soilFertility schema in the backend prompt.")
