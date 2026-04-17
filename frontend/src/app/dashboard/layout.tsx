import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-brand-bg min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <header className="h-20 bg-white/50 backdrop-blur-sm border-b border-brand-secondary/20 flex items-center justify-end px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-brand-primary">Adarsh Kumar</p>
              <p className="text-xs text-brand-muted-foreground font-medium">Homeowner #4521</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-accent flex items-center justify-center text-white font-black shadow-lg shadow-brand-accent/20">
              AK
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
