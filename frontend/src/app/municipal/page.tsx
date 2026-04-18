'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Activity, 
  Map, 
  Search,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useAuthStore } from '@/context/useAuthStore';

export default function MunicipalDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = useAuthStore.getState().firebaseToken;
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/analytics/city', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-12 text-brand-primary font-bold animate-pulse">Scanning City Data...</div>;

  const complianceData = [
    { name: 'Proper', value: analytics?.properCount || 0 },
    { name: 'Improper', value: analytics?.improperCount || 0 },
  ];

  const wasteData = analytics?.wasteDistribution?.map((item: any) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    amount: item.count
  })) || [];

  const COLORS = ['#2D4C3E', '#F97316'];

  return (
    <div className="p-10 space-y-12 bg-brand-bg font-sans antialiased">
      {/* City Overview */}
      <div className="flex justify-between items-center border-b border-brand-muted pb-8">
        <div>
          <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-[0.2em] mb-2">Central Command</p>
          <h1 className="text-4xl font-black text-brand-primary uppercase tracking-tight">City Analytics</h1>
          <p className="text-brand-primary/60 mt-2 text-sm font-bold uppercase tracking-tight">Real-time monitoring of waste management across city zones.</p>
        </div>
        <button className="bg-brand-primary text-white px-8 py-4 rounded-none font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-none border border-brand-muted hover:brightness-110 transition-all">
          <Map className="w-4 h-4" />
          Live Zone Map
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Scans', value: analytics?.totalRecords || 0, delta: '+12%', icon: Trash2 },
          { label: 'Compliance Rate', value: `${analytics?.properRate || 0}%`, delta: '+5.4%', icon: CheckCircle2 },
          { label: 'Active Complaints', value: '24', delta: '-8%', icon: Activity },
          { label: 'Active Residents', value: analytics?.activeUsers || 0, delta: '+120', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-none border border-brand-muted shadow-none relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-brand-primary/10 w-12 h-12 rounded-none border border-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-black text-brand-primary uppercase tracking-tighter">{stat.value}</p>
                <span className="text-green-600 text-[10px] font-black mb-1.5 uppercase">{stat.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white p-10 rounded-none border border-brand-muted shadow-none">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight mb-10 flex items-center gap-3 border-b border-brand-muted pb-6">
            <BarChart3 className="w-5 h-5 text-brand-primary/40" />
            Waste Distribution
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5C5D47', fontSize: 10, fontWeight: 900}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5C5D47', fontSize: 10, fontWeight: 900}} />
                <Tooltip 
                  contentStyle={{borderRadius: '0', border: '1px solid #5C5D47', background: '#F9F7F2'}}
                />
                <Bar dataKey="amount" fill="#5C5D47" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-10 rounded-none border border-brand-muted shadow-none">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight mb-10 border-b border-brand-muted pb-6">Compliance Rate</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#5C5D47' : '#F9F7F2'} stroke="#5C5D47" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-6">
             <div className="text-center">
                <p className="text-3xl font-black text-brand-primary">{analytics?.properCount || 0}</p>
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Properly Segregated</p>
             </div>
             <div className="text-center">
                <p className="text-3xl font-black text-brand-primary/20">{analytics?.improperCount || 0}</p>
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Improper Mixed</p>
             </div>
          </div>
        </div>
      </div>

      {/* Resident Table */}
      <div className="bg-white rounded-none border border-brand-muted shadow-none overflow-hidden">
        <div className="p-10 flex justify-between items-center border-b border-brand-muted bg-brand-bg/50">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight">Residential Compliance</h2>
          <div className="flex bg-white px-5 py-3 rounded-none w-96 border border-brand-muted">
            <Search className="w-4 h-4 text-brand-primary/20" />
            <input type="text" placeholder="Search House ID..." className="bg-transparent border-none focus:ring-0 px-3 text-[10px] font-black uppercase tracking-widest w-full placeholder:text-brand-primary/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-secondary/50 text-brand-primary/40 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Resident Identity</th>
                <th className="px-6 py-6">ID</th>
                <th className="px-6 py-6">Zone</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6">Score</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-muted">
              {[
                { name: 'Adarsh Kumar', id: '#4521', zone: 'Sector 4', status: 'Eligible', points: '1250' },
                { name: 'Sarah Joseph', id: '#8922', zone: 'Old Town', status: 'Warning', points: '840' },
                { name: 'Vikram Singh', id: '#1230', zone: 'Sector 2', status: 'Ineligible', points: '120' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-brand-bg/50 transition-colors group">
                  <td className="px-10 py-6 font-black text-brand-primary text-xs uppercase">{row.name}</td>
                  <td className="px-6 py-6 text-[10px] font-bold text-brand-primary/60 uppercase">{row.id}</td>
                  <td className="px-6 py-6 text-[10px] font-bold text-brand-primary/60 uppercase">{row.zone}</td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border border-current ${
                      row.status === 'Eligible' ? 'bg-green-50 text-green-700' : 
                      row.status === 'Warning' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-black text-brand-primary text-xs uppercase">{row.points}</td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline underline-offset-4">View Records</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
