import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { AppIcon } from '../components/Shared/AppIcon';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { t, language, toggleLanguage } = useI18n();
  const settings = ubpStore.getSettings();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setLoading(true);

    setTimeout(() => {
      const res = ubpStore.login(username, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorKey(res.errorKey || 'validation.invalid_credentials');
      }
    }, 200);
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="ubp-login">
      {/* Brand Side */}
      <section className="ubp-login-brand">
        <div className="ubp-login-brand-inner">
          <div className="ubp-brand-mark large mb-6">U</div>
          <h1>{settings.company_name}</h1>
          <p>{t('app.tagline')}</p>
          <ul className="ubp-login-points">
            <li>
              <AppIcon name="CheckCircle" size={18} className="text-teal-200 shrink-0" />
              <span>{t('app.point_cloud')}</span>
            </li>
            <li>
              <AppIcon name="CheckCircle" size={18} className="text-teal-200 shrink-0" />
              <span>{t('app.point_branches')}</span>
            </li>
            <li>
              <AppIcon name="CheckCircle" size={18} className="text-teal-200 shrink-0" />
              <span>{t('app.point_permissions')}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Form Side */}
      <section className="ubp-login-panel flex flex-col justify-between">
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <form onSubmit={handleSubmit} className="ubp-login-card">
            <div className="mb-2">
              <h2>{t('auth.welcome')}</h2>
              <p className="ubp-muted text-sm">{t('auth.subtitle')}</p>
            </div>

            {errorKey && (
              <div className="ubp-alert error flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600 shrink-0" />
                <span>{t(errorKey)}</span>
              </div>
            )}

            <label className="ubp-field">
              <span>{t('auth.username')}</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full text-slate-800 font-medium"
              />
            </label>

            <label className="ubp-field">
              <span>{t('auth.password')}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full text-slate-800 font-medium"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="ubp-primary-btn w-full mt-2"
            >
              {loading ? t('common.save') + '...' : t('auth.login')}
            </button>

            {/* Quick Demo Credentials */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                بيانات الدخول السريع (Demo Accounts):
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                >
                  Super Admin (admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('manager_cairo', 'User@123')}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                >
                  Branch Manager (manager_cairo)
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="ubp-login-footer max-w-[420px] mx-auto w-full border-t border-slate-100 pt-4 flex items-center justify-between">
          <span className="text-slate-500 text-xs">{t('auth.language')}:</span>
          <button
            type="button"
            onClick={toggleLanguage}
            className="ubp-lang-btn text-xs"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </section>
    </div>
  );
};
