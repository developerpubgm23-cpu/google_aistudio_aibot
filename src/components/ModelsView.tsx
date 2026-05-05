import { Zap, Shield, Cpu, Globe, RefreshCcw, Check } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTgUser, haptic } from "../lib/telegram";
import { getUserProfile, updateUserProfile, createUserProfile } from "../services/userService";

export const ModelsView = () => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const user = getTgUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groqRes = await axios.get("/api/models");
        setModels(groqRes.data.data || []);
        
        if (user?.id) {
          const profile = await getUserProfile(user.id.toString());
          if (profile) {
            setSelectedId(profile.selectedModel);
          } else {
            // Initial profile creation
            const initialModel = "llama-3.3-70b-versatile";
            setSelectedId(initialModel);
            await createUserProfile({
              uid: user.id.toString(),
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              photoUrl: user.photo_url,
              tier: "free",
              selectedModel: initialModel
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = async (modelId: string) => {
    if (!user?.id) return;
    setSelectedId(modelId);
    haptic("light");
    try {
      await updateUserProfile(user.id.toString(), { selectedModel: modelId });
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (id: string) => {
    if (id.includes("vision")) return Globe;
    if (id.includes("70b")) return Zap;
    if (id.includes("mixtral")) return Cpu;
    return Shield;
  };

  return (
    <div className="flex flex-col h-full bg-transparent px-6 py-10 space-y-8 overflow-y-auto scrollbar-hide relative">
      <div className="absolute inset-0 immersive-glow pointer-events-none" />
      
      <div className="space-y-2 relative z-10 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">AI Models</h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Available Groq Engines</p>
        </div>
        {loading && <RefreshCcw className="w-5 h-5 text-cyan-400 animate-spin mb-1" />}
      </div>

      <div className="grid gap-3 relative z-10">
        {models.map((model) => {
          const Icon = getIcon(model.id);
          const isSelected = selectedId === model.id;
          return (
            <button
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={`flex items-center gap-5 p-5 border rounded-2xl text-left transition-all group active:scale-[0.98] ${
                isSelected 
                  ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
                  : "bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.08]"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isSelected ? "text-cyan-400" : "text-slate-400"}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className={`font-bold uppercase text-sm tracking-wide truncate ${isSelected ? "text-white" : "text-slate-100"}`}>{model.id}</h4>
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-tighter mt-0.5">Developer: {model.owned_by}</p>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" : "bg-white/10"}`}>
                {isSelected && <Check className="w-3 h-3 text-black" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
