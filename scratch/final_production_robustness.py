import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the hardcoded API_BASE_URL logic with root-relative paths
old_url_logic = "const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004';"
new_url_logic = "const API_BASE_URL = ''; // Using root-relative paths for production stability"

content = content.replace(old_url_logic, new_url_logic)

# Ensure all fetch calls use /api
content = content.replace('`${API_BASE_URL}/api/', '"/api/')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully converted API calls to root-relative paths.")
