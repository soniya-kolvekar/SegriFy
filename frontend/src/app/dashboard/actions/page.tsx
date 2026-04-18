'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  Clock,
  Banknote,
  ShieldAlert,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { format } from 'date-fns';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ActionsPage() {
  const { user, firebaseToken: token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'fines' | 'complaints'>('fines');
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [complaintForm, setComplaintForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [payingFine, setPayingFine] = useState<string | null>(null); // holds fineId

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    if (!token) return;
    try {
      const [compRes, finRes] = await Promise.all([
        fetch(`${API}/api/homeowner/complaints`, { headers }).then(r => r.json()),
        fetch(`${API}/api/homeowner/fines`, { headers }).then(r => r.json())
      ]);
      setComplaints(compRes.complaints || []);
      setFines(finRes.fines || []);
    } catch (err) {
      console.error('Error fetching actions data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/homeowner/complaint`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg('✅ Complaint sent to Municipal Authority!');
        setComplaintForm({ subject: '', description: '' });
        loadData(); // Refresh list
      } else {
        setSubmitMsg(`❌ ${data.message}`);
      }
    } catch {
      setSubmitMsg('❌ Network error. Try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(''), 4000);
    }
  };

  const handlePayFine = async (fine: any) => {
    try {
      setPayingFine(fine._id);
      
      // 1. Create order
      const orderRes = await fetch(`${API}/api/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fine.amount, receipt: `fine_${fine._id}` })
      });
      const order = await orderRes.json();

      // 2. Open Razorpay Window
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SegriFy Municipal Fines',
        description: `Violation Resolution: ${fine.violationType}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch(`${API}/api/homeowner/fines/pay`, {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fineId: fine._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              // Success! Reload data.
              loadData();
            } else {
              alert(`Payment verification failed: ${verifyData.message}`);
            }
          } catch (err) {
            alert('Failed to contact server for verification.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#4D5443'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment gateway.');
    } finally {
      setPayingFine(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#4D5443] animate-spin" />
      </div>
    );
  }

  const pendingFines = fines.filter(f => f.status === 'pending');
  const totalDue = pendingFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[#2D3128]">Citizen Actions</h1>
          <p className="text-[#7A7D74] font-medium text-lg">Manage public liabilities and file municipal grievances.</p>
        </div>
        
        {/* Total Liability Card */}
        {totalDue > 0 && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-none flex items-center gap-4 shadow-sm">
            <div className="bg-white p-2 border border-red-200">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">Total Outstanding Due</p>
               <p className="text-3xl font-black text-red-700">₹{totalDue.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 border-b border-[#E5E2D9]">
        <button 
          onClick={() => setActiveTab('fines')}
          className={cn(
            "pb-4 px-2 font-black text-sm uppercase tracking-widest transition-colors",
            activeTab === 'fines' ? "border-b-2 border-[#4D5443] text-[#4D5443]" : "text-[#7A7D74] hover:text-[#2D3128]"
          )}
        >
          Outstanding Fines
        </button>
        <button 
          onClick={() => setActiveTab('complaints')}
          className={cn(
            "pb-4 px-2 font-black text-sm uppercase tracking-widest transition-colors",
            activeTab === 'complaints' ? "border-b-2 border-[#4D5443] text-[#4D5443]" : "text-[#7A7D74] hover:text-[#2D3128]"
          )}
        >
          Complaint Registry
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'fines' ? (
          <motion.div key="fines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
             {fines.length === 0 ? (
               <div className="bg-white border border-[#E5E2D9] p-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#F5F4F0] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-[#4D5443]" />
                  </div>
                  <h3 className="text-xl font-black text-[#2D3128]">Clear Record</h3>
                  <p className="text-[#7A7D74] font-medium text-sm">You have absolutely zero civic violations or pending fines!</p>
               </div>
             ) : (
               fines.map(fine => (
                 <div key={fine._id} className={cn(
                   "bg-white border p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all",
                   fine.status === 'pending' ? "border-red-200 border-l-4 border-l-red-500 shadow-sm" : "border-[#E5E2D9] border-l-4 border-l-green-500 opacity-60 hover:opacity-100"
                 )}>
                   <div className="flex items-start gap-4 flex-1">
                      <div className={cn(
                        "p-3",
                        fine.status === 'pending' ? "bg-red-50" : "bg-green-50"
                      )}>
                        {fine.status === 'pending' ? <ShieldAlert className="w-6 h-6 text-red-600" /> : <CheckCircle2 className="w-6 h-6 text-green-600" />}
                      </div>
                      <div>
                        <h4 className={cn("text-xl font-black", fine.status === 'pending' ? 'text-red-700' : 'text-[#4D5443]')}>{fine.violationType}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs font-bold text-[#7A7D74] uppercase tracking-widest flex items-center gap-1">
                             <Clock className="w-3 h-3" /> Issued: {format(new Date(fine.issuedAt), 'dd MMM yyyy')}
                          </p>
                          <span className={cn(
                            "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 border",
                            fine.status === 'pending' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'
                          )}>
                             {fine.status}
                          </span>
                        </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                      <div className="text-3xl font-black text-[#2D3128] font-mono">₹{fine.amount.toFixed(2)}</div>
                      {fine.status === 'pending' ? (
                        <button 
                          onClick={() => handlePayFine(fine)}
                          disabled={payingFine === fine._id}
                          className="bg-[#2D3128] text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#4D5443] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {payingFine === fine._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                          Pay via Razorpay
                        </button>
                      ) : (
                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                          Settled: {fine.resolvedAt ? format(new Date(fine.resolvedAt), 'dd MMM yyyy') : 'Recently'}
                        </p>
                      )}
                   </div>
                 </div>
               ))
             )}
          </motion.div>
        ) : (
          <motion.div key="complaints" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* New Complaint Form */}
            <div className="lg:col-span-5 bg-white border border-[#E5E2D9] p-8 h-fit shadow-sm">
               <h3 className="text-xl font-black text-[#2D3128] mb-6 flex items-center gap-2">
                 <MessageSquare className="w-5 h-5 text-[#4D5443]" /> New Grievance
               </h3>
               <form onSubmit={handleComplaintSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1">Subject</label>
                    <input
                      type="text" 
                      required 
                      value={complaintForm.subject}
                      onChange={e => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                      placeholder="e.g. Collection skipped for 2 days"
                      className="w-full bg-[#F5F4F0] border border-transparent focus:border-[#4D5443] rounded-none py-3 px-4 text-sm font-semibold outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      rows={5} 
                      required 
                      value={complaintForm.description}
                      onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                      placeholder="Please provide specific details..."
                      className="w-full bg-[#F5F4F0] border border-transparent focus:border-[#4D5443] rounded-none py-3 px-4 text-sm font-semibold outline-none resize-none transition-all"
                    />
                  </div>
                  {submitMsg && (
                    <div className={cn("text-[10px] font-black uppercase tracking-widest p-3 border", submitMsg.startsWith('✅') ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200")}>
                      {submitMsg}
                    </div>
                  )}
                  <button
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#4D5443] text-white py-3 rounded-none font-black text-xs uppercase tracking-widest hover:bg-[#3D4435] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit File</>}
                  </button>
               </form>
            </div>

            {/* Complaints Ledger */}
            <div className="lg:col-span-7 space-y-6">
              {complaints.length === 0 ? (
                <div className="bg-[#F5F4F0] border border-[#E5E2D9] p-12 text-center text-[#7A7D74] font-bold text-sm">
                  You have not filed any grievances.
                </div>
              ) : (
                complaints.map(comp => (
                  <div key={comp._id} className="bg-white border border-[#E5E2D9] p-6 space-y-4 relative shadow-sm">
                     <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 border absolute right-6 top-6",
                        comp.status === 'resolved' ? "bg-green-50 text-green-700 border-green-200" : 
                        comp.status === 'in_progress' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-[#F5F4F0] text-[#7A7D74] border-[#D9D7CE]"
                     )}>
                        {comp.status.replace('_', ' ')}
                     </span>
                     <div className="pr-24">
                       <h4 className="text-lg font-black text-[#2D3128]">{comp.subject}</h4>
                       <p className="text-[10px] font-bold text-[#7A7D74] uppercase tracking-widest mt-1">Logged: {format(new Date(comp.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                     </div>
                     <p className="text-sm text-[#4D5443] font-medium leading-relaxed bg-[#F5F4F0]/50 p-4 border border-[#E5E2D9]">
                        {comp.description}
                     </p>
                     {comp.resolution && (
                       <div className="bg-green-50 border border-green-100 p-4 border-l-4 border-l-green-500 mt-4">
                         <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Municipal Response</p>
                         <p className="text-sm text-green-900 font-bold">{comp.resolution}</p>
                       </div>
                     )}
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
