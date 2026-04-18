'use client';

import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  Landmark, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2, 
  Clock, 
  Wallet,
  Users
} from 'lucide-react';

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GOV' | 'BIZ'>('ALL');

  const history = [
    { 
      id: 'TXN-90211', 
      type: 'Government Reward', 
      typeKey: 'GOV',
      from: 'Municipal Authority', 
      to: 'Homeowner: Rajesh Kumar', 
      amount: '₹450', 
      date: 'Oct 24, 2024, 09:41 AM', 
      status: 'Paid',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      icon: Users,
      direction: 'OUT'
    },
    { 
      id: 'TXN-90212', 
      type: 'Material Purchase', 
      typeKey: 'BIZ',
      from: 'GreenEarth Composts', 
      to: 'Municipal Authority', 
      amount: '₹12,200', 
      date: 'Oct 24, 2024, 10:15 AM', 
      status: 'Credited',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      icon: Building2,
      direction: 'IN'
    },
    { 
      id: 'TXN-90213', 
      type: 'Government Reward', 
      typeKey: 'GOV',
      from: 'Municipal Authority', 
      to: 'Homeowner: Priya Singh', 
      amount: '₹300', 
      date: 'Oct 24, 2024, 11:05 AM', 
      status: 'Paid',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      icon: Users,
      direction: 'OUT'
    },
    { 
      id: 'TXN-90214', 
      type: 'Material Purchase', 
      typeKey: 'BIZ',
      from: 'PlasticRevive Lab', 
      to: 'Municipal Authority', 
      amount: '₹8,500', 
      date: 'Oct 23, 2024, 11:20 PM', 
      status: 'Pending',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      icon: Building2,
      direction: 'IN'
    },
    { 
      id: 'TXN-90215', 
      type: 'Government Reward', 
      typeKey: 'GOV',
      from: 'Municipal Authority', 
      to: 'Homeowner: Amit Verma', 
      amount: '₹550', 
      date: 'Oct 23, 2024, 02:15 PM', 
      status: 'Paid',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      icon: Users,
      direction: 'OUT'
    },
    { 
      id: 'TXN-90216', 
      type: 'Material Purchase', 
      typeKey: 'BIZ',
      from: 'EcoPaper Mill', 
      to: 'Municipal Authority', 
      amount: '₹31,000', 
      date: 'Oct 22, 2024, 10:05 AM', 
      status: 'Credited',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      icon: Building2,
      direction: 'IN'
    },
  ];

  const filteredHistory = activeFilter === 'ALL' 
    ? history 
    : history.filter(h => h.typeKey === activeFilter);

  const downloadAuditReport = () => {
    // CSV Header
    const headers = ["Ref ID", "Category", "Source", "Destination", "Amount", "Timestamp", "Status"];
    
    // CSV Content
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map(txn => {
        return [
          txn.id,
          `"${txn.type}"`,
          `"${txn.from}"`,
          `"${txn.to}"`,
          `"${txn.amount}"`,
          `"${txn.date}"`,
          txn.status
        ].join(",");
      })
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Municipal_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Financial Audit Overview - NOW RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm">
          <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Material Revenue</p>
          <div className="flex items-center justify-between">
             <h2 className="text-xl lg:text-3xl font-black text-brand-primary tracking-tighter">₹51,700</h2>
             <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-50 text-blue-600 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 lg:w-5 lg:h-5" />
             </div>
          </div>
          <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 mt-4 uppercase">From Business Purchases</p>
        </div>
        
        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm">
          <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Rewards Disbursed</p>
          <div className="flex items-center justify-between">
             <h2 className="text-xl lg:text-3xl font-black text-orange-600 tracking-tighter">₹1,300</h2>
             <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-50 text-orange-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5" />
             </div>
          </div>
          <p className="text-[9px] lg:text-[10px] font-bold text-gray-400 mt-4 uppercase">To Homeowner Citizens</p>
        </div>

        <div className="bg-white p-6 lg:p-8 border border-[#E5E1D8] shadow-sm flex flex-col justify-center">
           <button 
            onClick={downloadAuditReport}
            className="bg-brand-primary text-white py-4 text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#3d5a4a] transition-all w-full"
           >
              <Download className="w-4 h-4" />
              Generate Audit Report
           </button>
        </div>
      </div>

      {/* Transaction Ledger - NOW RESPONSIVE */}
      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 lg:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-[#F0EDE7] gap-6">
          <div>
            <h3 className="text-xl lg:text-2xl font-black text-brand-primary tracking-tight uppercase">Audit History</h3>
            <p className="text-xs font-medium text-gray-400 mt-1">Monitoring the flow of material revenue and rewards.</p>
          </div>
          
          <div className="flex bg-[#F0EDE7] w-full lg:w-auto">
            <button 
              onClick={() => setActiveFilter('ALL')}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'ALL' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('GOV')}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'GOV' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}
            >
              Citizen Rewards
            </button>
            <button 
              onClick={() => setActiveFilter('BIZ')}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === 'BIZ' ? 'bg-brand-primary text-white' : 'text-gray-400 hover:text-brand-primary'}`}
            >
              Material Sales
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                <th className="px-10 py-6">Ref ID</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Source (From)</th>
                <th className="px-8 py-6">Destination (To)</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-10 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredHistory.map((txn) => (
                <tr key={txn.id} className="group hover:bg-[#F9F7F2] transition-colors">
                  <td className="px-10 py-8 font-bold text-xs text-gray-400 group-hover:text-brand-primary transition-colors">{txn.id}</td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 ${txn.bgColor} ${txn.color}`}>
                          <txn.icon className="w-4 h-4" />
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${txn.color}`}>
                          {txn.type}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                     <p className="font-bold text-sm text-[#2D2D2D]">{txn.from}</p>
                     {txn.direction === 'IN' && <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1 italic">Incoming Revenue</p>}
                  </td>
                  <td className="px-8 py-8">
                     <p className="font-bold text-sm text-[#2D2D2D]">{txn.to}</p>
                     {txn.direction === 'OUT' && <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-1 italic">Outgoing Reward</p>}
                  </td>
                  <td className="px-8 py-8">
                    <span className={`text-base font-black tracking-tight ${txn.direction === 'IN' ? 'text-brand-primary' : 'text-orange-600'}`}>
                      {txn.direction === 'OUT' && '- '}{txn.amount}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-xs font-bold text-gray-600 tracking-tight">{txn.date}</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border ${
                      txn.status === 'Paid' || txn.status === 'Credited'
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {txn.status}
                    </span>
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
