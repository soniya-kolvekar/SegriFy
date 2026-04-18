'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/context/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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

  if (!user) return null; // Or a loading skeleton

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
    <div className="flex bg-brand-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto font-sans antialiased">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-brand-muted flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex-1"></div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 text-brand-primary/40">
               <div className="relative cursor-pointer hover:text-brand-primary transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                 <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-none border border-white"></div>
               </div>
               <svg className="w-5 h-5 cursor-pointer hover:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>

            <div className="h-8 w-px bg-brand-muted"></div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-brand-primary/40 uppercase tracking-widest hidden lg:block">Business Waste Management Portal</span>
              <Link href={profileHref}>
                <div className="w-10 h-10 bg-brand-primary flex items-center justify-center text-white font-black text-xs hover:brightness-110 transition-all cursor-pointer rounded-none">
                  {getInitials(user.name)}
                </div>
              </Link>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
