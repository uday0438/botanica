import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\api\index.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the MODELS list with the most robust and compatible names
old_models = 'const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];'
new_models = 'const MODELS = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];'

content = content.replace(old_models, new_models)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated AI models for maximum compatibility.")
