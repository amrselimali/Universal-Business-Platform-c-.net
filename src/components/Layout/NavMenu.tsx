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
    <aside className="ubp-drawer w-64 h-full bg-white flex flex-col shrink-0">
      <div className="ubp-drawer-header flex items-center justify-between border-b border-slate-100">
        <div className="ubp-brand flex items-center gap-3">
          <div className="ubp-brand-mark">U</div>
          <div>
            <div className="ubp-brand-title text-slate-900 font-extrabold text-base leading-tight">
              {settings.company_name}
            </div>
            <div className="ubp-brand-sub text-xs text-slate-400 font-medium">UBP v2.1</div>
          </div>
        </div>
      </div>

      <nav className="ubp-nav flex-1 overflow-y-auto">
        {groups.map((group) => {
          // Filter screens visible to current actor
          const visibleScreens = group.screens.filter((s) => {
            const perm = ubpStore.checkPermission(s.code, ActionCodes.View);
            return perm.allowed;
          });

          if (visibleScreens.length === 0) return null;

          return (
            <div key={group.key} className="ubp-nav-group mb-4">
              <div className="ubp-nav-group-title text-slate-400 text-[11px] font-bold uppercase tracking-wider px-3 py-1">
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
                          ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
    </aside>
  );
};
