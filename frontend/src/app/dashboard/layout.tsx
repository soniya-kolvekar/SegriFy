'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user && user.role === 'business') {
      const isProfileComplete = user.businessName && user.aadhaarNo && user.panCard;
      const isOnboardingPage = pathname === '/dashboard/business/onboarding';

      if (!isProfileComplete && !isOnboardingPage) {
        router.push('/dashboard/business/onboarding');
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
    <div className="flex bg-[#F5F4F0] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto font-sans antialiased">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5E2D9] flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-8 flex-1">
          <div className="flex items-center gap-8 flex-1">
          </div>
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
