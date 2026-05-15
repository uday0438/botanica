import re

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Encyclopedia main card
content = content.replace('className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col gap-6 relative"', 
                          'className="bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col gap-6 relative"')

# Fix Encyclopedia small cards
content = content.replace('bg-stone-50 p-5 rounded-2xl border border-stone-100', 
                          'bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl border border-stone-100 dark:border-stone-700')

# Fix mono badge
content = content.replace('bg-stone-50 inline-block px-3 py-1 rounded w-max mb-4', 
                          'bg-stone-50 dark:bg-stone-800 inline-block px-3 py-1 rounded w-max mb-4')

# Fix Diagnosis result card in Main View
content = content.replace('className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20"',
                          'className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20 dark:border-stone-800"')

# Fix satellite field title
content = content.replace('text-stone-800 tracking-tight">Satellite Field Overview',
                          'text-stone-800 dark:text-stone-100 tracking-tight">Satellite Field Overview')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Additional Dark mode container fixes applied.")
