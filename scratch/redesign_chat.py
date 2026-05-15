import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the CHAT MODE block
chat_mode_start_marker = '{/* CHAT MODE */}'
field_hub_start_marker = '{/* FIELD HUB MODE */}'

start_index = content.find(chat_mode_start_marker)
end_index = content.find(field_hub_start_marker)

if start_index != -1 and end_index != -1:
    new_chat_mode = """{/* CHAT MODE */}
        {viewMode === 'chat' && (
           <motion.div key="chat-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[80vh] min-h-[600px]">
              
              {/* Sidebar - Professional Context */}
              <div className="lg:col-span-3 hidden lg:flex flex-col gap-4">
                 <div className="bg-white dark:bg-stone-900 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-sm">
                    <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-4 tracking-widest">Expert Context</h4>
                    <div className="space-y-4">
                       <div className="p-4 bg-leaf/5 rounded-xl border border-leaf/10">
                          <h5 className="text-xs font-bold text-leaf mb-1">Kaggle Grounded</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed">Responses are validated against global agricultural disease datasets.</p>
                       </div>
                       <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700">
                          <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">Mandi Intelligence</h5>
                          <p className="text-[10px] text-stone-500 leading-relaxed">Price trends and demand analytics integrated into suggestions.</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-leaf dark:bg-leaf/90 p-6 rounded-[2rem] text-white shadow-xl shadow-leaf/20">
                    <div className="flex items-center gap-2 mb-3">
                       <Activity className="w-5 h-5" />
                       <h4 className="text-xs font-bold uppercase tracking-widest">System Health</h4>
                    </div>
                    <p className="text-[10px] opacity-80 leading-relaxed mb-4">Doctor AI is currently processing regional telemetry for precision advice.</p>
                    <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                       <div className="bg-white h-full w-[85%]" style={{ width: '85%' }}></div>
                    </div>
                 </div>
              </div>

              {/* Main Chat Area */}
              <div className="lg:col-span-9 flex flex-col bg-white dark:bg-stone-900 shadow-2xl rounded-[2rem] border border-stone-200 dark:border-stone-800 overflow-hidden h-full">
                 <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-900">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-leaf/10 rounded-full flex items-center justify-center text-leaf"><Activity className="w-6 h-6" /></div>
                       <div>
                          <h3 className="serif text-xl font-bold text-stone-800 dark:text-stone-100">{t.doctor_ai}</h3>
                          <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{t.active_expert}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Badge variant="outline" className="text-[8px] uppercase tracking-tighter border-leaf/30 text-leaf">Verified Specialist</Badge>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     {chatMessages.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-20">
                          <MessageSquare className="w-16 h-16 mb-4 text-leaf/40" />
                          <p className="serif text-xl font-medium text-stone-500 italic">"{t.doctor_chat_prompt}"</p>
                       </div>
                    )}
                    {chatMessages.map((msg, idx) => (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-leaf text-white rounded-tr-none shadow-leaf/20' : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-tl-none border border-stone-100 dark:border-stone-700'}`}>
                             {msg.content}
                          </div>
                       </motion.div>
                    ))}
                    {isChatting && (
                       <div className="flex justify-start">
                          <div className="bg-stone-50 dark:bg-stone-800 px-4 py-3 rounded-2xl border border-stone-100 dark:border-stone-700 flex gap-1">
                             <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                             <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                       </div>
                    )}
                 </div>
                 
                 <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
                    <div className="relative flex items-center gap-2">
                       <button 
                           type="button"
                           onClick={() => startSpeechRecognition('chat')}
                           className={`p-3 rounded-full transition-all flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-leaf hover:bg-stone-100 dark:hover:bg-stone-700'}`}
                       >
                           <Mic className="w-5 h-5" />
                       </button>
                       <div className="relative flex-1 flex items-center">
                           <input 
                             value={chatInput}
                             onChange={(e) => setChatInput(e.target.value)}
                             placeholder={t.chat_placeholder}
                             className="w-full bg-stone-50 dark:bg-stone-800 dark:text-white border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-leaf/20 outline-none transition-all shadow-inner"
                           />
                           <button type="submit" disabled={isChatting} className="absolute right-2 p-3 bg-leaf text-white rounded-full shadow-lg shadow-leaf/20 hover:scale-105 active:scale-95 transition-all">
                              <Send className="w-4 h-4" />
                           </button>
                       </div>
                    </div>
                 </form>
              </div>
           </motion.div>
        )}

        """
    new_content = content[:start_index] + new_chat_mode + content[end_index:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully redesigned Chat mode.")
else:
    print("Markers not found.")
