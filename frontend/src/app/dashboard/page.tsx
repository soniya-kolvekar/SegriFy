'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Trash2, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { useRealTime } from '@/hooks/useRealTime';
import { useRouter } from 'next/navigation';

export default function HomeownerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'business') {
      router.push('/dashboard/business');
    }
  }, [user, router]);

  const fetchStats = async () => {
    if (!user || !useAuthStore.getState().firebaseToken) return;
    try {
      const token = useAuthStore.getState().firebaseToken;
      const response = await fetch(`http://localhost:5000/api/dashboard/citizen/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Listen for real-time updates
  useRealTime((update) => {
    if (update.userId === user?.id) {
      fetchStats(); // Refresh stats when own data changes
    }
  });

  if (loading) return <div className="p-12 text-brand-primary font-bold animate-pulse">Loading Civic Stats...</div>;

  return (
    <div className="p-8 lg:p-12 space-y-12 font-sans antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-primary uppercase tracking-tight">Welcome back, {stats?.user?.name || 'Citizen'}!</h1>
          <p className="text-brand-primary/60 mt-2 text-lg font-bold uppercase tracking-tight">Your waste management overview is looking great this month.</p>
        </div>
        <div className="bg-brand-primary text-white p-6 rounded-none shadow-none border border-brand-muted flex items-center gap-6 min-w-[280px]">
          <div className="bg-white/10 p-4 rounded-none border border-white/20">
            <Trophy className="w-8 h-8 text-brand-accent" />
          </div>
          <div>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Total Points</p>
            <p className="text-4xl font-black">{stats?.user?.points || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Proper Segregation', value: stats?.user?.eligibilityStatus ? 'Eligible' : 'Ineligible', icon: Trash2, color: stats?.user?.eligibilityStatus ? 'bg-green-600' : 'bg-red-600' },
          { label: 'City Rank', value: '#45', icon: TrendingUp, color: 'bg-brand-primary' },
          { label: 'Household Status', value: stats?.user?.houseId || 'N/A', icon: ArrowUpRight, color: 'bg-brand-accent' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-none border border-brand-muted shadow-none hover:bg-brand-bg transition-colors group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className={`${stat.color} p-4 rounded-none text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ChevronRight className="w-6 h-6 text-brand-primary/20 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="mt-8 text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-black text-brand-primary mt-2 uppercase">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Calendar & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Segregation Calendar Placeholder */}
        <div className="lg:col-span-8 bg-white p-10 rounded-none border border-brand-muted shadow-none">
          <div className="flex justify-between items-center mb-10 border-b border-brand-muted pb-6">
            <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-brand-primary/40" />
              Segregation History
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <div className="w-3 h-3 rounded-none bg-green-600"></div>
                <span>Proper</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <div className="w-3 h-3 rounded-none bg-red-600"></div>
                <span>Improper</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {Array.from({ length: 31 }).map((_, i) => {
               const day = i + 1;
               const record = stats?.recentRecords?.find((r: any) => new Date(r.date).getDate() === day);
               const statusClass = record ? (record.status === 'proper' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200') : 'bg-brand-bg text-brand-primary/10 border-brand-muted/20';
               
               return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-none flex items-center justify-center text-xs font-black transition-all border ${statusClass} hover:brightness-95 cursor-pointer`}
                >
                  {day}
                </div>
               );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-none border border-brand-muted shadow-none">
            <h2 className="text-lg font-black text-brand-primary uppercase tracking-tight mb-8">Recent Logs</h2>
            <div className="space-y-6">
              {stats?.recentRecords?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-none border flex items-center justify-center ${item.status === 'proper' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black text-brand-primary text-[10px] uppercase tracking-wider">{item.wasteType} Waste</p>
                      <p className="text-[9px] font-bold text-brand-primary/40 uppercase">{mounted ? new Date(item.date).toLocaleDateString() : '...'}</p>
                    </div>
                  </div>
                  <span className={`font-black text-xs ${item.status === 'proper' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.status === 'proper' ? '+10' : '+0'}
                  </span>
                </div>
              ))}
              {(!stats?.recentRecords || stats.recentRecords.length === 0) && (
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest text-center py-10">No recent activity</p>
              )}
            </div>
          </div>
          
          <div className="bg-brand-primary p-8 rounded-none shadow-none text-white border border-brand-muted">
             <h3 className="font-black text-xs uppercase tracking-widest mb-2 text-brand-accent">Scanner Token</h3>
             <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-6 leading-tight">Present this identifier to the sanitation worker for verified collection</p>
             <div className="bg-white p-6 rounded-none flex items-center justify-center border border-white/20">
                <p className="text-3xl font-black text-brand-primary tracking-[0.3em] ml-2">{stats?.user?.qrToken || 'TOKEN'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
