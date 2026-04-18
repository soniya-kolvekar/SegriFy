'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Building2, Tag, CheckCircle2, XCircle, Clock, CreditCard, Truck, ChevronRight, Scale, Calendar as CalendarIcon, DollarSign, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function BusinessPage() {
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  const API = (envApi && envApi !== '/') ? envApi : 'http://localhost:5000';
  const { firebaseToken: token } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'tracking'>('pending');
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/municipal/business/requests`, { headers });
      const data = await res.json();
      if (res.ok) setAllRequests(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pendingRequests = useMemo(() => 
    allRequests.filter(r => r.status === 'Pending'), 
  [allRequests]);

  const trackedPickups = useMemo(() => 
    allRequests.filter(r => r.status === 'Accepted' || r.status === 'Paid'), 
  [allRequests]);

  // Dynamic Analytics Calculation
  const analytics = useMemo(() => {
    const totalVolume = trackedPickups.reduce((acc, curr) => acc + (curr.estimatedAmount || 0), 0);

    return {
      pendingSettlement: `${pendingRequests.length} Requests`,
      pickupsToday: `${trackedPickups.length} Total`,
      totalVolume: `₹${totalVolume.toLocaleString('en-IN')}`
    };
  }, [trackedPickups, pendingRequests]);

  const handleAction = async (id: string, status: 'Accepted' | 'Rejected') => {
    try {
      const res = await fetch(`${API}/api/municipal/business/requests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests();
        if (status === 'Accepted') setActiveTab('tracking');
      }
    } catch (err) {
      console.error('Action error:', err);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 pb-20">
      <div className="bg-white p-6 lg:p-10 border border-[#E5E1D8] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 lg:mb-10 gap-6">
          <div>
            <h3 className="text-xl lg:text-2xl font-black text-brand-primary tracking-tight uppercase">Business Materials</h3>
            <p className="text-xs font-medium text-gray-400 mt-1">Review requests and monitor logistics fulfillment.</p>
          </div>
          
          <div className="flex bg-[#F0EDE7] w-full lg:w-auto">
            <button onClick={() => setActiveTab('pending')} className={`flex-1 lg:flex-none px-6 lg:px-8 py-3 lg:py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}>
              Requests ({pendingRequests.length})
            </button>
            <button onClick={() => setActiveTab('tracking')} className={`flex-1 lg:flex-none px-6 lg:px-8 py-3 lg:py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tracking' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}>
              Logistics ({trackedPickups.length})
            </button>
          </div>
        </div>

        {activeTab === 'pending' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {pendingRequests.map((biz: any) => (
              <div key={biz._id} className="bg-[#F9F7F2] p-6 lg:p-8 border border-[#E5E1D8] flex flex-col group hover:border-brand-primary transition-all">
                <div className="flex justify-between items-start mb-6 lg:mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white flex items-center justify-center text-brand-primary border border-gray-100">
                      <Building2 className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm lg:text-lg text-brand-primary uppercase tracking-tight">{biz.userId?.name || 'Business Entity'}</h4>
                      <span className="flex items-center gap-2 text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        <Tag className="w-3 h-3" />
                        {biz.itemType}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white px-3 lg:px-4 py-1.5 lg:py-2 border border-gray-100 shadow-sm shrink-0 text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Incentive</p>
                    <p className="text-xs lg:text-sm font-black text-brand-primary">₹{biz.estimatedAmount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantity Requested</p>
                      <p className="text-sm font-bold text-brand-primary">{biz.quantity} Tons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entry Date</p>
                      <p className="text-sm font-bold text-brand-primary">{new Date(biz.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button onClick={() => handleAction(biz._id, 'Accepted')} className="flex-1 bg-brand-primary text-white py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:bg-[#3d5a4a] transition-colors">
                    Submit Approval
                  </button>
                  <button onClick={() => handleAction(biz._id, 'Rejected')} className="flex-1 bg-white text-gray-400 py-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                  <th className="px-8 py-6">Business Entity</th>
                  <th className="px-8 py-6">Payment Status</th>
                  <th className="px-8 py-6">Scheduled Date</th>
                  <th className="px-8 py-6">Logistics Flow</th>
                  <th className="px-8 py-6 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE7]">
                {trackedPickups.map((pickup: any) => (
                  <tr key={pickup._id} className="group hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-8 py-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-[#E5E1D8] flex items-center justify-center text-brand-primary">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-brand-primary text-sm">{pickup.userId?.name || 'Entity'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pickup.itemType}</p>
                        </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${pickup.status === 'Paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className={`text-[10px] font-black tracking-widest uppercase ${pickup.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {pickup.status === 'Paid' ? 'PAYMENT DONE' : 'ACCEPTED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 font-bold text-sm text-gray-600">{new Date(pickup.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-8">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/10">
                        <Truck className="w-3 h-3" />
                        {pickup.status === 'Paid' ? 'READY FOR PICKUP' : 'PROCESSING'}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right font-black text-brand-primary text-sm">₹{pickup.estimatedAmount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Mini-Panel - NOW DYNAMIC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[
          { label: 'Pending Settlement', value: analytics.pendingSettlement, icon: CreditCard, color: 'text-orange-500' },
          { label: 'Pickups Scheduled', value: analytics.pickupsToday, icon: Clock, color: 'text-brand-primary' },
          { label: 'Total Volume (MTD)', value: analytics.totalVolume, icon: CheckCircle2, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 lg:p-8 border border-[#E5E1D8] flex justify-between items-center shadow-sm transition-all">
            <div>
              <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-xl lg:text-2xl font-black text-brand-primary">{stat.value}</p>
            </div>
            <stat.icon className={`w-6 h-6 lg:w-8 lg:h-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>
    </div>
  );
}
