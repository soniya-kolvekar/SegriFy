'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  Plus,
  IndianRupee,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import Link from 'next/link';
import RazorpayPayment from '@/components/RazorpayPayment';

interface Request {
  _id: string;
  itemType: string;
  quantity: number;
  estimatedAmount: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Paid';
  createdAt: string;
}

export default function BusinessDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { firebaseToken, user } = useAuthStore();

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/business/requests', {
        headers: { 'Authorization': `Bearer ${firebaseToken}` }
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseToken]);

  useEffect(() => {
    setMounted(true);
    fetchRequests();
  }, [fetchRequests]);

  const handlePaymentSuccess = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/business/requests/${requestId}/pay`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        await fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('Payment update error:', err);
    }
  };

  // Dynamic calculations
  const totalQuantity = requests.reduce((sum, req) => sum + Number(req.quantity || 0), 0);
  
  const acceptedRequests = requests.filter(req => req.status === 'Accepted').length;
  // If no requests exist yet, it's 100% compliant. Otherwise (Accepted / Total) * 100
  const complianceScore = requests.length === 0 ? 100 : Math.round((acceptedRequests / requests.length) * 100);

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: FileText, color: 'text-brand-primary', bg: 'bg-brand-secondary' },
    { label: 'Sustainability Impact', value: `${totalQuantity.toFixed(1)} kg`, icon: BarChart3, color: 'text-brand-primary', bg: 'bg-brand-secondary' },
    { label: 'Compliance Score', value: `${complianceScore}%`, icon: CheckCircle2, color: 'text-brand-primary', bg: 'bg-brand-secondary' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-50 text-green-700';
      case 'Rejected': return 'bg-red-50 text-red-700';
      case 'Paid': return 'bg-green-600 text-white';
      default: return 'bg-brand-secondary text-brand-primary/60';
    }
  };

  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">
          <span>Dashboard</span>
          <Plus className="w-2 h-2" />
          <span>Overview</span>
        </div>
        <h1 className="text-4xl font-heading font-black text-brand-primary uppercase">Business Waste Management Portal</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Table Section */}
        <div className="lg:col-span-12 bg-white border border-brand-muted shadow-none p-0 overflow-hidden rounded-none">
          <div className="p-8 border-b border-brand-muted flex justify-between items-center bg-brand-bg/30">
            <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight flex items-center gap-3">
              <FileText className="w-5 h-5 text-brand-primary/40" />
              Recent Requests
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-secondary/50 text-brand-primary/40 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-8 py-4">Request ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Waste Type</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-muted">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center font-bold text-brand-primary/40 uppercase tracking-widest text-xs">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center font-bold text-brand-primary/40 uppercase tracking-widest text-xs">No records found.</td></tr>
                ) : requests.map((req) => (
                  <tr key={req._id} className="hover:bg-brand-bg/50 transition-colors group">
                    <td className="px-8 py-6 font-black text-brand-primary text-sm">#REQ-{req._id.substring(18).toUpperCase()}</td>
                    <td className="px-6 py-6 text-xs font-bold text-brand-primary/60">
                      {mounted ? new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
                    </td>
                    <td className="px-6 py-6 font-bold text-brand-primary text-sm">{req.itemType}</td>
                    <td className="px-6 py-6 font-black text-brand-primary text-sm">{req.quantity} kg</td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-current ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedRequest(req)}
                        className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest hover:text-brand-primary transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats Grid at Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-brand-secondary/50 p-8 border border-brand-muted shadow-none flex flex-col gap-4 group hover:bg-white transition-colors">
            <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-brand-primary">{stat.value}</p>
              <stat.icon className="w-8 h-8 text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md border border-brand-muted p-10 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest mb-1">Request Details</p>
                <h3 className="text-2xl font-black text-brand-primary uppercase">#REQ-{selectedRequest._id.substring(18).toUpperCase()}</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-brand-primary/40 hover:text-brand-primary transition-colors font-black">CLOSE</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">Type</p>
                  <p className="font-bold text-brand-primary">{selectedRequest.itemType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">Quantity</p>
                  <p className="font-bold text-brand-primary">{selectedRequest.quantity} kg</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">Estimated Value</p>
                <p className="text-xl font-black text-brand-primary">₹{selectedRequest.estimatedAmount.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">Current Status</p>
                <p className="font-black text-brand-primary uppercase tracking-widest text-sm underline underline-offset-4 decoration-2 decoration-brand-accent">{selectedRequest.status}</p>
              </div>
            </div>

            {selectedRequest.status === 'Accepted' && (
              <RazorpayPayment 
                amount={selectedRequest.estimatedAmount}
                buttonText="Proceed to Payment"
                className="w-full bg-brand-primary text-white py-4 font-black uppercase tracking-widest text-sm hover:brightness-110 transition-all"
                onSuccess={(data) => {
                  handlePaymentSuccess(selectedRequest._id);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
