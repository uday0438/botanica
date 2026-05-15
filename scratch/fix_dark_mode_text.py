import re

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix text-stone-800
content = re.sub(r'text-stone-800(?!.*dark:text-stone-100)', 'text-stone-800 dark:text-stone-100', content)

# Fix text-stone-700
content = re.sub(r'text-stone-700(?!.*dark:text-stone-300)', 'text-stone-700 dark:text-stone-300', content)

# Fix text-stone-600
content = re.sub(r'text-stone-600(?!.*dark:text-stone-400)', 'text-stone-600 dark:text-stone-400', content)

# Specific fixes for backgrounds that were white but should be dark
content = content.replace('bg-white shadow-sm', 'bg-white dark:bg-stone-900 shadow-sm')
content = content.replace('bg-stone-100 rounded-xl', 'bg-stone-100 dark:bg-stone-800 rounded-xl')
content = content.replace('bg-stone-50 text-stone-700', 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300')

# Fix Encyclopedia Search Result specifically (EncyclopediaEntries)
content = content.replace('className="text-stone-800 font-medium leading-snug"', 'className="text-stone-800 dark:text-stone-100 font-medium leading-snug"')

# Fix Satellite Field Overview title
content = content.replace('text-4xl font-bold text-stone-800 tracking-tight', 'text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight')

# Fix Weather alerts
content = content.replace('font-bold text-stone-800 mb-1', 'font-bold text-stone-800 dark:text-stone-100 mb-1')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dark mode visibility fixes applied.")
