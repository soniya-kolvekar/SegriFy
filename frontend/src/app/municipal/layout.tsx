'use client';

import React, { ReactNode } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Award, 
  BarChart3, 
  History, 
  ShieldCheck, 
  LogOut, 
  Search, 
  User
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface MunicipalLayoutProps {
  children: ReactNode;
}

export default function MunicipalLayout({ children }: MunicipalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const SidebarItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
    const active = pathname === href;
    return (
      <div 
        onClick={() => router.push(href)}
        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all ${active ? 'bg-[#E5E1D8] text-brand-primary border-r-4 border-brand-primary font-bold' : 'text-gray-500 hover:bg-[#E5E1D8]/50'}`}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm tracking-tight">{label}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F0EDE7] font-sans text-[#2D2D2D] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#F9F7F2] border-r border-[#E5E1D8] flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-brand-primary leading-none">SegriFy Auth</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Municipal Authority</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 mt-4">
          <SidebarItem icon={LayoutDashboard} label="Overview" href="/municipal" />
          <SidebarItem icon={Building2} label="Business" href="/municipal/business" />
          <SidebarItem icon={History} label="History" href="/municipal/history" />
        </nav>

        <div className="p-6 space-y-4 text-center">
          <div className="pt-4 space-y-1">
            <div className="flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E1D8] flex items-center justify-between px-10 sticky top-0 z-50">
          <h2 className="text-lg font-bold text-gray-800 tracking-tight">
            {pathname === '/municipal' ? 'Overview Dashboard' : 
             pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)}
          </h2>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
              <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white shadow-md">
                 <User className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {children}
          
          {/* Footer */}
          <footer className="pt-10 border-t border-[#E5E1D8] flex flex-col items-center gap-6">
             <div className="flex gap-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Accessibility</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Contact</a>
             </div>
             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                © 2024 SEGRIFY MUNICIPAL INFRASTRUCTURE. ALL RIGHTS RESERVED.
             </p>
          </footer>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E1D8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1CEC5;
        }
      `}</style>
    </div>
  );
}
