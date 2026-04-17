'use client';

import React, { useState } from 'react';
import { MoreVertical, Filter, Download, X } from 'lucide-react';

export default function ComplaintsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');

  const allComplaints = [
    { id: 'ASF-9021', type: 'Missed Collection', location: 'Ward 12, Green Avenue', status: 'ESCALATED', color: 'bg-red-50 text-red-600' },
    { id: 'ASF-8842', type: 'Illegal Dumping', location: 'Ward 4, West End', status: 'IN PROGRESS', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'ASF-8701', type: 'Bin Repair Request', location: 'Ward 21, North Plaza', status: 'RESOLVED', color: 'bg-green-50 text-green-600' },
    { id: 'ASF-8654', type: 'Overflowing Bin', location: 'Sector 4, Main Street', status: 'PENDING', color: 'bg-gray-100 text-gray-600' },
    { id: 'ASF-8601', type: 'Smell Complaint', location: 'Ward 9, South Gate', status: 'IN PROGRESS', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'ASF-8542', type: 'Improper Sorting', location: 'Ward 15, East Park', status: 'NEW', color: 'bg-blue-50 text-blue-600' },
  ];

  const filterOptions = ['ALL', 'NEW', 'IN PROGRESS', 'PENDING', 'ESCALATED', 'RESOLVED'];

  const filteredComplaints = activeFilter === 'ALL' 
    ? allComplaints 
    : allComplaints.filter(c => c.status === activeFilter);

  return (
    <div className="space-y-10">
      <div className="bg-white border border-[#E5E1D8] shadow-sm overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="p-10 flex justify-between items-center border-b border-[#F0EDE7]">
          <div>
            <h3 className="text-2xl font-black text-brand-primary tracking-tight">Citizen Complaints</h3>
            <p className="text-sm font-medium text-gray-400 mt-1">Full list of reported issues and service tickets</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 transition-all flex items-center gap-2 ${showFilters ? 'bg-brand-primary text-white' : 'bg-[#F0EDE7] text-brand-primary hover:bg-[#E5E1D8]'}`}
            >
              <Filter className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
            </button>
            <button className="p-3 bg-[#F0EDE7] text-brand-primary hover:bg-[#E5E1D8] transition-all">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        {showFilters && (
          <div className="px-10 py-6 bg-[#F9F7F2] border-b border-[#F0EDE7] flex items-center justify-between animate-in slide-in-from-top duration-300">
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setActiveFilter(opt)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${
                    activeFilter === opt 
                      ? 'bg-brand-primary text-white border-brand-primary' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-brand-primary/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setActiveFilter('ALL'); setShowFilters(false); }}
              className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#F0EDE7] bg-[#F9F7F2]">
                <th className="px-10 py-6">ID</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">Location</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE7]">
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((row, i) => (
                  <tr key={i} className="group hover:bg-[#F9F7F2] transition-colors">
                    <td className="px-10 py-8 font-bold text-sm text-gray-400 group-hover:text-brand-primary transition-colors">{row.id}</td>
                    <td className="px-8 py-8 font-bold text-sm text-[#2D2D2D]">{row.type}</td>
                    <td className="px-8 py-8">
                       <p className="text-sm font-bold text-[#2D2D2D]">{row.location.split(',')[0]}</p>
                       <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{row.location.split(',')[1]}</p>
                    </td>
                    <td className="px-8 py-8">
                       <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter ${row.color}`}>
                          {row.status}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <MoreVertical className="w-6 h-6 text-gray-300 ml-auto cursor-pointer hover:text-brand-primary transition-colors" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">No complaints found for "{activeFilter}" status</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
