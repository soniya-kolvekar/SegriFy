'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export default function RewardsPage() {
  const { firebaseToken: token } = useAuthStore();
  const [rewardData, setRewardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-4xl font-black text-[#2D3128]">Rewards & Achievements</h1>
        <p className="text-[#7A7D74] font-medium text-lg">Earn points for every proper waste segregation</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Wallet} 
          label="Total Points" 
          value={rewardData?.totalPoints ?? 0} 
          sub="Available for redemption"
          color="bg-[#4D5443]"
        />
        <StatCard 
          icon={Target} 
          label="This Month's Accuracy" 
          value={`${Math.round(((rewardData?.totalCount - rewardData?.improperCount) / (rewardData?.totalCount || 1)) * 100)}%`} 
          sub={`${rewardData?.improperCount ?? 0} improper segregations`}
          color="bg-[#EBE9E0]"
          darkText
        />
        <StatCard 
          icon={Trophy} 
          label="Rank" 
          value="Green Citizen" 
          sub="Top 15% in your area"
          color="bg-white"
          darkText
          border
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Eligibility Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className={cn(
            "rounded-none p-10 border transition-all h-fit text-center space-y-6",
            rewardData?.rewardsEligible ? "bg-white border-[#E5E2D9]" : "bg-red-50 border-red-100"
          )}>
            <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-[0.2em]">Monthly Eligibility</p>
            <div className={cn(
              "w-24 h-24 rounded-none mx-auto flex items-center justify-center shadow-lg",
              rewardData?.rewardsEligible ? "bg-[#4D5443] shadow-[#4D5443]/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {rewardData?.rewardsEligible 
                ? <CheckCircle2 className="w-12 h-12 text-white" /> 
                : <XCircle className="w-12 h-12 text-white" />
              }
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-[#2D3128]">
                {rewardData?.rewardsEligible ? 'Eligible for Rewards' : 'Rewards Blocked'}
              </h3>
              <p className="text-sm text-[#7A7D74] font-medium mt-2">
                {rewardData?.improperCount ?? 0} / 3 improper marks allowed per month
              </p>
            </div>

            {!rewardData?.rewardsEligible && (
              <div className="bg-white/60 p-5 rounded-none border border-red-100 flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-700 uppercase leading-relaxed tracking-tight">
                  You have exceeded the monthly limit of improper marks. Points will not be awarded for the rest of this month.
                </p>
              </div>
            )}

            <button className="w-full bg-[#F5F4F0] py-4 rounded-none font-black text-xs uppercase tracking-widest text-[#4D5443] hover:bg-[#EBE9E0] transition-colors flex items-center justify-center gap-2">
              Learn about rewards <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#4D5443] rounded-none p-8 text-white relative overflow-hidden">
            <Gift className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
            <div className="relative z-10">
              <h4 className="text-xl font-black">Coming Soon</h4>
              <p className="text-white/60 text-sm mt-1 font-medium leading-relaxed">Redeem your points for local shop discounts and municipal tax rebates.</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-8 bg-white rounded-none p-10 border border-[#E5E2D9] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-[#2D3128]">Transaction History</h3>
            <div className="flex items-center gap-2 bg-[#F5F4F0] px-4 py-2 rounded-none">
              <TrendingUp className="w-4 h-4 text-[#4D5443]" />
              <span className="text-xs font-black text-[#4D5443] uppercase tracking-widest">+12% from last month</span>
            </div>
          </div>

          {rewardData?.segregationHistory?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F5F4F0]/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-[#7A7D74] uppercase tracking-widest text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F4F0]">
                  {rewardData.segregationHistory.map((tx: any, i: number) => (
                    <tr key={i} className="group hover:bg-[#F5F4F0]/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-[#2D3128]">{format(new Date(tx.date), 'dd MMM yyyy')}</p>
                        <p className="text-[10px] text-[#7A7D74] font-medium">{format(new Date(tx.date), 'hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-[#4D5443] capitalize">{tx.wasteType}</td>
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
                      <td className={cn(
                        "px-6 py-5 text-right font-black text-lg",
                        tx.status === 'proper' ? "text-[#4D5443]" : "text-[#7A7D74]/30"
                      )}>
                        {tx.status === 'proper' ? '+50' : '0'}
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
