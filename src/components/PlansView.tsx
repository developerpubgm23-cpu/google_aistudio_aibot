import { useState } from "react";
import { CreditCard, Star, Check, RefreshCw, Zap } from "lucide-react";
import { createStarsInvoice, createCheckoutLink } from "../lib/api";
import { getTgUser, haptic, tg } from "../lib/telegram";

export const PlansView = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    { id: "free", name: "Free", price: "0 UZS", desc: "Basic AI access", features: ["Limited daily chat", "Standard models"], color: "blue" },
    { id: "premium", name: "Premium", price: "19,990 UZS", desc: "For power users", features: ["Faster models", "Voice interaction", "Unlimited chat"], color: "cyan", amount: 19990 },
    { id: "professional", name: "Professional", price: "49,990 UZS", desc: "Maximum power", features: ["Llama 3 70B & Vision", "24/7 Priority support", "Experimental features"], color: "purple", amount: 49990 },
  ];

  const handlePlanSelection = async (plan: typeof plans[0]) => {
    if (plan.id === "free") return alert("Siz hozirda Free ta'rifidasiz");
    
    setLoading(plan.id);
    haptic("medium");
    const user = getTgUser();
    const id = `ORDER_${Date.now()}`;
    const email = user?.username ? `${user.username}@t.me` : `id${user?.id || "unknown"}@t.me`;
    
    try {
      // Send payment link via bot directly or return URL
      const res = await createCheckoutLink(plan.amount || 0, id, email);
      if (res.paymentUrl) {
         tg()?.openLink(res.paymentUrl);
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent px-6 py-10 space-y-10 overflow-y-auto scrollbar-hide relative">
      <div className="absolute inset-0 immersive-glow pointer-events-none" />
      
      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Subscription</h2>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Select your computational power</p>
      </div>

      <div className="grid gap-6 relative z-10">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-[#0f1115] border ${plan.id === "free" ? "border-white/5" : "border-cyan-500/20"} rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden group transition-all hover:bg-[#15171c]`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100 uppercase">{plan.name}</h3>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{plan.desc}</p>
              </div>
              <span className="text-2xl font-black text-white italic">{plan.price.split(' ')[0]} <span className="text-[10px] uppercase not-italic text-slate-500">{plan.price.split(' ')[1]}</span></span>
            </div>
            
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[11px] font-bold text-slate-300 uppercase tracking-tight">
                  <div className={`w-5 h-5 rounded-lg bg-${plan.color}-500/10 border border-${plan.color}-500/20 flex items-center justify-center`}>
                    <Check className={`w-3 h-3 text-${plan.color}-400`} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handlePlanSelection(plan)}
              disabled={loading !== null || plan.id === "free"}
              className="w-full bg-white text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {loading === plan.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                plan.id === "free" ? "Current Plan" : `Upgrade to ${plan.name}`
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
