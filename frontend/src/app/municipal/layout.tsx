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
  Package,
  Menu,
  X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
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
      router.replace('/dashboard');
    }
  }, [user, router]);

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

  return (
    <div className="flex h-screen bg-[#F0EDE7] font-sans text-[#2D2D2D] overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-72 bg-[#F9F7F2] border-r border-[#E5E1D8] z-50">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#F9F7F2] z-[101] lg:hidden border-r border-[#E5E1D8] shadow-2xl"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative lg:ml-72">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E1D8] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-brand-primary bg-[#F9F7F2] border border-[#E5E1D8]">
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
