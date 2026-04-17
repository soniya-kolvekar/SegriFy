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
                'Authorization': `Bearer ${token}`,
                'x-municipal-id': 'your_super_secret_key' // Fallback simulated secret for frontend
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
    <div className="p-10 space-y-12 bg-brand-bg">
      {/* City Overview */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-black text-brand-primary">City Analytics</h1>
          <p className="text-brand-muted-foreground mt-2 font-medium">Real-time monitoring of waste management across city zones.</p>
        </div>
        <button className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform">
          <Map className="w-5 h-5" />
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
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-brand-secondary/30 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-brand-bg w-12 h-12 rounded-2xl flex items-center justify-center text-brand-primary mb-4 group-hover:bg-brand-accent group-hover:text-white transition-colors">
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-brand-muted-foreground font-medium text-sm">{stat.label}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-heading font-black text-brand-primary">{stat.value}</p>
                <span className="text-green-600 text-xs font-black mb-1.5">{stat.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
          <h2 className="text-2xl font-heading font-bold text-brand-primary mb-10 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-brand-accent" />
            Waste Type Distribution
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4A4A4A', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#4A4A4A', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" fill="#2D4C3E" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
          <h2 className="text-2xl font-heading font-bold text-brand-primary mb-10">Compliance Rate</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-6">
             <div className="text-center">
                <p className="text-3xl font-black text-brand-primary">{analytics?.properCount || 0}</p>
                <p className="text-sm font-medium text-brand-muted-foreground">Properly Segregated</p>
             </div>
             <div className="text-center">
                <p className="text-3xl font-black text-brand-accent">{analytics?.improperCount || 0}</p>
                <p className="text-sm font-medium text-brand-muted-foreground">Improper Mixed</p>
             </div>
          </div>
        </div>
      </div>

      {/* Resident Table */}
      <div className="bg-white rounded-[3rem] border border-brand-secondary/30 shadow-sm overflow-hidden">
        <div className="p-10 flex justify-between items-center border-b border-brand-bg">
          <h2 className="text-2xl font-heading font-bold text-brand-primary">Residential Compliance</h2>
          <div className="flex bg-brand-bg px-5 py-3 rounded-2xl w-96 border border-brand-secondary/20">
            <Search className="w-5 h-5 text-brand-muted-foreground" />
            <input type="text" placeholder="Search by House ID or Name..." className="bg-transparent border-none focus:ring-0 px-3 text-sm w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-primary text-sm font-bold uppercase tracking-wider">
                <th className="px-10 py-6">Resident</th>
                <th className="px-6 py-6">House ID</th>
                <th className="px-6 py-6">Zone</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6">Points</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-bg">
              {[
                { name: 'Adarsh Kumar', id: '#4521', zone: 'Sector 4', status: 'Eligible', points: '1250' },
                { name: 'Sarah Joseph', id: '#8922', zone: 'Old Town', status: 'Warning', points: '840' },
                { name: 'Vikram Singh', id: '#1230', zone: 'Sector 2', status: 'Ineligible', points: '120' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-brand-bg/30 transition-colors group">
                  <td className="px-10 py-6 font-bold text-brand-primary">{row.name}</td>
                  <td className="px-6 py-6 font-medium text-brand-muted-foreground">{row.id}</td>
                  <td className="px-6 py-6 font-medium text-brand-muted-foreground">{row.zone}</td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${
                      row.status === 'Eligible' ? 'bg-green-100 text-green-700' : 
                      row.status === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 font-black text-brand-primary">{row.points}</td>
                  <td className="px-10 py-6 text-right">
                    <button className="text-brand-accent font-bold hover:underline">View Details</button>
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
