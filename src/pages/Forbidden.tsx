import React from 'react';
import { ForbiddenView } from '../components/Shared/ForbiddenView';

interface ForbiddenProps {
  onBack: () => void;
}

export const Forbidden: React.FC<ForbiddenProps> = ({ onBack }) => {
  return <ForbiddenView onBack={onBack} />;
};
