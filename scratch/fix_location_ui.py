import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix the Geolocation Alerts Panel UI
new_lines = []
skip = 0
for i, line in enumerate(lines):
    if skip > 0:
        skip -= 1
        continue
    
    # Target the panel start
    if '{/* Geolocation Alerts Panel */}' in line:
        new_lines.append(line)
        # Find the end of the panel (the next </div> that matches the depth)
        # But we'll just replace the inner content until the next major block
        new_lines.append('                 <div className="glass-card p-5 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70">\n')
        new_lines.append('                    <div className="flex justify-between items-center mb-3">\n')
        new_lines.append('                      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-600 dark:text-stone-400 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-leaf"/> {t.local_trends}</h3>\n')
        new_lines.append('                      <button \n')
        new_lines.append('                         onClick={requestLocationAndAlerts} \n')
        new_lines.append('                         disabled={isFetchingAlerts} \n')
        new_lines.append('                         className={`text-[10px] transition-colors px-3 py-1 rounded-full font-bold flex items-center gap-2 ${localAlerts ? \'bg-stone-100 dark:bg-stone-800 text-stone-500\' : \'bg-leaf/10 text-leaf hover:bg-leaf hover:text-white\'}`}\n')
        new_lines.append('                      >\n')
        new_lines.append('                         {isFetchingAlerts ? <span className="animate-spin w-3 h-3 border-2 border-leaf border-t-transparent rounded-full" /> : (localAlerts ? \'Refresh\' : t.btn_detect)}\n')
        new_lines.append('                      </button>\n')
        new_lines.append('                    </div>\n')
        new_lines.append('                    {localAlerts ? (\n')
        new_lines.append('                       <div className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">\n')
        new_lines.append('                          <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">\n')
        new_lines.append('                             <Globe className="w-3 h-3" />\n')
        new_lines.append('                             <span className="text-xs font-bold uppercase tracking-tight">{localAlerts.region}</span>\n')
        new_lines.append('                          </div>\n')
        new_lines.append('                          <ul className="text-xs text-stone-700 dark:text-stone-300 max-w-[250px] leading-relaxed space-y-1">\n')
        new_lines.append('                             {localAlerts.alerts.map((a, i) => <li key={i} className="flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-red-400" /> {a}</li>)}\n')
        new_lines.append('                          </ul>\n')
        new_lines.append('                       </div>\n')
        new_lines.append('                    ) : isFetchingAlerts ? (\n')
        new_lines.append('                       <div className="py-4 flex flex-col items-center justify-center gap-2 opacity-50">\n')
        new_lines.append('                          <MapPin className="w-8 h-8 text-leaf animate-bounce" />\n')
        new_lines.append('                          <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse dark:text-stone-400">Detecting Location...</p>\n')
        new_lines.append('                       </div>\n')
        new_lines.append('                    ) : (\n')
        new_lines.append('                       <p className="text-[11px] text-stone-400">Share location to receive real-time regional pest & disease outbreak telemetry.</p>\n')
        new_lines.append('                    )}\n')
        new_lines.append('                 </div>\n')
        
        # Now find where the original panel ends to skip it
        # The panel ends before {/* Upload panel */}
        for j in range(i+1, len(lines)):
            if '{/* Upload panel */}' in lines[j]:
                skip = j - i - 1
                break
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Successfully updated Local Trends UI.")
