import React from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { AppRegistryScreens, ScreenCodes, ActionCodes } from '../types/ubp';
import { AppIcon } from '../components/Shared/AppIcon';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';

interface DashboardProps {
  onNavigate: (route: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t, language } = useI18n();
  const actor = ubpStore.getActor();
  const settings = ubpStore.getSettings();
  const branches = ubpStore.getBranches('', true);

  const canView = ubpStore.checkPermission(ScreenCodes.Dashboard, ActionCodes.View);
  if (!canView.allowed) {
    return <ForbiddenView onBack={() => onNavigate('/login')} />;
  }

  const currentBranch = branches.find((b) => b.id === actor?.current_branch_id);
  const branchName = currentBranch
    ? language === 'en' && currentBranch.name_en
      ? currentBranch.name_en
      : currentBranch.name_ar
    : t('branch.none');

  // Shortcuts: screens the user has permission to VIEW (except Dashboard)
  const shortcuts = AppRegistryScreens.filter((s) => {
    if (s.code === ScreenCodes.Dashboard) return false;
    const perm = ubpStore.checkPermission(s.code, ActionCodes.View);
    return perm.allowed;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="ubp-hero">
        <div>
          <div className="ubp-eyebrow">{t('dashboard.welcome')}</div>
          <h1>{settings.company_name}</h1>
          <p>
            {actor?.display_name || actor?.username} — {branchName}
          </p>
        </div>
        <div className="ubp-hero-mark">U</div>
      </div>

      {/* Stats Grid */}
      <div className="ubp-stats">
        <div className="ubp-stat">
          <AppIcon name="GitFork" size={28} className="text-teal-600" />
          <div>
            <span>{t('dashboard.branch')}</span>
            <strong>{branchName}</strong>
          </div>
        </div>

        <div className="ubp-stat">
          <AppIcon name="Person" size={28} className="text-teal-600" />
          <div>
            <span>{t('dashboard.user')}</span>
            <strong>{actor?.display_name || actor?.username}</strong>
          </div>
        </div>

        <div className="ubp-stat">
          <AppIcon name="Language" size={28} className="text-teal-600" />
          <div>
            <span>{t('dashboard.language')}</span>
            <strong>{language === 'ar' ? 'العربية' : 'English'}</strong>
          </div>
        </div>

        <div className="ubp-stat">
          <AppIcon name="Shield" size={28} className="text-teal-600" />
          <div>
            <span>{t('dashboard.role')}</span>
            <strong>
              {actor?.is_super_admin
                ? t('role.super_admin')
                : actor?.is_admin
                ? t('role.admin')
                : t('role.user')}
            </strong>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div>
        <PageHeader
          title={t('dashboard.shortcuts')}
          subtitle={t('dashboard.shortcuts_hint')}
        />
        <div className="ubp-shortcuts">
          {shortcuts.map((screen) => (
            <div
              key={screen.code}
              onClick={() => onNavigate(screen.route)}
              className="ubp-shortcut cursor-pointer"
            >
              <AppIcon name={screen.icon} size={22} className="text-teal-600 shrink-0" />
              <span className="truncate">{t(screen.title_key)}</span>
              <AppIcon name="ArrowForward" size={16} className="text-slate-400 ms-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
