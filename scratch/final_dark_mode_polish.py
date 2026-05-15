import re

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Recommendations Badges
content = content.replace('bg-amber-50 text-amber-700 border-amber-100', 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30')
content = content.replace('bg-blue-50 text-blue-700 border-blue-100', 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30')
content = content.replace('bg-green-50 text-green-700 border-green-100', 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30')

# Fix Compare Modal
content = content.replace('className="max-w-md w-full p-3 rounded-xl border border-stone-300 shadow-sm outline-none font-medium text-sm text-stone-700 cursor-pointer bg-white"',
                          'className="max-w-md w-full p-3 rounded-xl border border-stone-300 dark:border-stone-800 shadow-sm outline-none font-medium text-sm text-stone-700 dark:text-stone-300 cursor-pointer bg-white dark:bg-stone-900"')

# Fix infection detected badge
content = content.replace('bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 border border-red-100',
                          'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 border border-red-100 dark:border-red-900/30')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Final dark mode polish applied.")
