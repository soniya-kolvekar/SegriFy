'use client';

import React, { useState } from 'react';
import { 
  Edit3, 
  Mail,
  MapPin,
  Plus,
  Leaf,
  FileText
} from 'lucide-react';
import { useAuthStore } from '@/context/useAuthStore';
import { useEffect } from 'react';

export default function BusinessProfilePage() {
  const { user, firebaseToken, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    aadhaarNo: user?.aadhaarNo || '',
    panCard: user?.panCard || '',
    industrySector: user?.industrySector || '',
    name: user?.name || '',
    phone: user?.phone || '',
    pickupAddress: user?.pickupAddress || ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || '',
        aadhaarNo: user.aadhaarNo || '',
        panCard: user.panCard || '',
        industrySector: user.industrySector || '',
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
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
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
      }
    } catch (err) {
      console.error('Update Profile Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasTaxId = Boolean(user?.panCard || user?.aadhaarNo);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-primary/40">
          <span>Organization</span>
          <Plus className="w-2 h-2" />
          <span>Details</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading font-black text-brand-primary uppercase">Organization Details</h1>
            <p className="text-brand-primary/60 font-bold text-sm mt-1 uppercase tracking-tight">Manage your legal entity information, tax identifiers, and verified commercial locations.</p>
          </div>
          <div className="flex gap-4">
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-none text-[10px] font-black uppercase tracking-widest border border-green-100">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Core Identification */}
        <div className="lg:col-span-8 bg-brand-secondary/30 border border-brand-muted p-10 space-y-12 rounded-none relative">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight flex items-center gap-3">
              Core Identification
            </h2>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className="flex items-center gap-2 text-[10px] font-black text-brand-primary/60 uppercase tracking-widest hover:text-brand-primary transition-colors"
            >
              <Edit3 className="w-3 h-3" /> {isEditing ? (loading ? 'Saving...' : 'Save Changes') : 'Edit Details'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-12">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Legal Business Name</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              ) : (
                <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{user?.businessName || 'Not Set'}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest flex items-center gap-1">Tax ID (Aadhaar/PAN) {hasTaxId && <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>}</p>
              {isEditing && !hasTaxId ? (
                <div className="grid grid-cols-1 gap-2">
                  <input 
                    type="text"
                    maxLength={10}
                    placeholder="PAN (Primary)"
                    value={formData.panCard}
                    onChange={(e) => setFormData({...formData, panCard: e.target.value.toUpperCase()})}
                    className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{user?.panCard || user?.aadhaarNo || 'Not Provided'}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Industry Sector</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.industrySector}
                  onChange={(e) => setFormData({...formData, industrySector: e.target.value})}
                  className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              ) : (
                <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{user?.industrySector || 'Not Set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Administrative Contact */}
        <div className="lg:col-span-4 bg-white border border-brand-muted p-10 space-y-10 rounded-none shadow-none relative">
          <h2 className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest flex justify-between">
            Administrative Contact
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-primary flex items-center justify-center text-white font-black text-2xl rounded-none overflow-hidden shrink-0">
               <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=5C5D47&color=fff&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {isEditing ? (
              <input 
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white py-2 px-3 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            ) : (
              <div>
                <p className="font-black text-brand-primary uppercase text-sm tracking-tight">{user?.name || 'Not Set'}</p>
                <p className="text-[10px] text-brand-primary/60 font-bold uppercase tracking-widest break-words">Primary Manager</p>
              </div>
            )}
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-[10px] text-brand-primary font-bold uppercase tracking-widest truncate">
              <Mail className="w-3 h-3 shrink-0 text-brand-primary/40" /> 
              {user?.email} 
            </div>
            <div className="flex items-center gap-3 text-[10px] text-brand-primary font-bold uppercase tracking-widest">
               <svg className="w-3 h-3 shrink-0 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               {isEditing ? (
                 <input 
                   type="tel"
                   placeholder="Phone Number"
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full bg-white py-1 px-2 border border-brand-muted text-xs font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                 />
               ) : (
                 <span>{user?.phone || 'Not Set'}</span>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Address */}
      <div className="bg-white border border-brand-muted p-10 space-y-10 rounded-none shadow-none relative overflow-hidden">
        <div className="flex justify-between items-center relative z-10">
          <h2 className="text-xl font-black text-brand-primary uppercase tracking-tight flex items-center gap-3">
             Verified Pickup Address
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 relative z-10">
          <div className="flex-1 space-y-6">
            {isEditing ? (
              <textarea 
                rows={3}
                placeholder="Enter full pickup address..."
                value={formData.pickupAddress}
                onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                className="w-full bg-white py-4 px-5 border border-brand-muted text-lg font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary resize-none"
              />
            ) : (
              <div className="space-y-1">
                <p className="text-2xl font-black text-brand-primary uppercase tracking-tight leading-loose whitespace-pre-line">
                  {user?.pickupAddress || 'No pickup address set.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
