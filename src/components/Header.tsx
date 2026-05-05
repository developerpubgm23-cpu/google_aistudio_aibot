import { Sparkles, Bot, Activity } from "lucide-react";
import { getTgUser } from "../lib/telegram";
import { useState, useEffect } from "react";

export const Header = () => {
  const user = getTgUser();
  const [ping, setPing] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 15) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="U" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tighter text-white uppercase italic">DEVELOPER AI</h1>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
              Active
            </span>
            <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
              <Activity className="w-2.5 h-2.5" />
              {ping}ms
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span className="text-[10px] font-bold text-white tracking-wider">PREMIUM</span>
      </div>
    </header>
  );
};
