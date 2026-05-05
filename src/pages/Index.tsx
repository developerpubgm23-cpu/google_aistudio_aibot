import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { BottomNav, Tab } from "../components/BottomNav";
import { ChatView } from "../components/ChatView";
import { ModelsView } from "../components/ModelsView";
import { PlansView } from "../components/PlansView";
import { SettingsView } from "../components/SettingsView";
import { initTelegram } from "../lib/telegram";
import { ensureAuth } from "../lib/firebase";
import { Loader2 } from "lucide-react";

export const Index = () => {
  const [tab, setTab] = useState<Tab>("chat");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initTelegram();
    ensureAuth().then(() => setIsReady(true)).catch(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-slate-200 overflow-hidden">
      <Header />
      <main className="flex-1 min-h-0 relative overflow-hidden">
        {/* Main Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="h-full w-full relative z-10 flex flex-col">
          {tab === "chat" && <ChatView />}
          {tab === "models" && <ModelsView />}
          {tab === "plans" && <PlansView />}
          {tab === "settings" && <SettingsView />}
        </div>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
};

export default Index;
