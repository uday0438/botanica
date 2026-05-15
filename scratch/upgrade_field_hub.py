import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the FIELD HUB block
field_hub_start_marker = '{/* FIELD HUB MODE */}'
about_us_start_marker = '{/* ABOUT US VIEW */}'

start_index = content.find(field_hub_start_marker)
end_index = content.find(about_us_start_marker)

if start_index != -1 and end_index != -1:
    new_field_hub = """{/* FIELD HUB MODE */}
        {viewMode === 'field' && (
          <motion.div key="field-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-[1400px] mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Satellite Overview */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20 dark:border-stone-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-leaf to-transparent animate-scan"></div>
                      
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <div>
                          <h2 className="serif text-4xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">Neural Field Monitor</h2>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-2 h-2 bg-leaf rounded-full animate-pulse"></div>
                             <span className="text-[10px] font-bold text-leaf uppercase tracking-[0.2em]">Live Satellite Stream</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-mono text-stone-400 uppercase">Coordinate Lock</p>
                           <p className="text-sm font-mono font-bold text-stone-600 dark:text-stone-300">{userCoords ? `${userCoords.latitude.toFixed(4)}° N, ${userCoords.longitude.toFixed(4)}° E` : 'Searching...'}</p>
                        </div>
                      </div>

                      {/* Map Container with Scanning Effect */}
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 shadow-inner group">
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110"></div>
                         
                         {/* Grid Overlay */}
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-20 pointer-events-none"></div>
                         
                         {/* Radar Sweep */}
                         <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-conic from-leaf/10 to-transparent animate-spin-slow"></div>
                         </div>

                         {/* Data Points */}
                         <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-leaf rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse"></div>
                         <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-ping"></div>

                         <div className="absolute bottom-6 left-6 right-6 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex justify-around text-white">
                            <div className="text-center">
                               <p className="text-[8px] uppercase tracking-widest opacity-60">Vegetation (NDVI)</p>
                               <p className="text-lg font-bold">0.82 <span className="text-[10px] text-leaf">↑</span></p>
                            </div>
                            <div className="text-center border-x border-white/10 px-6">
                               <p className="text-[8px] uppercase tracking-widest opacity-60">Moisture Index</p>
                               <p className="text-lg font-bold">64%</p>
                            </div>
                            <div className="text-center">
                               <p className="text-[8px] uppercase tracking-widest opacity-60">Nitrogen Sink</p>
                               <p className="text-lg font-bold">Optimal</p>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
                         {[
                           { label: 'Soil Temp', value: '24.2°C', icon: Thermometer },
                           { label: 'Leaf Wetness', value: 'Normal', icon: Droplets },
                           { label: 'Solar Flux', value: 'High', icon: Sun },
                           { label: 'Wind Direction', value: 'NW', icon: Wind }
                         ].map((stat, i) => (
                           <div key={i} className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col items-center gap-2">
                              <stat.icon className="w-5 h-5 text-leaf/60" />
                              <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">{stat.label}</p>
                              <p className="text-sm font-bold text-stone-700 dark:text-stone-200">{stat.value}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex justify-center">
                      <button className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-800 px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group">
                         <CloudRain className="w-4 h-4 text-leaf group-hover:animate-bounce" />
                         Generate Precision Report
                      </button>
                   </div>
                </div>

                {/* Right Column: Alerts & Local Market */}
                <div className="space-y-6">
                   <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-xl border border-stone-200 dark:border-stone-800 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl"><AlertCircle className="w-6 h-6 text-red-500" /></div>
                         <h3 className="serif text-xl font-bold text-stone-800 dark:text-stone-100">Regional Outbreaks</h3>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl">
                            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div> Intense Heatwave Detected</h4>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">System-wide irrigation boost recommended for the next 48 hours to prevent wilting.</p>
                         </div>
                         <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Unseasonal Rain Forecast</h4>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">30mm precipitation expected by Saturday. Delay chemical spraying to avoid runoff.</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-stone-950 rounded-[2.5rem] p-8 shadow-2xl text-white relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-leaf/20 to-transparent opacity-50"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <h3 className="serif text-xl font-bold mb-1">Mandi Outlook</h3>
                              <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Market Intelligence</p>
                           </div>
                           <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md"><Activity className="w-5 h-5 text-leaf" /></div>
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="text-xs opacity-80">Present Cost</span>
                              <span className="text-xs font-bold">₹ 2,450 / Quintal</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-white/10">
                              <span className="text-xs opacity-80">Demand Index</span>
                              <Badge className="bg-leaf text-[8px] font-bold shadow-lg shadow-leaf/30">VERY HIGH</Badge>
                           </div>
                           <div className="flex justify-between items-center py-2">
                              <span className="text-xs opacity-80">Price Trajectory</span>
                              <span className="text-xs font-bold text-leaf">+ 12% This Week</span>
                           </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-white text-stone-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-leaf hover:text-white transition-all shadow-xl">View Full Market Trends</button>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        """
    new_content = content[:start_index] + new_field_hub + content[end_index:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully upgraded Field Hub UI.")
else:
    print("Markers not found.")
