import { User, Bell, Shield, Info, LogOut, Globe } from "lucide-react";
import { getTgUser, closeApp } from "../lib/telegram";

export const SettingsView = () => {
  const user = getTgUser();

  const menuItems = [
    { icon: Bell, label: "Bildirishnomalar", value: "Active" },
    { icon: Shield, label: "Maxfiylik", value: "Public" },
    { icon: Info, label: "Ilova haqida", value: "v1.2.4" },
    { icon: User, label: "Telegram ID", value: user?.id?.toString() || "N/A" },
    { icon: Globe, label: "Til", value: user?.language_code?.toUpperCase() || "UZ" },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent px-6 py-10 space-y-10 overflow-y-auto scrollbar-hide relative">
       <div className="absolute inset-0 immersive-glow pointer-events-none" />

      <div className="flex flex-col items-center gap-5 py-6 relative z-10 transition-all">
        <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-[0_0_30px_rgba(6,182,212,0.2)] group hover:scale-105 transition-transform duration-500 cursor-pointer">
          <div className="w-full h-full rounded-[14px] bg-[#050505] flex items-center justify-center overflow-hidden">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-cyan-400" />
            )}
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-white italic tracking-tight">
            {user?.first_name} {user?.last_name || "Assistant User"}
          </h3>
          <p className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest">@{user?.username || "ai_power_user"}</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mx-2 mb-4">Account Settings</h2>
        {menuItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">{item.label}</span>
            </div>
            <span className="text-[11px] font-black text-cyan-500 uppercase italic bg-cyan-500/10 px-3 py-1 rounded-full">{item.value}</span>
          </div>
        ))}

        <div className="pt-6">
          <button
            onClick={closeApp}
            className="w-full flex items-center justify-between p-5 bg-red-500/10 border border-red-500/20 rounded-2xl group active:scale-[0.98] transition-all hover:bg-red-500/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/20">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm font-bold text-red-500 uppercase tracking-wide">Ilovani yopish</span>
            </div>
          </button>
        </div>
      </div>

      <div className="pt-12 text-center relative z-10">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Engine: Groq LPUser Interface v1.2</p>
      </div>
    </div>
  );
};
