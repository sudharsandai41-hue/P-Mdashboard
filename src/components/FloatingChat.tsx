"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, ArrowRight } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

type Message = {
  id: string;
  sender: string;
  text: string;
  time: string;
  team: string;
};

export default function FloatingChat({ teamType, userName }: { teamType: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  // Auto-scroll logic
  useEffect(() => {
    if (endOfMessagesRef.current && isOpen) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Initial Fetch & Real-time Subscription Setup
  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabaseClient
         .from('chat_messages')
         .select('*')
         .eq('team', teamType)
         .order('id', { ascending: true }); // using 'id' (timestamp string) to chronologically sort
         
      if (!error && data) {
         setMessages(data as Message[]);
      }
    };
    fetchHistory();

    // Setup Postgres Channel Listener for multiplayer
    const channel = supabaseClient
      .channel(`chat_${teamType}`)
      .on('postgres_changes', { 
         event: 'INSERT', 
         schema: 'public', 
         table: 'chat_messages',
         filter: `team=eq.${teamType}`
      }, (payload) => {
         // Whenever another user inserts a message, inject it directly to our live view!
         setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [teamType]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // We proactively set a timestamp ID to ensure explicit Chronological sorts across devices
    const timestampId = Date.now().toString();
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: timestampId,
      team: teamType,
      sender: userName,
      text: inputValue.trim(),
      time: timeString
    };
    
    // Clear input instantly for snappy UX feel
    setInputValue("");
    
    // Attempt standard Push. 
    // Do NOT optimistically update local state here; let the WebSockets (.on('postgres_changes')) append it globally
    // so we confirm the cloud received it.
    await supabaseClient.from('chat_messages').insert([newMessage]);
  };

  const recentMessages = messages.slice(-3); // Last 3 messages

  return (
    <>
      {/* 1. COMPACT DASHBOARD CARD (WHEN CLOSED) */}
      {!isOpen && (
        <section className="mt-8">
           <div 
             onClick={() => setIsOpen(true)}
             className="bg-brand-card shadow-sm border border-brand-border rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all group overflow-hidden relative"
           >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3C4D6]/20 rounded-bl-full blur-[40px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-5 border-b border-brand-border pb-4 relative z-10">
                 <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-brand-border flex items-center justify-center text-[#e95e8e]">
                         <MessageCircle className="w-5 h-5" fill="currentColor" fillOpacity={0.1}/>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-brand-card"></div>
                   </div>
                   <div>
                     <h2 className="text-sm font-extrabold text-[#1c1917] leading-tight">P&M {teamType}</h2>
                     <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online Now</p>
                   </div>
                 </div>
                 
                 <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#c5a65c] border-2 border-brand-card shadow-sm flex items-center justify-center text-[9px] font-extrabold text-white">MA</div>
                    <div className="w-7 h-7 rounded-full bg-[#5A87A8] border-2 border-brand-card shadow-sm flex items-center justify-center text-[9px] font-extrabold text-white">RA</div>
                    <div className="w-7 h-7 rounded-full bg-[#8353b3] border-2 border-brand-card shadow-sm flex items-center justify-center text-[9px] font-extrabold text-white">DI</div>
                 </div>
              </div>

              <div className="space-y-3 relative z-10 bg-brand-bg/50 p-4 rounded-xl border border-brand-border/50 shadow-inner max-h-[160px] overflow-hidden">
                 {recentMessages.map(msg => {
                    const isMe = msg.sender.toLowerCase() === userName.toLowerCase();
                    return (
                       <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`px-3 py-2 rounded-xl text-xs max-w-[90%] shadow-sm ${
                             isMe ? 'bg-[#1c1917] text-white border border-black rounded-br-sm' : 'bg-white text-[#1c1917] border border-brand-border/60 rounded-bl-sm'
                          }`}>
                            <span className={`block text-[9px] font-extrabold pb-0.5 opacity-50 uppercase tracking-wider ${isMe ? 'text-right' : 'text-left'}`}>
                               {isMe ? 'You' : msg.sender}
                            </span>
                            <span className="block truncate opacity-90 font-medium">{msg.text}</span>
                          </div>
                       </div>
                    );
                 })}
                 {recentMessages.length === 0 && <p className="text-xs text-brand-muted font-bold text-center py-4">No recent messages.</p>}
              </div>

              <button className="mt-5 w-full bg-white hover:bg-brand-bg border border-brand-border text-[#1c1917] py-3 rounded-xl font-extrabold text-sm shadow-sm transition-all flex justify-center items-center gap-2 group-hover:border-[#c5a65c] relative z-10">
                 Tap to open full chat Room
                 <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all"/>
              </button>
           </div>
        </section>
      )}

      {/* 2. FULL EXPANDED OVERLAY (WHEN OPEN) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Blur Backdrop */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="fixed inset-0 bg-[#F5EAE1]/30 backdrop-blur-sm z-[99] cursor-pointer"
            />

            {/* Slide-out Chat Panel */}
            <motion.div 
               initial={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
               animate={{ x: 0, boxShadow: "-10px 0 30px rgba(0,0,0,0.1)" }}
               exit={{ x: "100%", boxShadow: "-10px 0 30px rgba(0,0,0,0)" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="fixed top-0 right-0 bottom-0 w-[85vw] md:w-[60vw] xl:w-[45vw] bg-[#F5EAE1] z-[100] flex flex-col border-l border-brand-border shadow-2xl"
            >
               
               {/* Header */}
               <div className="flex justify-between items-center p-6 border-b border-brand-border bg-brand-card shadow-sm z-10 shrink-0">
                  <h2 className="text-xl font-extrabold flex items-center gap-3 text-[#1c1917] tracking-tight">
                     <div className="w-10 h-10 rounded-full bg-[#F3C4D6]/30 text-[#e95e8e] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5" />
                     </div>
                     P&M {teamType}
                  </h2>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-brand-bg text-brand-muted hover:text-black hover:bg-[#EBE0D5] rounded-xl transition-colors border border-transparent hover:border-brand-border"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>

               {/* Messages Feed */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {messages.map((msg, index) => {
                    const isMe = msg.sender.toLowerCase() === userName.toLowerCase();
                    
                    return (
                       <motion.div 
                          key={msg.id} 
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                       >
                          
                          {/* Name / Time label */}
                          <div className={`flex items-baseline gap-2 mb-1.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                             <span className="text-[10px] font-extrabold text-brand-muted tracking-wider uppercase">{isMe ? "You" : msg.sender}</span>
                             <span className="text-[10px] text-brand-muted/70 font-bold">{msg.time}</span>
                          </div>

                          {/* Chat Bubble */}
                          <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] shadow-sm border ${
                              isMe 
                              ? 'bg-[#1c1917] text-white border-black rounded-tr-sm' 
                              : 'bg-white text-[#1c1917] border-brand-border/60 rounded-tl-sm'
                          }`}>
                             <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          </div>
                          
                       </motion.div>
                    );
                 })}
                 <div ref={endOfMessagesRef} />
               </div>

               {/* Input Bottom Bar */}
               <div className="p-6 bg-brand-card border-t border-brand-border shrink-0 z-10">
                  <form onSubmit={handleSend} className="flex gap-3 relative">
                     <div className="flex-1 relative">
                        <input 
                          type="text" 
                          placeholder={`Message the ${teamType}...`}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full bg-[#F5EAE1] border border-brand-border py-4 pl-5 pr-4 rounded-xl font-bold outline-none ring-offset-2 ring-offset-brand-card focus:ring-2 focus:ring-[#8C7B6E] transition-all text-sm"
                        />
                     </div>
                     <button 
                       type="submit" 
                       disabled={!inputValue.trim()}
                       className="px-6 bg-[#1c1917] text-[#E6D4AA] rounded-xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center group"
                     >
                        <Send className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                     </button>
                  </form>
               </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
