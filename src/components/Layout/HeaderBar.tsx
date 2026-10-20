import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { ubpStore } from '../../services/store';
import { AppIcon } from '../Shared/AppIcon';
import { Branch } from '../../types/ubp';

interface HeaderBarProps {
  onToggleMobileMenu: () => void;
  onNavigate: (route: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onToggleMobileMenu, onNavigate }) => {
  const { t, language, toggleLanguage } = useI18n();
  const actor = ubpStore.getActor();
  const branches = ubpStore.getBranches('', false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allowedBranches: Branch[] = actor?.is_super_admin
    ? branches
    : branches.filter((b) => actor?.allowed_branch_ids.includes(b.id));

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    ubpStore.setCurrentBranch(e.target.value);
    window.location.reload();
  };

  const handleLogout = () => {
    ubpStore.logout();
    onNavigate('/login');
  };

  const initialLetter = (actor?.display_name || actor?.username || 'U').charAt(0).toUpperCase();

  return (
    <header className="ubp-appbar flex items-center justify-between h-16 fixed top-0 end-0 start-0 lg:start-64 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ms-1 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="القائمة"
        >
          <AppIcon name="Menu" size={22} />
        </button>

        {/* Company Name removed from HeaderBar - lives ONLY in Sidebar as requested */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{actor?.is_super_admin ? t('role.super_admin') : 'منظومة الأعمال المتكاملة'}</span>
        </div>
      </div>

      <div className="ubp-header-actions flex items-center gap-2 sm:gap-3">
        {allowedBranches.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1">
            <AppIcon name="GitFork" size={14} className="text-teal-700 shrink-0 hidden sm:block" />
            <span className="text-[11px] font-bold text-slate-500 hidden md:inline">{t('dashboard.branch')}:</span>
            <select
              value={actor?.current_branch_id || ''}
              onChange={handleBranchChange}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer py-0.5 pe-1 max-w-[140px] sm:max-w-[200px]"
            >
              {allowedBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'en' && b.name_en ? b.name_en : b.name_ar}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={toggleLanguage}
          className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          title={t('auth.language')}
        >
          {language === 'ar' ? 'English' : 'العربية'}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pe-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-teal-700 to-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initialLetter}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[120px] truncate">
              {actor?.display_name || actor?.username}
            </span>
            <AppIcon name="ChevronDown" size={14} className="text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute end-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-semibold">{t('dashboard.user')}</p>
                <p className="text-sm font-bold text-slate-900 truncate">{actor?.display_name}</p>
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  {actor?.is_super_admin
                    ? t('role.super_admin')
                    : actor?.is_admin
                    ? t('role.admin')
                    : t('role.user')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate('/change-password');
                }}
                className="w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <AppIcon name="Key" size={16} />
                <span>{t('auth.change_password')}</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <AppIcon name="LogOut" size={16} />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
