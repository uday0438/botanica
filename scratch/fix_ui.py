import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the section between {/* SOIL TAB */} and {/* FERTILIZER TAB */}
# And ensure FERTILIZER TAB is clean.

soil_tab_start = content.find('{/* SOIL TAB */}')
fertilizer_tab_start = content.find('{/* FERTILIZER TAB */}')
recommendations_tab_start = content.find('{/* RECOMMENDATIONS TAB */}')

if soil_tab_start != -1 and fertilizer_tab_start != -1 and recommendations_tab_start != -1:
    new_soil_tab = """{/* SOIL TAB */}
                           {activeTab === 'Soil' && (
                             <motion.div key="Soil" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="h-full flex flex-col gap-4">
                                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
                                   
                                   {/* Soil Score Indicator */}
                                   <div className="absolute top-6 right-6 flex flex-col items-center justify-center">
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 ${getSoilScoreColor(calculateSoilScore(analysisResult.soilFertility))}`}>
                                         {calculateSoilScore(analysisResult.soilFertility)}
                                      </div>
                                      <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mt-2">{t.health_score}</span>
                                   </div>

                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100 dark:border-stone-800 pr-24">
                                      <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg"><Thermometer className="w-5 h-5 text-stone-500" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">{t.composition}</h4>
                                        <p className="text-xs text-stone-400">Estimated ideal state for recovery</p>
                                      </div>
                                   </div>
                                   <div className="space-y-4">
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 dark:text-stone-400 flex items-center">pH Value <InfoTooltip text="Measures soil acidity or alkalinity. Crucial for nutrient availability."/></span> <Badge variant="outline" className="text-leaf bg-leaf/5 dark:bg-leaf/10 border-leaf/20">{analysisResult.soilFertility.pH}</Badge></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 dark:text-stone-400 flex items-center">Nitrogen (N)</span> <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{analysisResult.soilFertility.nitrogen}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 dark:text-stone-400 flex items-center">Phosphorus (P)</span> <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{analysisResult.soilFertility.phosphorus}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 dark:text-stone-400 flex items-center">Potassium (K)</span> <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">{analysisResult.soilFertility.potassium}</span></div>
                                      
                                      <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                                         <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">Recommended Soil Type</span>
                                         <span className="text-base serif font-medium text-stone-800 dark:text-stone-100">{analysisResult.soilFertility.soilType}</span>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                           )}
                           
"""
    new_fert_tab = """{/* FERTILIZER TAB */}
                           {activeTab === 'Fertilizer' && (
                             <motion.div key="Fertilizer" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="h-full flex flex-col gap-4">
                                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col">
                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100 dark:border-stone-800">
                                      <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg"><Droplets className="w-5 h-5 text-stone-500" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">{t.chemical_fertilizer}</h4>
                                        <p className="text-xs text-stone-400">Precision requirements based on soil synthesis</p>
                                      </div>
                                   </div>
                                   <div className="space-y-4 flex-1">
                                      {Object.entries(analysisResult.fertilizerDetails.chemical).filter(([key]) => key !== 'totalCost').map(([name, data]: [string, any]) => (
                                         <div key={name} className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                                            <div className="flex justify-between items-center mb-2">
                                               <span className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-tight">{name}</span>
                                               <span className="text-xs font-mono font-bold text-leaf">{data.quantity} @ {data.cost}</span>
                                            </div>
                                            <p className="text-[11px] text-stone-500 leading-relaxed italic"><span className="font-bold text-stone-400 uppercase tracking-tighter mr-1">{t.effect_on_soil}:</span> {data.effect}</p>
                                         </div>
                                      ))}
                                   </div>
                                   <div className="mt-4">
                                       <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{t.total_cost}</span>
                                       <p className="text-2xl font-bold text-leaf serif">{analysisResult.fertilizerDetails.chemical.totalCost}</p>
                                   </div>
                                </div>

                                {/* Organic Alternatives Section */}
                                <div className="bg-green-50/50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm flex flex-col">
                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-green-100 dark:border-green-900/30">
                                      <div className="p-2 bg-leaf/10 rounded-lg"><Leaf className="w-5 h-5 text-leaf" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-green-800 dark:text-green-100">{t.organic_alternatives}</h4>
                                        <p className="text-xs text-green-600/70">Sustainable & Eco-friendly solutions</p>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {analysisResult.fertilizerDetails.organic.map((org, idx) => (
                                         <div key={idx} className="p-4 bg-white dark:bg-stone-800 rounded-xl border border-green-100 dark:border-stone-700 shadow-sm">
                                            <h5 className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">{org.name}</h5>
                                            <p className="text-[10px] text-stone-600 dark:text-stone-300 mb-2 leading-relaxed"><span className="font-bold text-green-600/70 uppercase tracking-tighter mr-1">{t.benefit}:</span> {org.benefit}</p>
                                            <p className="text-[10px] text-stone-500 dark:text-stone-400 italic"><span className="font-bold text-stone-400 uppercase tracking-tighter mr-1">{t.application}:</span> {org.application}</p>
                                         </div>
                                      ))}
                                   </div>
                                </div>
                             </motion.div>
                           )}
                           
"""

    new_content = content[:soil_tab_start] + new_soil_tab + new_fert_tab + content[recommendations_tab_start:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully restored and updated UI sections.")
else:
    print(f"Could not find markers: soil={soil_tab_start}, fert={fertilizer_tab_start}, recs={recommendations_tab_start}")
