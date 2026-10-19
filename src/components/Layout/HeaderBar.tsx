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
  const settings = ubpStore.getSettings();
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
    <header className="ubp-appbar flex items-center justify-between h-16 w-full fixed top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="ubp-menu-btn p-2 rounded-lg hover:bg-slate-100 text-slate-700"
          title="القائمة"
        >
          <AppIcon name="Menu" size={22} />
        </button>

        <div className="ubp-appbar-brand cursor-pointer" onClick={() => onNavigate('/')}>
          <div className="ubp-brand-mark small">U</div>
          <span className="ubp-company">{settings.company_name}</span>
        </div>
      </div>

      <div className="ubp-header-actions">
        {allowedBranches.length > 0 && (
          <div className="ubp-inline">
            <span className="ubp-branch-label hidden sm:inline">{t('dashboard.branch')}:</span>
            <select
              value={actor?.current_branch_id || ''}
              onChange={handleBranchChange}
              className="ubp-select font-medium text-slate-800"
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
          className="ubp-lang-btn"
          title={t('auth.language')}
        >
          {language === 'ar' ? 'English' : 'العربية'}
        </button>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="ubp-user-btn"
          >
            <div className="ubp-user-avatar">{initialLetter}</div>
            <span className="ubp-user-name">{actor?.display_name || actor?.username}</span>
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
