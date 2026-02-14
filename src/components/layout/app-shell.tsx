
"use client";

import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketing = pathname === '/' || pathname.startsWith('/blog') || pathname.startsWith('/pricing');

  if (isMarketing) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for Desktop */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar for mobile only, since desktop has Sidebar */}
        <div className="lg:hidden">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 lg:pt-0 pb-16 lg:pb-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom tab bar for mobile */}
      <MobileBottomNav />
    </div>
  );
}
