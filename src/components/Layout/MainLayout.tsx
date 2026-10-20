import React, { useState } from 'react';
import { HeaderBar } from './HeaderBar';
import { NavMenu } from './NavMenu';

interface MainLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="ubp-main flex flex-col min-h-screen">
      <HeaderBar
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        onNavigate={onNavigate}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar (full height from top to bottom) */}
        <aside className="hidden lg:flex flex-col w-64 border-e border-slate-200/80 fixed inset-y-0 start-0 z-30 bg-white">
          <NavMenu currentRoute={currentRoute} onNavigate={onNavigate} />
        </aside>

        {/* Mobile Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-start">
              <NavMenu
                currentRoute={currentRoute}
                onNavigate={onNavigate}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:ms-64 min-w-0 pt-16">
          <div className="ubp-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
