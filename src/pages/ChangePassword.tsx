import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { PageHeader } from '../components/Shared/PageHeader';
import { AppIcon } from '../components/Shared/AppIcon';

interface ChangePasswordProps {
  onSuccess: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess }) => {
  const { t } = useI18n();
  const settings = ubpStore.getSettings();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setErrorKey('validation.passwords_do_not_match');
      return;
    }

    if (newPassword.length < settings.password_min_length) {
      setErrorKey('validation.password_too_short');
      return;
    }

    const res = ubpStore.changePassword(currentPassword, newPassword);
    if (res.success) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setErrorKey(res.errorKey || 'validation.current_password_incorrect');
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title={t('auth.change_password')}
        subtitle={t('auth.change_password_hint')}
      />

      <div className="ubp-card">
        {success && (
          <div className="ubp-alert success mb-4 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200">
            <AppIcon name="CheckCircle" size={18} className="text-emerald-600" />
            <span>{t('common.saved')}</span>
          </div>
        )}

        {errorKey && (
          <div className="ubp-alert error mb-4 flex items-center gap-2">
            <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
            <span>{t(errorKey)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="ubp-field">
            <span>{t('auth.current_password')}</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full text-slate-800"
            />
          </label>

          <label className="ubp-field">
            <span>{t('auth.new_password')}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={settings.password_min_length}
              className="w-full text-slate-800"
            />
          </label>

          <label className="ubp-field">
            <span>{t('auth.confirm_password')}</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full text-slate-800"
            />
          </label>

          <div className="ubp-form-footer">
            <button type="submit" className="ubp-primary-btn">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
