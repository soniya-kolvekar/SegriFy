'use client';

import React, { useState, useMemo } from 'react';
import { Building2, Tag, CheckCircle2, XCircle, Clock, CreditCard, Truck, ChevronRight, Scale, Calendar as CalendarIcon, DollarSign } from 'lucide-react';

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'tracking'>('pending');
  
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, name: 'GreenEarth Composts', type: 'Organic', quantity: '500 KG', pickupDate: '24 / 10 / 2024', incentive: 250 },
    { id: 2, name: 'PlasticRevive Lab', type: 'Plastic', quantity: '200 KG', pickupDate: '26 / 10 / 2024', incentive: 180 },
    { id: 3, name: 'BioFuel Tech', type: 'Biomass', quantity: '1000 KG', pickupDate: '28 / 10 / 2024', incentive: 600 },
  ]);

  const [trackedPickups, setTrackedPickups] = useState([
    { id: 101, name: 'EcoPaper Mill', type: 'Paper', paymentStatus: 'PAID', pickupDate: '25 / 10 / 2024', logistics: 'IN TRANSIT', amount: 150 }
  ]);

  // Dynamic Analytics Calculation
  const analytics = useMemo(() => {
    const pendingSettlementCount = trackedPickups.filter(p => p.paymentStatus === 'AWAITING').length;
    const pickupsTodayCount = trackedPickups.filter(p => p.pickupDate.includes('25 / 10')).length; // Mock logic for "today"
    const totalVolume = trackedPickups.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      pendingSettlement: `${pendingSettlementCount} Requests`,
      pickupsToday: `${pickupsTodayCount} Today`,
      totalVolume: `₹${totalVolume.toLocaleString('en-IN')}`
    };
  }, [trackedPickups]);

  const handleApprove = (req: any) => {
    setPendingRequests(prev => prev.filter(p => p.id !== req.id));
    setTrackedPickups(prev => [{
      id: Math.floor(Math.random() * 1000),
      name: req.name,
      type: req.type,
      paymentStatus: 'AWAITING',
      pickupDate: req.pickupDate,
      logistics: 'PROCESSING',
      amount: req.incentive
    }, ...prev]);
    setActiveTab('tracking');
  };

  const handleReject = (id: number) => {
    setPendingRequests(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white p-10 border border-[#E5E1D8] shadow-sm">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-2xl font-black text-brand-primary tracking-tight">Business Material Management</h3>
            <p className="text-sm font-medium text-gray-400 mt-1">Review incoming collection requests and monitor logistics fulfillment.</p>
          </div>
          
          <div className="flex bg-[#F0EDE7]">
            <button onClick={() => setActiveTab('pending')} className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}>
              Requests ({pendingRequests.length})
            </button>
            <button onClick={() => setActiveTab('tracking')} className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tracking' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}>
              Logistics ({trackedPickups.length})
            </button>
          </div>
        </div>

        {activeTab === 'pending' ? (
          <div className="grid grid-cols-2 gap-8">
            {pendingRequests.map((biz) => (
              <div key={biz.id} className="bg-[#F9F7F2] p-8 border border-[#E5E1D8] flex flex-col group hover:border-brand-primary transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white flex items-center justify-center text-brand-primary border border-gray-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-brand-primary">{biz.name}</h4>
                      <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        <Tag className="w-3 h-3" />
                        {biz.type}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 border border-gray-100 shadow-sm">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Incentive</p>
                    <p className="text-sm font-black text-brand-primary">₹{biz.incentive}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Quantity Requested</p>
                      <p className="text-sm font-bold text-brand-primary">{biz.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Preferred Date</p>
                      <p className="text-sm font-bold text-brand-primary">{biz.pickupDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <button onClick={() => handleApprove(biz)} className="flex-1 bg-brand-primary text-white py-4 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 hover:bg-[#3d5a4a] transition-colors">
                    Submit Approval
                  </button>
                  <button onClick={() => handleReject(biz.id)} className="flex-1 bg-white text-gray-400 py-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
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
                {trackedPickups.map((pickup) => (
                  <tr key={pickup.id} className="group hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-8 py-8 flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-[#E5E1D8] flex items-center justify-center text-brand-primary">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-brand-primary text-sm">{pickup.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pickup.type}</p>
                        </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${pickup.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className={`text-[10px] font-black tracking-widest uppercase ${pickup.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                          {pickup.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-8 font-bold text-sm text-gray-600">{pickup.pickupDate}</td>
                    <td className="px-8 py-8">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/10">
                        <Truck className="w-3 h-3" />
                        {pickup.logistics}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-right font-black text-brand-primary text-sm">₹{pickup.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytics Mini-Panel - NOW DYNAMIC */}
      <div className="grid grid-cols-3 gap-8">
        {[
          { label: 'Pending Settlement', value: analytics.pendingSettlement, icon: CreditCard, color: 'text-orange-500' },
          { label: 'Pickups Scheduled', value: analytics.pickupsToday, icon: Clock, color: 'text-brand-primary' },
          { label: 'Total Volume (MTD)', value: analytics.totalVolume, icon: CheckCircle2, color: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 border border-[#E5E1D8] flex justify-between items-center shadow-sm transition-all">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-2xl font-black text-brand-primary">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>
    </div>
  );
}
