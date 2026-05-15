import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken quotes
content = content.replace('"/api/analyze`,', '"/api/analyze",')
content = content.replace('"/api/chat`,', '"/api/chat",')
content = content.replace('"/api/alerts`,', '"/api/alerts",')
content = content.replace('"/api/encyclopedia`,', '"/api/encyclopedia",')
content = content.replace('"/api/market`,', '"/api/market",')
content = content.replace('"/api/satellite`,', '"/api/satellite",')
content = content.replace('"/api/weather`,', '"/api/weather",')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed syntax errors in App.tsx")
