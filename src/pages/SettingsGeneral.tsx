import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, AppSettings } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const SettingsGeneral: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.SettingsGeneral, ActionCodes.View);
  const canEdit = ubpStore.checkPermission(ScreenCodes.SettingsGeneral, ActionCodes.Edit);

  const [settings, setSettings] = useState<AppSettings>(() => ubpStore.getSettings());
  const [success, setSuccess] = useState(false);

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit.allowed) return;

    ubpStore.updateSettings(settings);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.settings_general')}
        subtitle={t('settings.general_hint') || 'إعدادات المنصة وقواعد العمل العامة والتنسيقات'}
      />

      <div className="ubp-card ubp-form-card">
        {success && (
          <div className="ubp-alert success mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl">
            <AppIcon name="CheckCircle" size={18} className="text-emerald-600" />
            <span>{t('common.saved')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="ubp-form-grid">
            <label className="ubp-field ubp-span-2">
              <span>{t('settings.company_name')}</span>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                disabled={!canEdit.allowed}
                required
                className="w-full text-slate-800 font-semibold"
              />
            </label>

            <label className="ubp-field">
              <span>{t('settings.default_language')}</span>
              <select
                value={settings.default_language}
                onChange={(e) => setSettings({ ...settings, default_language: e.target.value as 'ar' | 'en' })}
                disabled={!canEdit.allowed}
                className="ubp-select w-full"
              >
                <option value="ar">العربية (Arabic)</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="ubp-field">
              <span>{t('settings.date_format')}</span>
              <select
                value={settings.date_format}
                onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                disabled={!canEdit.allowed}
                className="ubp-select w-full"
              >
                <option value="dd/MM/yyyy">dd/MM/yyyy (19/10/2026)</option>
                <option value="yyyy-MM-dd">yyyy-MM-dd (2026-10-19)</option>
                <option value="MM/dd/yyyy">MM/dd/yyyy (10/19/2026)</option>
              </select>
            </label>

            <label className="ubp-field">
              <span>{t('settings.time_format')}</span>
              <select
                value={settings.time_format}
                onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                disabled={!canEdit.allowed}
                className="ubp-select w-full"
              >
                <option value="HH:mm">24 ساعة (14:30)</option>
                <option value="hh:mm tt">12 ساعة (02:30 م)</option>
              </select>
            </label>

            <label className="ubp-field">
              <span>{t('settings.number_format')}</span>
              <select
                value={settings.number_format}
                onChange={(e) => setSettings({ ...settings, number_format: e.target.value })}
                disabled={!canEdit.allowed}
                className="ubp-select w-full"
              >
                <option value="#,##0.00">1,234.56</option>
                <option value="#,##0">1,235</option>
              </select>
            </label>

            <label className="ubp-field">
              <span>{t('settings.session_timeout_minutes')}</span>
              <input
                type="number"
                min={5}
                max={480}
                value={settings.session_timeout_minutes}
                onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value, 10) || 30 })}
                disabled={!canEdit.allowed}
                className="w-full text-slate-800"
              />
            </label>

            <label className="ubp-field">
              <span>{t('settings.password_min_length')}</span>
              <input
                type="number"
                min={6}
                max={32}
                value={settings.password_min_length}
                onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value, 10) || 8 })}
                disabled={!canEdit.allowed}
                className="w-full text-slate-800"
              />
            </label>

            <label className="ubp-field">
              <span>{t('settings.max_failed_attempts')}</span>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.max_failed_attempts}
                onChange={(e) => setSettings({ ...settings, max_failed_attempts: parseInt(e.target.value, 10) || 5 })}
                disabled={!canEdit.allowed}
                className="w-full text-slate-800"
              />
            </label>

            <label className="ubp-field">
              <span>{t('settings.lockout_minutes')}</span>
              <input
                type="number"
                min={1}
                max={1440}
                value={settings.lockout_minutes}
                onChange={(e) => setSettings({ ...settings, lockout_minutes: parseInt(e.target.value, 10) || 15 })}
                disabled={!canEdit.allowed}
                className="w-full text-slate-800"
              />
            </label>
          </div>

          {canEdit.allowed && (
            <div className="ubp-form-footer">
              <button type="submit" className="ubp-primary-btn">
                {t('common.save')}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
