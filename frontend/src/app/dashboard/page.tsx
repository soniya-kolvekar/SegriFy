'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, addMonths, subMonths, getDay
} from 'date-fns';
import {
  QrCode, AlertCircle, CheckCircle2, XCircle, Send,
  User, Home as HomeIcon, CreditCard, ChevronLeft,
  ChevronRight, MessageSquare, Calendar as CalendarIcon,
  Loader2, Trophy, Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter } from 'next/navigation';
import { useRealTime } from '@/hooks/useRealTime';

const cn = (...c: any[]) => c.filter(Boolean).join(' ');
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomeownerDashboard() {
  const { user, firebaseToken: token } = useAuthStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [calendarRecords, setCalendarRecords] = useState<any[]>([]);
  const [rewardData, setRewardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const router = useRouter();

  // Redirect if business
  useEffect(() => {
    if (user && user.role === 'business') {
      router.push('/dashboard/business');
    }
  }, [user, router]);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch profile
  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/api/homeowner/profile`, { headers }).then(r => r.json()),
      fetch(`${API}/api/homeowner/rewards`, { headers }).then(r => r.json()),
    ]).then(([profileRes, rewardRes]) => {
      setProfile(profileRes.user);
      setRewardData(rewardRes);
    }).finally(() => setLoading(false));
  }, [token]);

  // Fetch calendar when month changes
  const fetchCalendar = useCallback(() => {
    if (!token) return;
    const month = format(currentMonth, 'yyyy-MM');
    fetch(`${API}/api/homeowner/calendar?month=${month}`, { headers })
      .then(r => r.json())
      .then(data => setCalendarRecords(data.records || []));
  }, [currentMonth, token]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Real-time synchronization
  const handleRealTimeUpdate = useCallback((data: any) => {
    // Only refresh if the update belongs to THIS user
    if (data.userId === profile?._id || data.userId === user?.id) {
      console.log('Refreshing dashboard for real-time news...');
      // Re-fetch everything
      fetchCalendar();
      fetch(`${API}/api/homeowner/profile`, { headers }).then(r => r.json()).then(res => setProfile(res.user));
      fetch(`${API}/api/homeowner/rewards`, { headers }).then(r => r.json()).then(res => setRewardData(res));
    }
  }, [profile, user, token, API, fetchCalendar]);

  useRealTime(handleRealTimeUpdate);

  const getDayStatus = (date: Date) => {
    const rec = calendarRecords.find(r => isSameDay(new Date(r.date), date));
    if (!rec) return 'none';
    return rec.status; // 'proper' | 'improper'
  };

  const getSelectedRecord = () =>
    selectedDate ? calendarRecords.find(r => isSameDay(new Date(r.date), selectedDate)) : null;

  const downloadQR = () => {
    const canvas = document.getElementById('homeowner-qr') as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `SegriFy-QR-${profile?.houseId || 'Home'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = getDay(startOfMonth(currentMonth));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#4D5443] animate-spin" />
          <p className="text-[#7A7D74] font-bold text-sm uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">

      {/* ── 1. PROFILE ── */}
      <div className="grid grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-8 bg-[#EBE9E0] rounded-none p-10 border border-[#D9D7CE] flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1 space-y-6">
            <div>
              <p className="text-[9px] font-black text-[#7A7D74] uppercase tracking-[0.3em] mb-2">Citizen Profile</p>
              <h1 className="text-4xl font-black text-[#2D3128]">{profile?.name || user?.name || '—'}</h1>
              <p className="text-sm text-[#7A7D74] font-medium mt-1">{profile?.email || user?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <ProfileItem icon={HomeIcon} label="House / Flat No. (Primary Key)" value={profile?.houseId || 'Not set'} />
              <ProfileItem icon={CreditCard} label="Aadhaar (Masked)" value={profile?.maskedAadhaar || 'Not set'} />
              <ProfileItem icon={User} label="Role" value="Resident · Homeowner" />

            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 rounded-none shadow-lg border border-[#E5E2D9] text-center space-y-4 shrink-0 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-1">
              <p className="text-[9px] font-black text-[#7A7D74] uppercase tracking-widest">Your QR Code</p>
              <button 
                onClick={downloadQR}
                className="p-2 hover:bg-[#F5F4F0] rounded-none transition-colors group"
                title="Download QR for Printing"
              >
                <Download className="w-4 h-4 text-[#4D5443] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {profile?.qrPayload || profile?.qrToken ? (
              <div className="bg-[#F5F4F0] p-4 rounded-none">
                <QRCodeCanvas 
                  id="homeowner-qr"
                  value={profile.qrPayload || profile.qrToken} 
                  size={140} 
                  level="H"
                  includeMargin={true}
                  className="rounded-none border-2 border-slate-100"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-[#F5F4F0] rounded-none flex items-center justify-center">
                <QrCode className="w-16 h-16 text-[#4D5443]" />
              </div>
            )}
            
            <div className="space-y-1">
               <p className="text-[9px] font-black text-[#4D5443] uppercase tracking-widest">Scan to Verify</p>
               {profile?.qrToken && (
                 <p className="text-[10px] font-mono font-bold text-[#7A7D74]">{profile.qrToken}</p>
               )}
            </div>
          </div>
        </motion.div>

        {/* Reward Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-4 bg-white rounded-none p-10 border border-[#E5E2D9] flex flex-col items-center justify-center text-center space-y-5"
        >
          <p className="text-[9px] font-black text-[#7A7D74] uppercase tracking-[0.2em]">This Month · Reward Status</p>
          <div className={cn(
            "w-20 h-20 rounded-none flex items-center justify-center",
            rewardData?.rewardsEligible ? "bg-[#4D5443]" : "bg-red-50"
          )}>
            {rewardData?.rewardsEligible
              ? <CheckCircle2 className="w-10 h-10 text-white" />
              : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-[#2D3128]">
              {rewardData?.rewardsEligible ? 'Eligible for Rewards' : 'Rewards Blocked'}
            </h3>
            <p className="text-sm text-[#7A7D74] font-medium mt-1">
              {rewardData?.improperCount ?? 0} / 3 improper segregations
            </p>
          </div>
          {!rewardData?.rewardsEligible && (
            <div className="bg-red-50 p-4 rounded-none border border-red-100 flex items-start gap-2 text-left w-full">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-600 uppercase leading-relaxed">
                3+ improper marks this month. Rewards locked until next month.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 2. SEGREGATION CALENDAR ── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-none p-10 border border-[#E5E2D9]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-[#2D3128]">Segregation Calendar</h3>
              <p className="text-xs text-[#7A7D74] font-bold uppercase tracking-widest mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2.5 hover:bg-[#F5F4F0] rounded-none transition-colors"><ChevronLeft className="w-5 h-5 text-[#2D3128]" /></button>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2.5 hover:bg-[#F5F4F0] rounded-none transition-colors"><ChevronRight className="w-5 h-5 text-[#2D3128]" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[9px] font-black text-[#7A7D74] uppercase mb-2">{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => <div key={`p${i}`} />)}
            {days.map((day, i) => {
              const status = getDayStatus(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <motion.button
                  key={i} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                  className={cn(
                    "aspect-square rounded-none flex items-center justify-center text-sm font-bold transition-all border-2",
                    status === 'proper' && "bg-[#4D5443] text-white border-[#4D5443]",
                    status === 'improper' && "bg-red-50 text-red-500 border-red-200",
                    status === 'none' && "bg-[#F5F4F0] text-[#7A7D74] border-transparent",
                    isSelected && "ring-2 ring-offset-1 ring-[#4D5443]",
                    isToday && status === 'none' && "border-[#4D5443]"
                  )}
                >{format(day, 'd')}</motion.button>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 mt-8 pt-6 border-t border-[#F5F4F0]">
            <LegendItem color="bg-[#4D5443]" label="Proper" />
            <LegendItem color="bg-red-200" label="Improper" />
            <LegendItem color="bg-[#F5F4F0] border border-[#D9D7CE]" label="No Waste Given" />
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="col-span-12 lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedDate ? (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-[#EBE9E0] rounded-none p-8 border border-[#D9D7CE] h-full flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-black text-[#2D3128]">Day Breakdown</h4>
                  <button onClick={() => setSelectedDate(null)} className="text-[#7A7D74] hover:text-red-500 font-bold text-lg leading-none">✕</button>
                </div>
                <div className="bg-white rounded-none p-5 border border-[#E5E2D9]">
                  <p className="text-[9px] font-black text-[#7A7D74] uppercase mb-1">Date</p>
                  <p className="font-black text-[#2D3128]">{format(selectedDate, 'do MMMM yyyy')}</p>
                </div>
                {getSelectedRecord() ? (
                  <>
                    <div className={cn(
                      "rounded-none p-5 border font-black text-center uppercase tracking-widest text-sm",
                      getSelectedRecord()?.status === 'proper'
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-600"
                    )}>
                      {getSelectedRecord()?.status}
                    </div>
                    <div className="bg-white rounded-none p-5 border border-[#E5E2D9] flex-1">
                      <p className="text-[9px] font-black text-[#7A7D74] uppercase mb-2">Note</p>
                      <p className="font-bold text-[#2D3128] capitalize">Validation logged by Municipal Authority</p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 bg-white/60 rounded-none p-5 border border-[#E5E2D9] flex items-center justify-center text-center">
                    <p className="text-[#7A7D74] font-bold text-sm">No collection data<br/>for this day.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] bg-[#F5F4F0] rounded-none border-2 border-dashed border-[#D9D7CE] flex flex-col items-center justify-center text-center p-8">
                <CalendarIcon className="w-10 h-10 text-[#7A7D74]/30 mb-3" />
                <p className="text-[#7A7D74] font-bold text-sm">Click a date<br/>to see details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>


      </div>
  );
}

function ProfileItem({ icon: Icon, label, value }: any) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-[#4D5443]" />
        <p className="text-[8px] font-black text-[#7A7D74] uppercase tracking-widest">{label}</p>
      </div>
      <p className="font-black text-[#2D3128] text-sm">{value}</p>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded-none", color)} />
      <span className="text-[9px] font-black text-[#7A7D74] uppercase tracking-widest">{label}</span>
    </div>
  );
}
