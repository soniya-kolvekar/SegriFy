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

export default function HomeownerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-8 lg:p-12 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black text-brand-primary">Welcome back, {stats?.user?.name || 'Citizen'}!</h1>
          <p className="text-brand-muted-foreground mt-2 text-lg">Your waste management overview is looking great this month.</p>
        </div>
        <div className="bg-brand-primary text-white p-6 rounded-3xl shadow-xl flex items-center gap-6 min-w-[280px]">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Trophy className="w-8 h-8 text-brand-accent" />
          </div>
          <div>
            <p className="text-brand-secondary/80 text-sm font-medium uppercase tracking-wider">Total Points</p>
            <p className="text-4xl font-heading font-black">{stats?.user?.points || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Proper Segregation', value: stats?.user?.eligibilityStatus ? 'Eligible' : 'Ineligible', icon: Trash2, color: stats?.user?.eligibilityStatus ? 'bg-green-500' : 'bg-red-400' },
          { label: 'City Rank', value: '#45', icon: TrendingUp, color: 'bg-blue-500' },
          { label: 'Household Status', value: stats?.user?.houseId || 'N/A', icon: ArrowUpRight, color: 'bg-brand-accent' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-brand-secondary/30 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className={`${stat.color} p-4 rounded-2xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ChevronRight className="w-6 h-6 text-brand-secondary group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="mt-8 text-brand-muted-foreground font-medium">{stat.label}</p>
            <p className="text-3xl font-heading font-bold text-brand-primary mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Calendar & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Segregation Calendar Placeholder */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-heading font-bold text-brand-primary flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-brand-accent" />
              Segregation History (Current Month)
            </h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Proper</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span>Improper</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 31 }).map((_, i) => {
               // This is a simple mock for the calendar visualization using fetched history
               const day = i + 1;
               const record = stats?.recentRecords?.find((r: any) => new Date(r.date).getDate() === day);
               const statusClass = record ? (record.status === 'proper' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-500 border-red-200') : 'bg-brand-bg text-brand-primary/20 border-brand-secondary/10';
               
               return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all border ${statusClass} hover:scale-105 cursor-pointer`}
                >
                  {day}
                </div>
               );
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-brand-primary mb-8">Recent Segregation Logs</h2>
            <div className="space-y-6">
              {stats?.recentRecords?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.status === 'proper' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-primary text-xs capitalize">{item.wasteType} Waste</p>
                      <p className="text-[10px] text-brand-muted-foreground">{new Date(item.date).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-black text-sm ${item.status === 'proper' ? 'text-green-600' : 'text-red-400'}`}>
                    {item.status === 'proper' ? '+10' : '+0'}
                  </span>
                </div>
              ))}
              {(!stats?.recentRecords || stats.recentRecords.length === 0) && (
                <p className="text-sm text-brand-muted-foreground text-center py-10">No recent activity found.</p>
              )}
            </div>
          </div>
          
          <div className="bg-brand-primary p-8 rounded-[3rem] shadow-xl text-white">
             <h3 className="font-heading font-bold text-lg mb-2 text-brand-accent">Worker Scanner Code</h3>
             <p className="text-brand-secondary/60 text-xs mb-4">Show this to the sanitation worker upon collection</p>
             <div className="bg-white p-4 rounded-2xl flex items-center justify-center">
                <p className="text-3xl font-black text-brand-primary tracking-widest">{stats?.user?.qrToken || 'TOKEN'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
