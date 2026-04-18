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
