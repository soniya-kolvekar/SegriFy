'use client';

import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Mail,
  MapPin,
  Plus,
  Home,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';

export default function HomeownerProfilePage() {
  const { user, firebaseToken, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    pickupAddress: user?.pickupAddress || ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        pickupAddress: user.pickupAddress || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    if (!firebaseToken) {
      setMessage('Error: Authentication token missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setAuth(data.user, firebaseToken!);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Error updating profile.');
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
      setMessage('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const hasAadhaar = Boolean(user?.maskedAadhaar);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 font-sans">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#4D5443]/60">
          <span>Profile</span>
          <Plus className="w-2 h-2 text-[#4D5443]" />
          <span>Details</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#2D3128] uppercase">Citizen Details</h1>
            <p className="text-[#7A7D74] font-bold text-sm mt-1 uppercase tracking-tight">Manage your personal information, contact methods, and location context.</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-none text-[10px] font-black uppercase tracking-widest border ${message.includes('Error') ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Core Identification */}
        <div className="lg:col-span-8 bg-white border border-[#E5E2D9] p-10 space-y-12 rounded-none relative shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-[#2D3128] uppercase tracking-tight flex items-center gap-3">
              Immutable Records
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest flex items-center gap-1.5">
                <Home className="w-3 h-3 text-[#4D5443]" /> Primary Residence Key
                <span className="w-1.5 h-1.5 bg-[#4D5443] rounded-full inline-block ml-1"></span>
              </p>
              <div className="bg-[#F5F4F0] py-3 px-4 border border-[#E5E2D9]">
                <p className="text-xl font-black text-[#2D3128] uppercase tracking-tight">{user?.houseId || 'Not Set'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#4D5443]" /> Verification Mask
                {hasAadhaar && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block ml-1"></span>}
              </p>
               <div className="bg-[#F5F4F0] py-3 px-4 border border-[#E5E2D9] flex items-center gap-2">
                  <p className="text-xl font-black text-[#2D3128] uppercase tracking-widest">{user?.maskedAadhaar || 'Not Provided'}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Contact Module */}
        <div className="lg:col-span-4 bg-white border border-[#E5E2D9] p-10 space-y-10 rounded-none shadow-sm relative">
          <div className="flex justify-between items-center relative z-10">
            <h2 className="text-[10px] font-black text-[#7A7D74] uppercase tracking-widest">
              Contact Profile
            </h2>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className="flex items-center gap-2 text-[10px] font-black text-[#4D5443] uppercase tracking-widest hover:brightness-110 transition-colors"
            >
              <Edit3 className="w-3 h-3" /> {isEditing ? (loading ? 'Saving...' : 'Save') : 'Edit'}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#4D5443] flex items-center justify-center text-white font-black text-2xl rounded-none overflow-hidden shrink-0">
               <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=5C5D47&color=fff&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {isEditing ? (
              <input 
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white py-2 px-3 border border-[#E5E2D9] text-sm font-bold text-[#2D3128] focus:ring-1 focus:ring-[#4D5443] outline-none"
              />
            ) : (
              <div>
                <p className="font-black text-[#2D3128] uppercase text-sm tracking-tight">{user?.name || 'Not Set'}</p>
                <p className="text-[10px] text-[#7A7D74] font-bold uppercase tracking-widest break-words">Citizen Delegate</p>
              </div>
            )}
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-[10px] text-[#2D3128] font-bold uppercase tracking-widest truncate">
              <Mail className="w-3 h-3 shrink-0 text-[#7A7D74]" /> 
              {user?.email} 
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#2D3128] font-bold uppercase tracking-widest">
               <svg className="w-3 h-3 shrink-0 text-[#7A7D74]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               {isEditing ? (
                 <input 
                   type="tel"
                   placeholder="Phone Number"
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full bg-white py-1.5 px-3 border border-[#E5E2D9] text-xs font-bold text-[#2D3128] focus:ring-1 focus:ring-[#4D5443] outline-none"
                 />
               ) : (
                 <span>{user?.phone || 'Not Set'}</span>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Address */}
      <div className="bg-white border border-[#E5E2D9] p-10 space-y-10 rounded-none shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-xl font-black text-[#2D3128] uppercase tracking-tight flex items-center gap-3">
             <MapPin className="w-6 h-6 text-[#4D5443]" /> Detailed Logistics Map
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 relative z-10">
          <div className="flex-1 space-y-6">
            {isEditing ? (
              <textarea 
                rows={3}
                placeholder="Enter specific instructions or full pickup address..."
                value={formData.pickupAddress}
                onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                className="w-full bg-white py-4 px-5 border border-[#E5E2D9] text-lg font-bold text-[#2D3128] focus:ring-1 focus:ring-[#4D5443] resize-none outline-none"
              />
            ) : (
              <div className="space-y-1">
                <p className="text-2xl font-black text-[#2D3128] uppercase tracking-tight leading-loose whitespace-pre-line">
                  {user?.pickupAddress || 'No spatial routing instructions provided.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
