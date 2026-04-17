'use client';

import React from 'react';
import { 
  Building2, 
  Package, 
  DollarSign, 
  BarChart2, 
  Plus,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';

export default function BusinessDashboard() {
  return (
    <div className="p-10 space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-black text-brand-primary">Business Portal</h1>
          <p className="text-brand-muted-foreground mt-2 font-medium">Manage bulk waste collection and service requests.</p>
        </div>
        <button className="bg-brand-accent text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-brand-accent/20 hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" />
          Request Collection
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Requests', value: '02', icon: Clock, color: 'bg-orange-500' },
          { label: 'Completed Services', value: '148', icon: CheckCircle, color: 'bg-green-600' },
          { label: 'Monthly Expenditure', value: '₹12,450', icon: DollarSign, color: 'bg-brand-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-brand-secondary/30 shadow-sm">
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-brand-muted-foreground font-medium text-sm">{stat.label}</p>
            <p className="text-3xl font-heading font-black text-brand-primary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Service Request Form Placeholder */}
        <div className="bg-white p-10 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
          <h2 className="text-2xl font-heading font-bold text-brand-primary mb-8 flex items-center gap-3">
            <Truck className="w-6 h-6 text-brand-accent" />
            New Bulk Collection Request
          </h2>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-primary">Waste Category</label>
                <select className="w-full bg-brand-bg border-none rounded-xl p-4 text-sm font-medium">
                  <option>Industrial Waste</option>
                  <option>E-Waste</option>
                  <option>Organic Bulk</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-primary">Estimated Quantity (Tons)</label>
                <input type="number" placeholder="0.0" className="w-full bg-brand-bg border-none rounded-xl p-4 text-sm font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary">Preferred Pickup DateTime</label>
              <input type="datetime-local" className="w-full bg-brand-bg border-none rounded-xl p-4 text-sm font-medium" />
            </div>
            <div className="bg-brand-secondary/20 p-6 rounded-2xl border border-dotted border-brand-secondary">
              <div className="flex justify-between items-center text-brand-primary font-black">
                <span>Estimated Cost</span>
                <span className="text-2xl">₹2,400.00</span>
              </div>
              <p className="text-xs text-brand-muted-foreground mt-1">*Based on municipal corporate pricing guidelines</p>
            </div>
            <button className="w-full py-5 bg-brand-primary text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20">
              Submit Request
            </button>
          </form>
        </div>

        {/* Request Tracking */}
        <div className="bg-white p-10 rounded-[3rem] border border-brand-secondary/30 shadow-sm">
            <h2 className="text-2xl font-heading font-bold text-brand-primary mb-8">Active Services</h2>
            <div className="space-y-6">
              {[
                { id: 'SR-1025', status: 'In Transit', progress: 80, eta: '15 mins' },
                { id: 'SR-1024', status: 'Confirmed', progress: 30, eta: '2 hours' },
              ].map((service, i) => (
                <div key={i} className="p-6 bg-brand-bg/50 rounded-2xl border border-brand-secondary/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-black text-brand-primary">{service.id}</span>
                    <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent text-xs font-black uppercase rounded-full">{service.status}</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5 mb-2">
                    <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${service.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-brand-muted-foreground">
                    <span>Pickup Requested</span>
                    <span>ETA: {service.eta}</span>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
