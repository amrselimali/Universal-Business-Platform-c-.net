import React from 'react';
import {
  LayoutDashboard,
  Sliders,
  GitFork,
  Warehouse as WarehouseIcon,
  Coins,
  SlidersHorizontal,
  Users,
  ShieldCheck,
  History,
  FlaskConical,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Search,
  X,
  Globe,
  Building,
  User as UserIcon,
  Shield,
  ExternalLink,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Play,
  Eye,
  Check,
  Layers,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useI18n } from '../../i18n';

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = '', size = 20 }) => {
  const { direction } = useI18n();

  switch (name) {
    case 'LayoutDashboard':
    case 'Dashboard':
      return <LayoutDashboard size={size} className={className} />;
    case 'Sliders':
    case 'Settings':
      return <Sliders size={size} className={className} />;
    case 'GitFork':
    case 'AccountTree':
      return <GitFork size={size} className={className} />;
    case 'Warehouse':
      return <WarehouseIcon size={size} className={className} />;
    case 'Coins':
    case 'Paid':
      return <Coins size={size} className={className} />;
    case 'SlidersHorizontal':
    case 'Tune':
      return <SlidersHorizontal size={size} className={className} />;
    case 'Users':
    case 'ManageAccounts':
      return <Users size={size} className={className} />;
    case 'ShieldCheck':
    case 'AdminPanelSettings':
      return <ShieldCheck size={size} className={className} />;
    case 'History':
      return <History size={size} className={className} />;
    case 'FlaskConical':
    case 'Science':
      return <FlaskConical size={size} className={className} />;
    case 'Database':
    case 'Storage':
      return <Database size={size} className={className} />;
    case 'ArrowForward':
      return direction === 'rtl' ? <ArrowLeft size={size} className={className} /> : <ArrowRight size={size} className={className} />;
    case 'CheckCircle':
      return <CheckCircle2 size={size} className={className} />;
    case 'Plus':
      return <Plus size={size} className={className} />;
    case 'Edit':
      return <Edit size={size} className={className} />;
    case 'Trash':
    case 'Trash2':
      return <Trash2 size={size} className={className} />;
    case 'Lock':
      return <Lock size={size} className={className} />;
    case 'Unlock':
      return <Unlock size={size} className={className} />;
    case 'Key':
    case 'KeyRound':
      return <KeyRound size={size} className={className} />;
    case 'Search':
      return <Search size={size} className={className} />;
    case 'Close':
    case 'X':
      return <X size={size} className={className} />;
    case 'Globe':
    case 'Language':
      return <Globe size={size} className={className} />;
    case 'Building':
    case 'Branch':
      return <Building size={size} className={className} />;
    case 'Person':
    case 'User':
      return <UserIcon size={size} className={className} />;
    case 'Shield':
      return <Shield size={size} className={className} />;
    case 'Refresh':
    case 'RefreshCw':
      return <RefreshCw size={size} className={className} />;
    case 'LogOut':
      return <LogOut size={size} className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle size={size} className={className} />;
    case 'Play':
      return <Play size={size} className={className} />;
    case 'Eye':
      return <Eye size={size} className={className} />;
    case 'Check':
      return <Check size={size} className={className} />;
    case 'Layers':
      return <Layers size={size} className={className} />;
    case 'Menu':
      return <Menu size={size} className={className} />;
    case 'ChevronDown':
    case 'ArrowDown':
      return <ChevronDown size={size} className={className} />;
    default:
      return <ExternalLink size={size} className={className} />;
  }
};
