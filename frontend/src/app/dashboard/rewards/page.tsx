'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Trophy, 
  Target, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Loader2,
  ChevronRight,
  Gift
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RewardsPage() {
  const { firebaseToken: token } = useAuthStore();
  const [rewardData, setRewardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/homeowner/rewards`, { headers })
      .then(r => r.json())
      .then(data => setRewardData(data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#4D5443] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-[#2D3128]">Economic Outlook</h1>
        <p className="text-[#7A7D74] font-medium text-lg">Monthly performance summary based on segregation habits</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Eligibility Status */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {/* Eligibility Card */}
          <div className={cn(
            "rounded-none p-10 border transition-all text-center space-y-6 flex flex-col items-center justify-center",
            rewardData?.rewardsEligible ? "bg-white border-[#E5E2D9]" : "bg-red-50 border-red-100"
          )}>
            <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-[0.2em]">Current Status</p>
            <div className={cn(
              "w-20 h-20 rounded-none flex items-center justify-center shadow-lg",
              rewardData?.rewardsEligible ? "bg-[#4D5443] shadow-[#4D5443]/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {rewardData?.rewardsEligible 
                ? <CheckCircle2 className="w-10 h-10 text-white" /> 
                : <XCircle className="w-10 h-10 text-white" />
              }
            </div>
            
            <div>
              <h3 className="text-xl font-black text-[#2D3128]">
                {rewardData?.rewardsEligible ? 'Incentive Eligible' : 'Fine Applicable'}
              </h3>
              <p className="text-xs text-[#7A7D74] font-medium mt-2">
                {rewardData?.improperCount ?? 0} / 3 Improper Marks
              </p>
            </div>

            {!rewardData?.rewardsEligible && (
              <div className="bg-white/60 p-4 rounded-none border border-red-100 flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-red-700 uppercase leading-relaxed tracking-tight">
                  Threshold exceeded. Incremental fines now apply until the end of the month.
                </p>
              </div>
            )}

            <button 
              onClick={() => setShowLearnMore(true)}
              className="mt-4 bg-[#F5F4F0] px-6 py-3 rounded-none font-black text-[9px] uppercase tracking-widest text-[#4D5443] hover:bg-[#EBE9E0] transition-colors flex items-center gap-2"
            >
              Learn about rewards <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Projection Card */}
          <div className="rounded-none bg-[#EBE9E0] p-10 border border-[#D9D7CE] text-center space-y-6 flex flex-col items-center justify-center">
             <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-[0.2em]">Projected Monthly Outcome</p>
             <div className="flex flex-col items-center">
                <span className={cn(
                   "text-6xl font-black tracking-tighter",
                   rewardData?.outcomeType === 'reward' ? "text-[#4D5443]" : "text-red-600"
                )}>
                   {rewardData?.outcomeType === 'reward' ? '+' : '-'}₹{rewardData?.predictedAmount ?? 0}
                </span>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest mt-4 px-4 py-1.5",
                  rewardData?.outcomeType === 'reward' ? "bg-[#4D5443] text-white" : "bg-red-600 text-white"
                )}>
                  {rewardData?.outcomeType === 'reward' ? 'Projected Reward' : 'Projected Fine'}
                </p>
             </div>
             <p className="text-[10px] font-bold text-[#7A7D74] uppercase max-w-[200px]">
                {rewardData?.outcomeType === 'reward' 
                  ? 'Maintain < 3 improper marks to receive this reward.' 
                  : 'Fines increase by ₹20 for each additional improper mark.'}
             </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-8 bg-white rounded-none p-10 border border-[#E5E2D9] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-[#2D3128]">Transaction History</h3>
          </div>

          {rewardData?.segregationHistory?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F5F4F0]/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F4F0]">
                  {rewardData.segregationHistory.map((tx: any, i: number) => (
                    <tr key={i} className="group hover:bg-[#F5F4F0]/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#2D3128]">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                        <p className="text-[10px] text-[#7A7D74] font-medium">{format(new Date(tx.date), 'hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border",
                          tx.status === 'proper' 
                            ? "bg-green-50 border-green-100 text-green-700" 
                            : "bg-red-50 border-red-100 text-red-600"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-lg text-[#7A7D74]/30">
                        ₹0.00
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="bg-[#F5F4F0] p-6 rounded-none">
                <Wallet className="w-12 h-12 text-[#7A7D74]/30" />
              </div>
              <p className="text-[#7A7D74] font-bold text-lg">No reward transactions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#2D3128]/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg p-10 border border-[#E5E2D9] shadow-2xl rounded-none relative"
            >
              <button 
                onClick={() => setShowLearnMore(false)}
                className="absolute top-6 right-6 text-[#7A7D74] hover:text-red-500 font-bold transition-colors"
                title="Close"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#EBE9E0] rounded-none inline-block">
                  <Gift className="w-6 h-6 text-[#4D5443]" />
                </div>
                <h3 className="text-2xl font-black text-[#2D3128]">Reward System</h3>
              </div>
              
              <div className="space-y-6 text-[#4D5443]">
                <div>
                  <h4 className="text-sm font-black text-[#7A7D74] uppercase tracking-widest mb-1">Monthly Reward</h4>
                  <p className="text-base font-medium leading-relaxed">
                    Maintain consistency! If you receive <strong className="text-green-600 font-black">less than 3 improper marks</strong> in a month, you will receive a monthly incentive of <strong className="font-black text-[#2D3128]">₹30.00</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#7A7D74] uppercase tracking-widest mb-1">Incremental Fines</h4>
                  <p className="text-base font-medium leading-relaxed">
                    Failing to segregate waste impacts the environment. 
                    Receiving <strong className="text-red-500 font-black">3 improper marks</strong> triggers a base fine of <strong className="font-black text-red-600">₹100</strong>. 
                    Each additional improper mark beyond the third strike increases the fine by <strong className="font-black text-red-600">₹20</strong>.
                  </p>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-[#E5E2D9]">
                <button 
                  onClick={() => setShowLearnMore(false)}
                  className="w-full bg-[#4D5443] text-white py-4 font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all rounded-none"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, darkText, border }: any) {
  return (
    <div className={cn(
      "rounded-none p-8 space-y-4 transition-all hover:scale-[1.02]",
      color,
      border && "border border-[#E5E2D9]"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-none flex items-center justify-center shadow-sm",
        darkText ? "bg-[#F5F4F0]" : "bg-white/10"
      )}>
        <Icon className={cn("w-6 h-6", darkText ? "text-[#4D5443]" : "text-white")} />
      </div>
      <div>
        <p className={cn("text-[10px] font-black uppercase tracking-widest", darkText ? "text-[#7A7D74]" : "text-white/60")}>{label}</p>
        <h2 className={cn("text-3xl font-black mt-1", darkText ? "text-[#2D3128]" : "text-white")}>{value}</h2>
        <p className={cn("text-xs font-medium mt-1", darkText ? "text-[#7A7D74]" : "text-white/40")}>{sub}</p>
      </div>
    </div>
  );
}
