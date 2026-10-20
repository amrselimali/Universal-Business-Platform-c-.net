import React from 'react';
import { useI18n } from '../../i18n';
import { ubpStore } from '../../services/store';
import { AppRegistryScreens, ScreenCodes, ActionCodes } from '../../types/ubp';
import { AppIcon } from '../Shared/AppIcon';

interface NavMenuProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onCloseMobile?: () => void;
}

export const NavMenu: React.FC<NavMenuProps> = ({ currentRoute, onNavigate, onCloseMobile }) => {
  const { t } = useI18n();
  const settings = ubpStore.getSettings();

  // Group screens
  const groups = [
    { key: 'group.main', screens: AppRegistryScreens.filter((s) => s.group_key === 'group.main') },
    { key: 'group.definitions', screens: AppRegistryScreens.filter((s) => s.group_key === 'group.definitions') },
    { key: 'group.security', screens: AppRegistryScreens.filter((s) => s.group_key === 'group.security') },
    { key: 'group.system', screens: AppRegistryScreens.filter((s) => s.group_key === 'group.system') },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="w-full h-full bg-white flex flex-col shrink-0 select-none">
      {/* Company Branding in Sidebar - Sole location for company identity */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 bg-white shrink-0">
        <div
          className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
          onClick={() => handleLinkClick('/')}
          title={settings.company_name}
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.company_name}
              className="w-9 h-9 object-contain rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white font-black text-base flex items-center justify-center shadow-xs ring-1 ring-teal-600/30 shrink-0">
              {settings.company_name ? settings.company_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="text-slate-900 font-extrabold text-[14.5px] leading-tight truncate group-hover:text-teal-800 transition-colors">
              {settings.company_name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-[11px] font-semibold text-slate-500 truncate">
                {t('app.business_platform') || 'منصة إدارة الأعمال'}
              </span>
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ms-1"
            title="إغلاق القائمة"
          >
            <AppIcon name="X" size={18} />
          </button>
        )}
      </div>

      <nav className="ubp-nav flex-1 overflow-y-auto px-3 py-3">
        {groups.map((group) => {
          // Filter screens visible to current actor
          const visibleScreens = group.screens.filter((s) => {
            const perm = ubpStore.checkPermission(s.code, ActionCodes.View);
            return perm.allowed;
          });

          if (visibleScreens.length === 0) return null;

          return (
            <div key={group.key} className="ubp-nav-group mb-4">
              <div className="ubp-nav-group-title text-slate-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5">
                {t(group.key)}
              </div>
              <div className="space-y-1 mt-1">
                {visibleScreens.map((screen) => {
                  const isActive = currentRoute === screen.route;
                  return (
                    <button
                      key={screen.code}
                      type="button"
                      onClick={() => handleLinkClick(screen.route)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/50 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200/60'
                      }`}
                    >
                      <AppIcon
                        name={screen.icon}
                        size={18}
                        className={isActive ? 'text-teal-700' : 'text-slate-400'}
                      />
                      <span className="truncate">{t(screen.title_key)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
