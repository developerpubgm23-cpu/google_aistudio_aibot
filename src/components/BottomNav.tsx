import { MessageSquare, LayoutGrid, CreditCard, Settings as SettingsIcon } from "lucide-react";

export type Tab = "chat" | "models" | "plans" | "settings";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export const BottomNav = ({ active, onChange }: BottomNavProps) => {
  const tabs = [
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "models", icon: LayoutGrid, label: "Models" },
    { id: "plans", icon: CreditCard, label: "Plans" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ] as const;

  return (
    <nav className="flex items-center justify-around px-2 py-3 bg-black/60 backdrop-blur-2xl border-t border-white/5 pb-8 relative z-50">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${
            active === id ? "text-cyan-400" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Icon className={`w-6 h-6 transition-transform ${active === id ? "scale-110" : "scale-100"}`} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] leading-none">{label}</span>
          {active === id && (
            <div className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          )}
        </button>
      ))}
    </nav>
  );
};
