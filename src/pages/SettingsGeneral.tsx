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
  const [busy, setBusy] = useState(false);

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit.allowed || busy) return;

    setBusy(true);
    try {
      const updated = ubpStore.updateSettings(settings);
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.settings_general')}
        subtitle={t('settings.general_hint')}
      />

      <div className="ubp-card ubp-form-card">
        {success && (
          <div className="mb-6 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3.5 rounded-xl text-sm font-semibold animate-in fade-in">
            <AppIcon name="CheckCircle" size={18} className="text-emerald-600 shrink-0" />
            <span>{t('settings.updated') || t('common.saved')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity & Company Section */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <AppIcon name="Building" size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">بيانات وهوية الشركة</h2>
            </div>

            <div className="ubp-form-grid">
              <label className="ubp-field ubp-span-2">
                <span className="font-semibold text-xs text-slate-700">{t('settings.company_name')} *</span>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  disabled={!canEdit.allowed}
                  required
                  placeholder="مثال: Universal Business Platform"
                  className="w-full text-slate-900 font-bold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none text-sm"
                />
              </label>

              <label className="ubp-field ubp-span-2">
                <span className="font-semibold text-xs text-slate-700">{t('settings.logo_url')}</span>
                <input
                  type="text"
                  value={settings.logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value || null })}
                  disabled={!canEdit.allowed}
                  placeholder="https://example.com/logo.png"
                  className="w-full text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none text-sm"
                />
              </label>
            </div>

            {/* Live Company Brand Preview */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-4">
              <div className="text-xs font-bold text-slate-500 shrink-0">معاينة شعار وهوية الشركة:</div>
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.company_name}
                    className="w-8 h-8 object-contain rounded-lg border border-slate-100"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {settings.company_name ? settings.company_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {settings.company_name || 'اسم الشركة'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {t('app.business_platform') || 'منصة إدارة الأعمال'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Rules & Formatting Section */}
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <AppIcon name="SlidersHorizontal" size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">قواعد العمل وتنسيقات الشركة</h2>
            </div>

            <div className="ubp-form-grid">
              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.default_language')}</span>
                <select
                  value={settings.default_language}
                  onChange={(e) => setSettings({ ...settings, default_language: e.target.value as 'ar' | 'en' })}
                  disabled={!canEdit.allowed}
                  className="ubp-select w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="ar">{t('language.ar') || 'العربية (Arabic)'}</option>
                  <option value="en">{t('language.en') || 'English'}</option>
                </select>
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.date_format')}</span>
                <select
                  value={settings.date_format}
                  onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                  disabled={!canEdit.allowed}
                  className="ubp-select w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="dd/MM/yyyy">dd/MM/yyyy (19/10/2026)</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd (2026-10-19)</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy (10/19/2026)</option>
                  <option value="dd-MMM-yyyy">dd-MMM-yyyy (19-Oct-2026)</option>
                </select>
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.time_format')}</span>
                <select
                  value={settings.time_format}
                  onChange={(e) => setSettings({ ...settings, time_format: e.target.value })}
                  disabled={!canEdit.allowed}
                  className="ubp-select w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="HH:mm">24 ساعة (14:30)</option>
                  <option value="hh:mm tt">12 ساعة (02:30 م)</option>
                </select>
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.number_format')}</span>
                <select
                  value={settings.number_format}
                  onChange={(e) => setSettings({ ...settings, number_format: e.target.value })}
                  disabled={!canEdit.allowed}
                  className="ubp-select w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                >
                  <option value="#,##0.00">#,##0.00 (1,234.56)</option>
                  <option value="#,##0">#,##0 (1,235)</option>
                  <option value="#,##0.000">#,##0.000 (1,234.560)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Security & Access Policies Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <AppIcon name="Shield" size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-800">سياسات أمان الجلسات وحسابات الشركة</h2>
            </div>

            <div className="ubp-form-grid">
              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.session_timeout')}</span>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={settings.session_timeout_minutes}
                  onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value, 10) || 30 })}
                  disabled={!canEdit.allowed}
                  className="w-full text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.password_min')}</span>
                <input
                  type="number"
                  min={8}
                  max={64}
                  value={settings.password_min_length}
                  onChange={(e) => setSettings({ ...settings, password_min_length: parseInt(e.target.value, 10) || 8 })}
                  disabled={!canEdit.allowed}
                  className="w-full text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.max_attempts')}</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.max_failed_attempts}
                  onChange={(e) => setSettings({ ...settings, max_failed_attempts: parseInt(e.target.value, 10) || 5 })}
                  disabled={!canEdit.allowed}
                  className="w-full text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </label>

              <label className="ubp-field">
                <span className="font-semibold text-xs text-slate-700">{t('settings.lockout_minutes')}</span>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={settings.lockout_minutes}
                  onChange={(e) => setSettings({ ...settings, lockout_minutes: parseInt(e.target.value, 10) || 15 })}
                  disabled={!canEdit.allowed}
                  className="w-full text-slate-800 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
              </label>
            </div>
          </div>

          <div className="ubp-form-footer pt-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              {t('settings.version')} {settings.version}
            </span>
            {canEdit.allowed && (
              <button
                type="submit"
                disabled={busy}
                className="ubp-primary-btn px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {busy ? 'جاري الحفظ...' : t('common.save')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
