'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  Wallet, 
  MessageCircle,
  HelpCircle,
  LogOut,
  Leaf,
  Home,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '@/context/useAuthStore';

const sidebarItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
  { name: 'Rewards', href: '/dashboard/rewards', icon: Wallet },
  { name: 'Complaints', href: '/dashboard/complaints', icon: MessageCircle },
];

const businessItems = [
  { name: 'Dashboard', href: '/dashboard/business', icon: Home },
  { name: 'Requests', href: '/dashboard/business/requests', icon: FileText },
];

const municipalItems = [
  { name: 'Analytics', href: '/municipal', icon: LayoutGrid },
  { name: 'Verify QR', href: '/municipal/verify', icon: Leaf },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  
  const isMunicipal = pathname.startsWith('/municipal');
  const isBusiness = pathname.startsWith('/dashboard/business');
  
  let items = sidebarItems;
  if (isMunicipal) items = municipalItems;
  if (isBusiness) items = businessItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#F5F4F0] border-r border-[#E5E2D9] flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-[#4D5443] p-2.5 rounded-none shadow-sm">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-black text-[#2D3128] leading-tight">SegriFy</h2>
          <p className="text-[10px] font-bold text-[#7A7D74] uppercase tracking-widest">
            {isBusiness ? 'Commercial' : isMunicipal ? 'Municipal' : 'Homeowner'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-200 group",
                isActive 
                  ? "bg-[#D9D7CE] text-[#2D3128] shadow-sm" 
                  : "hover:bg-[#EBE9E0] text-[#7A7D74] hover:text-[#2D3128]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-[#2D3128]" : "group-hover:text-[#2D3128]"
              )} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-4 space-y-2">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-none hover:bg-[#EBE9E0] text-[#7A7D74] hover:text-[#2D3128] transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold text-sm uppercase">Support</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-none hover:bg-red-50 text-[#7A7D74] hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold text-sm uppercase">Logout</span>
        </button>
      </div>
    </aside>
  );
}
