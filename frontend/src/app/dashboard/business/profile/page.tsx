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
    shopNumber: user?.shopNumber || ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || '',
        aadhaarNo: user.aadhaarNo || '',
        panCard: user.panCard || '',
        shopNumber: user.shopNumber || ''
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
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
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Registration ID</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={formData.shopNumber}
                  onChange={(e) => setFormData({...formData, shopNumber: e.target.value})}
                  className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              ) : (
                <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{user?.shopNumber || 'REG-7700-SFY-2024'}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Tax ID (Aadhaar/PAN)</p>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text"
                    maxLength={12}
                    placeholder="Aadhaar"
                    value={formData.aadhaarNo}
                    onChange={(e) => setFormData({...formData, aadhaarNo: e.target.value})}
                    className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                  <input 
                    type="text"
                    maxLength={10}
                    placeholder="PAN"
                    value={formData.panCard}
                    onChange={(e) => setFormData({...formData, panCard: e.target.value.toUpperCase()})}
                    className="w-full bg-white py-3 px-4 border border-brand-muted text-sm font-bold text-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-black text-brand-primary uppercase tracking-tight">{user?.panCard || '22AAAAA0000A1Z5'}</p>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Industry Sector</p>
              <p className="text-xl font-black text-brand-primary uppercase tracking-tight">Industrial Waste Management</p>
            </div>
          </div>
        </div>

        {/* Administrative Contact */}
        <div className="lg:col-span-4 bg-white border border-brand-muted p-10 space-y-10 rounded-none shadow-none">
          <h2 className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest">Administrative Contact</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-primary flex items-center justify-center text-white font-black text-2xl rounded-none overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=5C5D47&color=fff&bold=true`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-black text-brand-primary uppercase text-sm tracking-tight">{user?.name || 'Marcus Thorne'}</p>
              <p className="text-[10px] text-brand-primary/60 font-bold uppercase tracking-widest">Primary Account Manager</p>
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-[10px] text-brand-primary font-bold uppercase tracking-widest">
              <Mail className="w-3 h-3 text-brand-primary/40" /> {user?.email}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-brand-primary font-bold uppercase tracking-widest">
               <svg className="w-3 h-3 text-brand-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
               +1 (555) 012-8892
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
            <div className="space-y-1">
              <p className="text-2xl font-black text-brand-primary uppercase tracking-tight leading-tight">Sector 12 Industrial Estate, <br/> Block C, Warehouse 42A</p>
              <p className="text-brand-primary/60 font-bold text-sm uppercase tracking-tight">New Delhi, NCR - 110044, India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
