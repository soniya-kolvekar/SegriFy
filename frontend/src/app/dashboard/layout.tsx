'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Settings, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'municipal') {
      router.replace('/municipal');
      return;
    }

    if (user.role === 'worker') {
      router.replace('/worker');
      return;
    }

    // Role-based Setup Guards
    if (user.role === 'business') {
      const isProfileComplete = user.businessName && user.aadhaarNo && user.panCard;
      const isOnboardingPage = pathname === '/dashboard/business/onboarding';
      if (!isProfileComplete && !isOnboardingPage) {
        router.push('/dashboard/business/onboarding');
      }
    } else if (user.role.startsWith('citizen')) {
      // Check for mandatory houseId registration
      if (!user.houseId) {
        router.push('/setup');
      }
    }
  }, [user, pathname, router]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const profileHref = user.role === 'business' ? '/dashboard/business/profile' : '/dashboard/profile';

  return (
    <div className="flex bg-[#F5F4F0] min-h-screen font-sans relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r border-[#E5E2D9] z-50">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#F5F4F0] z-[70] lg:hidden border-r border-[#E5E2D9] shadow-2xl"
            >
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-64 min-h-screen overflow-y-auto font-sans antialiased">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E2D9] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:gap-8 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#4D5443] hover:bg-[#EBE9E0] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center gap-8 flex-1">
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#7A7D74] mr-4 hidden lg:flex">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user.role === 'business' ? 'Commercial Portal' : 'Residential Portal'}
              </span>
            </div>

            <Link href={profileHref}>
              <div className="w-10 h-10 bg-[#4D5443] flex items-center justify-center text-white font-black text-xs hover:brightness-110 transition-all cursor-pointer rounded-none">
                {getInitials(user.name || user.email || 'U')}
              </div>
            </Link>
          </div>
        </header>
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
