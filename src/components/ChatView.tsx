import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatWithAI, Message } from "../lib/api";
import { haptic, getTgUser } from "../lib/telegram";
import { getUserProfile } from "../services/userService";

export const ChatView = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Assalomu alaykum! DEVELOPER AI Assistantga xush kelibsiz. Groq LPU™ texnologiyasi yordamida tezkor javoblar olishingiz mumkin." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("llama-3.3-70b-versatile");
  const [files, setFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = getTgUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      haptic("medium");
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    haptic("light");
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const profile = await getUserProfile(user.id.toString());
        if (profile?.selectedModel) {
          setSelectedModel(profile.selectedModel);
        }
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;

    let content = input;
    if (files.length > 0) {
      content += `\n\n📎 Yuklangan fayllar: ${files.map(f => f.name).join(", ")}`;
    }

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFiles([]);
    setIsLoading(true);
    haptic("light");

    try {
      const response = await chatWithAI([...messages, userMessage], selectedModel);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      haptic("success");
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.";
      if (error.response?.status === 401) {
        errorMsg = "API kaliti noto'g'ri yoki sozlanmagan. Iltimos Secrets panelini tekshiring.";
      }
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      haptic("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      <div className="absolute inset-0 immersive-glow pointer-events-none" />
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide relative z-10"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center shadow-lg ${
                msg.role === "user" ? "bg-blue-600" : "bg-cyan-500/20 border border-cyan-500/30"
              }`}>
                {msg.role === "user" ? (
                  <span className="text-[10px] font-bold text-white uppercase">Me</span>
                ) : (
                  <span className="text-[10px] font-bold text-cyan-400 uppercase">AI</span>
                )}
              </div>
              
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl shadow-xl backdrop-blur-sm transition-all ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-900/10"
                    : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 shrink-0 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-[10px] font-bold text-cyan-400">AI</span>
              </div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl rounded-tl-none backdrop-blur-sm">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/40 backdrop-blur-3xl border-t border-white/5 relative z-20">
        <div className="max-w-3xl mx-auto relative">
          
          {/* File Previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-wrap gap-2 mb-3 px-1"
              >
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white font-bold uppercase tracking-wider group">
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="text-slate-500 hover:text-red-400">
                      &times;
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center group">
            <label className="absolute left-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors">
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
              <div className="p-2 rounded-full hover:bg-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414A4 4 0 0016.586 3H12" /></svg>
              </div>
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Xabar yozing..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-cyan-500/50 text-sm transition-all shadow-inner group-hover:bg-white/[0.07]"
            />
            <div className="absolute right-2 flex gap-1 items-center">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-white hover:bg-cyan-400 text-black px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
