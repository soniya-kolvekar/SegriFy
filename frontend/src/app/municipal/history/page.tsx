'use client';

import React, { useState } from 'react';
import { History as HistoryIcon, Download, CreditCard, Activity, Shield } from 'lucide-react';

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const history = [
    { id: 'LOG-452', activity: 'Material Sale', entity: 'GreenEarth Composts', amount: 'Rs. 5,200', date: 'Oct 24, 2024, 09:41 AM', status: 'PAID', type: 'PAYMENT' },
    { id: 'LOG-451', activity: 'System Audit', entity: 'System', amount: '-', date: 'Oct 23, 2024, 11:20 PM', status: 'SUCCESS', type: 'SYSTEM' },
    { id: 'LOG-450', activity: 'Hazardous Disposal', entity: 'Tech Hub HQ', amount: 'Rs. 12,000', date: 'Oct 23, 2024, 02:15 PM', status: 'AWAITING', type: 'PAYMENT' },
    { id: 'LOG-449', activity: 'Bulk Purchase', entity: 'EcoPaper Mill', amount: 'Rs. 3,100', date: 'Oct 22, 2024, 10:05 AM', status: 'PAID', type: 'PAYMENT' },
    { id: 'LOG-448', activity: 'Security Scan', entity: 'Admin_Alpha', amount: '-', date: 'Oct 22, 2024, 08:30 AM', status: 'SECURE', type: 'SYSTEM' },
  ];

  const filteredHistory = activeFilter === 'ALL' 
    ? history 
    : history.filter(h => h.type === activeFilter);

  return (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue (Log)</p>
            <p className="text-2xl font-black text-brand-primary">Rs. 20,300</p>
          </div>
          <CreditCard className="w-8 h-8 text-brand-primary opacity-20" />
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pending Payments</p>
            <p className="text-2xl font-black text-orange-500">Rs. 12,000</p>
          </div>
          <Activity className="w-8 h-8 text-orange-500 opacity-20" />
        </div>
        <div className="bg-white p-8 border border-[#E5E1D8] shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Security Status</p>
            <p className="text-2xl font-black text-green-600">Secure</p>
          </div>
          <Shield className="w-8 h-8 text-green-600 opacity-20" />
        </div>
      </div>

      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden flex flex-col">
        <div className="p-10 flex justify-between items-center border-b border-[#F0EDE7]">
          <div>
            <h3 className="text-2xl font-black text-brand-primary tracking-tight">Audit & Transaction History</h3>
            <p className="text-sm font-medium text-gray-400 mt-1">Comprehensive log of administrative actions and financial settlements.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === 'ALL' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-[#F9F7F2] text-gray-400 border-gray-100'}`}
            >
              All Logs
            </button>
            <button 
              onClick={() => setActiveFilter('PAYMENT')}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === 'PAYMENT' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-[#F9F7F2] text-gray-400 border-gray-100'}`}
            >
              Payments
            </button>
            <button className="bg-[#F0EDE7] p-2 text-brand-primary hover:bg-brand-primary hover:text-white transition-all ml-4">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                <th className="px-10 py-6">Log ID</th>
                <th className="px-8 py-6">Activity / Entity</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-10 py-6 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredHistory.map((log, i) => (
                <tr key={i} className="group hover:bg-[#F9F7F2] transition-colors">
                  <td className="px-10 py-8 font-bold text-sm text-gray-400 group-hover:text-brand-primary transition-colors">{log.id}</td>
                  <td className="px-8 py-8">
                    <p className="font-bold text-sm text-[#2D2D2D]">{log.activity}</p>
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">{log.entity}</p>
                  </td>
                  <td className="px-8 py-8">
                    <span className={`text-sm font-black ${log.type === 'PAYMENT' ? 'text-brand-primary' : 'text-gray-300'}`}>
                      {log.amount}
                    </span>
                  </td>
                  <td className="px-8 py-8 text-[11px] font-bold text-gray-400 uppercase tracking-tight">{log.date}</td>
                  <td className="px-10 py-8 text-right">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                      log.status === 'PAID' || log.status === 'SUCCESS' || log.status === 'SECURE' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {log.status}
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
