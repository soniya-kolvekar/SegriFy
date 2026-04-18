'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Wallet, 
  MessageSquare, 
  Shield, 
  Building2, 
  LogOut,
  Leaf,
  BarChart3,
  History,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter } from 'next/navigation';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Segregation', href: '/dashboard/segregation', icon: Calendar },
  { name: 'Rewards', href: '/dashboard/rewards', icon: Wallet },
  { name: 'Complaints', href: '/dashboard/complaints', icon: MessageSquare },
];

const municipalItems = [
  { name: 'City Stats', href: '/municipal', icon: Shield },
  { name: 'Residents', href: '/municipal/residents', icon: Home },
  { name: 'Business Req', href: '/municipal/business', icon: Building2 },
];

const businessItems = [
  { name: 'Dashboard', href: '/dashboard/business', icon: Home },
  { name: 'Requests', href: '/dashboard/business/requests', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isMunicipal = pathname.startsWith('/municipal');
  const isBusiness = pathname.startsWith('/dashboard/business');
  const router = useRouter();
  const { logout, user } = useAuthStore();
  
  let items = sidebarItems;
  if (isMunicipal) items = municipalItems;
  if (isBusiness) items = businessItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-secondary text-brand-primary flex flex-col z-50 border-r border-brand-muted">
      <div className="p-8 flex flex-col gap-1">
        <span className="text-xl font-heading font-black tracking-tight uppercase">Civic Architect</span>
        <span className="text-[10px] font-bold text-brand-primary/60 uppercase tracking-widest">Waste Management</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-none transition-all duration-200 group border-l-4",
                isActive 
                  ? "bg-brand-muted/30 border-brand-primary text-brand-primary font-black shadow-none" 
                  : "hover:bg-brand-muted/20 text-brand-primary/70 border-transparent font-bold"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {isBusiness && (
          <Link href="/dashboard/business/requests">
            <button className="w-full bg-brand-primary text-white py-4 rounded-none font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:brightness-110 transition-all">
              New Request
            </button>
          </Link>
        )}
        
        <div className="flex items-center gap-3 px-2 pt-4">
          <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white font-black text-xs rounded-none">
            {user?.businessName?.[0] || user?.name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-brand-primary truncate">{user?.businessName || user?.name}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-2 py-4 w-full rounded-none hover:bg-red-50 text-red-600 transition-colors border-t border-brand-muted"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">Sign-Out</span>
        </button>
      </div>
    </aside>
  );
}
