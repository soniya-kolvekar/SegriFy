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
  Leaf
} from 'lucide-react';
import { cn } from '../lib/utils';

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

export default function Sidebar() {
  const pathname = usePathname();
  const isMunicipal = pathname.startsWith('/municipal');
  const items = isMunicipal ? municipalItems : sidebarItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-primary text-white flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-brand-accent p-2 rounded-lg">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-heading font-bold tracking-tight">SegriFy</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                  : "hover:bg-white/10 text-brand-secondary"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "group-hover:text-white"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
