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
  MessageSquare,
  User,
  Gavel,
  Menu,
  X,
  Package
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/context/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface MunicipalLayoutProps {
  children: ReactNode;
}

export default function MunicipalLayout({ children }: MunicipalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.role !== 'municipal') {
      router.replace('/dashboard'); // or standard fallback
    }
  }, [user, router]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      useAuthStore.getState().logout();
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user || user.role !== 'municipal') return null;

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
    <div className="flex h-screen bg-[#F0EDE7] font-sans text-[#2D2D2D] overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-[#F9F7F2] border-r border-[#E5E1D8] flex-col">
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
          <SidebarItem icon={Package} label="Inventory" href="/municipal/inventory" />
          <SidebarItem icon={Building2} label="Business" href="/municipal/business" />
          <SidebarItem icon={MessageSquare} label="Complaints" href="/municipal/complaints" />
          <SidebarItem icon={Gavel} label="Fines" href="/municipal/fines" />
        </nav>

        <div className="p-6 space-y-4 text-center">
          <div className="pt-4 space-y-1">
            <div 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-600 cursor-pointer transition-colors group"
            >
              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden animate-in fade-in duration-200"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Sidebar/Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#F9F7F2] z-[101] shadow-2xl transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-tighter text-brand-primary">SegriFy</h1>
          </div>
          <button onClick={toggleMobileMenu} className="p-2 text-gray-400 hover:text-brand-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-4">
          {[
            { icon: LayoutDashboard, label: 'Overview', href: '/municipal' },
            { icon: Package, label: 'Inventory', href: '/municipal/inventory' },
            { icon: Building2, label: 'Business', href: '/municipal/business' },
            { icon: MessageSquare, label: 'Complaints', href: '/municipal/complaints' },
            { icon: Gavel, label: 'Fines', href: '/municipal/fines' }
          ].map((item) => (
            <div 
              key={item.href}
              onClick={() => { router.push(item.href); toggleMobileMenu(); }}
              className={`flex items-center gap-4 px-8 py-5 cursor-pointer border-b border-[#F0EDE7] transition-all ${pathname === item.href ? 'bg-[#E5E1D8] text-brand-primary font-bold' : 'text-gray-500 hover:bg-[#E5E1D8]/50'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
            </div>
          ))}

          <div 
            onClick={handleLogout}
            className="flex items-center gap-4 px-8 py-6 text-red-500 bg-red-50/30 cursor-pointer mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Terminate Session</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E1D8] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="lg:hidden p-2 text-brand-primary bg-[#F9F7F2] border border-[#E5E1D8]">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm lg:text-lg font-black text-brand-primary uppercase tracking-widest">
              {pathname === '/municipal' ? 'Overview' : 
               pathname.split('/').pop()?.toUpperCase()}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest leading-none">Admin Node</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1 italic">Active Session</p>
            </div>
            <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/10">
               <User className="w-6 h-6" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-10 custom-scrollbar">
          {children}
          
          {/* Footer */}
          <footer className="pt-10 border-t border-[#E5E1D8] flex flex-col items-center gap-6 pb-10 lg:pb-0">
             <div className="flex flex-wrap justify-center gap-6 lg:gap-10 text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <a href="#" className="hover:text-brand-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Accessibility</a>
                <a href="#" className="hover:text-brand-primary transition-colors">Contact</a>
             </div>
             <p className="text-[8px] lg:text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] text-center">
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
