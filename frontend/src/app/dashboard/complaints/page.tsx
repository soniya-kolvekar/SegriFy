'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MessageSquare, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005';

export default function ComplaintsPage() {
  const { firebaseToken: token } = useAuthStore();
  const [complaint, setComplaint] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/homeowner/complaint`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg('✅ Complaint sent to Municipal Authority!');
        setComplaint({ subject: '', description: '' });
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

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-[#2D3128]">Complaints & Support</h1>
        <p className="text-[#7A7D74] font-medium text-lg">Direct communication with your Municipal Authority</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Info Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#4D5443] rounded-none p-10 text-white relative overflow-hidden h-fit">
            <div className="relative z-10 space-y-6">
              <div className="bg-white/10 w-16 h-16 rounded-none flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black leading-tight">We're here to<br/>help you.</h3>
              <p className="text-white/70 text-sm leading-relaxed font-medium">
                Submit issues regarding collection delays, equipment damage, or any other waste-related concerns. 
                Your feedback helps us maintain a cleaner community.
              </p>
              
              <div className="space-y-4 pt-4">
                <StatusStep icon={CheckCircle2} text="Submit your complaint" />
                <StatusStep icon={Clock} text="Municipal Officer reviews it" />
                <StatusStep icon={ChevronRight} text="Resolution & feedback" />
              </div>
            </div>
            <MessageSquare className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
          </div>

          <div className="bg-white rounded-none p-8 border border-[#E5E2D9] flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-none">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black text-[#7A7D74] uppercase tracking-widest">Public Safety</p>
              <p className="text-sm font-bold text-[#2D3128]">For emergencies, contact 101 immediately.</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white rounded-none p-12 shadow-2xl shadow-[#4D5443]/5 border border-[#E5E2D9]">
          <h3 className="text-2xl font-black text-[#2D3128] mb-8 flex items-center gap-3">
            <Send className="w-6 h-6 text-[#4D5443]" />
            New Complaint Form
          </h3>
          
          <form onSubmit={handleComplaintSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1 block">Subject of Complaint</label>
              <input
                type="text" 
                required 
                value={complaint.subject}
                onChange={e => setComplaint({ ...complaint, subject: e.target.value })}
                placeholder="e.g. Collection skipped for 2 days"
                className="w-full bg-[#F5F4F0] border-none rounded-none py-5 px-6 text-sm font-semibold focus:ring-2 focus:ring-[#4D5443]/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest ml-1 block">Detailed Description</label>
              <textarea
                rows={6} 
                required 
                value={complaint.description}
                onChange={e => setComplaint({ ...complaint, description: e.target.value })}
                placeholder="Please provide details including location and time if applicable..."
                className="w-full bg-[#F5F4F0] border-none rounded-none py-5 px-6 text-sm font-semibold focus:ring-2 focus:ring-[#4D5443]/20 outline-none resize-none transition-all"
              />
            </div>

            {submitMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "text-sm font-bold px-6 py-4 rounded-none border", 
                  submitMsg.startsWith('✅') 
                    ? "bg-green-50 border-green-100 text-green-700" 
                    : "bg-red-50 border-red-100 text-red-600"
                )}
              >
                {submitMsg}
              </motion.div>
            )}

            <button
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#4D5443] text-white py-5 rounded-none font-black text-lg shadow-xl shadow-[#4D5443]/20 hover:bg-[#3D4435] hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {submitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
              ) : (
                <><Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Submit to Authority</>
              )}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-[#7A7D74] font-black uppercase tracking-widest mt-8">
            Your complaint ID will be generated upon submission
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusStep({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-white/20 p-1.5 rounded-none">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-bold text-white/90">{text}</span>
    </div>
  );
}
