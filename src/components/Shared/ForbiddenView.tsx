import React from 'react';
import { useI18n } from '../../i18n';
import { ShieldAlert } from 'lucide-react';

interface ForbiddenViewProps {
  onBack?: () => void;
}

export const ForbiddenView: React.FC<ForbiddenViewProps> = ({ onBack }) => {
  const { t } = useI18n();

  return (
    <div className="ubp-public-state circuit-error">
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'grid', placeItems: 'center' }}>
        <ShieldAlert size={36} />
      </div>
      <h1>{t('error.forbidden')}</h1>
      <p>{t('error.forbidden_hint')}</p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="ubp-primary-btn"
          style={{ marginTop: 18 }}
        >
          {t('common.home')}
        </button>
      )}
    </div>
  );
};
