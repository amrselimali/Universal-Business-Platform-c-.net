import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, AuditEntry, AuditFilter } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const AuditLog: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.AuditLog, ActionCodes.View);

  const branches = ubpStore.getBranches('', true);
  const users = ubpStore.getUsersPaged('', 1, 100).items;

  const [filter, setFilter] = useState<AuditFilter>({
    table_name: '',
    action: '',
    branch_id: '',
    user_id: '',
    from: '',
    to: '',
  });

  const [logs, setLogs] = useState<AuditEntry[]>(() => ubpStore.getAuditLogs());
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setLogs(ubpStore.getAuditLogs(filter));
  };

  const handleClearFilter = () => {
    const clean: AuditFilter = { table_name: '', action: '', branch_id: '', user_id: '', from: '', to: '' };
    setFilter(clean);
    setCurrentPage(1);
    setLogs(ubpStore.getAuditLogs());
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'medium' });
    } catch {
      return iso;
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'DELETE':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'LOGIN_FAILED':
        return 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';
      case 'PERMISSION_CHANGE':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'PASSWORD_RESET':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'MIGRATION':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getActionTitle = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT':
        return 'INSERT (إضافة)';
      case 'UPDATE':
        return 'UPDATE (تعديل)';
      case 'DELETE':
        return 'DELETE (حذف)';
      case 'LOGIN':
        return 'LOGIN (دخول)';
      case 'LOGOUT':
        return 'LOGOUT (خروج)';
      case 'LOGIN_FAILED':
        return 'LOGIN_FAILED (فشل دخول)';
      case 'PERMISSION_CHANGE':
        return 'PERMISSION_CHANGE (تغيير صلاحيات)';
      case 'PASSWORD_RESET':
        return 'PASSWORD_RESET (تعيين كلمة مرور)';
      case 'MIGRATION':
        return 'MIGRATION (ترحيل)';
      default:
        return action;
    }
  };

  // Keyset / Paged slice
  const totalCount = logs.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const pagedLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.audit')}
        subtitle={t('audit.list_hint') || 'سجل العمليات والأنشطة غير القابل للتعديل لجميع حركات النظام'}
      />

      {/* Filter Toolbar */}
      <div className="ubp-card flex flex-wrap items-end gap-3 !p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">{t('audit.table') || 'الجدول'}:</span>
          <select
            value={filter.table_name || ''}
            onChange={(e) => setFilter({ ...filter, table_name: e.target.value })}
            className="ubp-select text-xs py-2 px-3 border border-slate-300 rounded-xl"
          >
            <option value="">{t('common.all') || 'كل الجداول'}</option>
            <option value="users">users</option>
            <option value="branches">branches</option>
            <option value="warehouses">warehouses</option>
            <option value="currencies">currencies</option>
            <option value="roles">roles</option>
            <option value="custom_field_definitions">custom_field_definitions</option>
            <option value="app_settings">app_settings</option>
            <option value="schemaversions">schemaversions</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">{t('audit.action') || 'نوع العملية'}:</span>
          <select
            value={filter.action || ''}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="ubp-select text-xs py-2 px-3 border border-slate-300 rounded-xl"
          >
            <option value="">{t('common.all') || 'كل العمليات'}</option>
            <option value="INSERT">INSERT (إضافة / إنشاء)</option>
            <option value="UPDATE">UPDATE (تعديل)</option>
            <option value="DELETE">DELETE (حذف)</option>
            <option value="LOGIN">LOGIN (تسجيل دخول)</option>
            <option value="LOGOUT">LOGOUT (تسجيل خروج)</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED (محاولة فاشلة)</option>
            <option value="PERMISSION_CHANGE">PERMISSION_CHANGE (صلاحيات)</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET (كلمة المرور)</option>
            <option value="MIGRATION">MIGRATION (ترحيل قاعدة بيانات)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">{t('dashboard.branch') || 'الفرع'}:</span>
          <select
            value={filter.branch_id || ''}
            onChange={(e) => setFilter({ ...filter, branch_id: e.target.value })}
            className="ubp-select text-xs py-2 px-3 border border-slate-300 rounded-xl"
          >
            <option value="">{t('common.all') || 'كل الفروع'}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name_ar} ({b.code})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">{t('dashboard.user') || 'المستخدم'}:</span>
          <select
            value={filter.user_id || ''}
            onChange={(e) => setFilter({ ...filter, user_id: e.target.value })}
            className="ubp-select text-xs py-2 px-3 border border-slate-300 rounded-xl"
          >
            <option value="">{t('common.all') || 'كل المستخدمين'}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name || u.username} (@{u.username})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">من تاريخ:</span>
          <input
            type="date"
            value={filter.from ? filter.from.split('T')[0] : ''}
            onChange={(e) => setFilter({ ...filter, from: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            className="ubp-select text-xs py-1.5 px-2 border border-slate-300 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-600">إلى تاريخ:</span>
          <input
            type="date"
            value={filter.to ? filter.to.split('T')[0] : ''}
            onChange={(e) => setFilter({ ...filter, to: e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : '' })}
            className="ubp-select text-xs py-1.5 px-2 border border-slate-300 rounded-xl"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApplyFilter}
            className="ubp-primary-btn text-xs py-2 px-4 font-bold rounded-xl"
          >
            {t('common.apply')}
          </button>

          {(filter.table_name || filter.action || filter.branch_id || filter.user_id || filter.from || filter.to) && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-2 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              {t('common.clear')}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 text-start">ID</th>
                <th className="p-4 text-start">{t('audit.timestamp') || 'الوقت والتاريخ'}</th>
                <th className="p-4 text-start">{t('dashboard.user')}</th>
                <th className="p-4 text-start">{t('dashboard.branch')}</th>
                <th className="p-4 text-start">{t('audit.table') || 'الجدول'}</th>
                <th className="p-4 text-center">{t('audit.action') || 'العملية'}</th>
                <th className="p-4 text-start font-mono">Trace ID</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium font-sans">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                pagedLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-700">#{entry.id}</td>
                    <td className="p-4 text-slate-600 font-sans">{formatDateTime(entry.created_at)}</td>
                    <td className="p-4 font-sans font-bold text-slate-900">{entry.username || 'system'}</td>
                    <td className="p-4 font-sans text-slate-600">{entry.branch_name || '—'}</td>
                    <td className="p-4 font-bold text-teal-800">{entry.table_name}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[11px] ${getActionBadgeClass(entry.action)}`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{entry.trace_id}</td>
                    <td className="p-4 text-end font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                      >
                        {t('action.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Keyset / Page Navigation Controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/60 text-xs">
          <span className="text-slate-500 font-medium">
            عرض {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} إلى {Math.min(currentPage * PAGE_SIZE, totalCount)} من إجمالي {totalCount} حركة
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              السابق
            </button>
            <span className="font-bold text-slate-700 px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-white disabled:opacity-40 cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  تفاصيل حركة السجل #{selectedEntry.id}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedEntry.table_name} • {getActionTitle(selectedEntry.action)} • Record ID: {selectedEntry.record_id}
                </span>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">المستخدم:</span>
                  <strong className="text-slate-800">{selectedEntry.username || 'system'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">الفرع:</span>
                  <strong className="text-slate-800">{selectedEntry.branch_name || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">عنوان IP:</span>
                  <strong className="text-slate-800 font-mono">{selectedEntry.ip_address || '127.0.0.1'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">رقم التتبع Trace ID:</span>
                  <strong className="text-slate-800 font-mono">{selectedEntry.trace_id}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">وقت وتاريخ الحركة:</span>
                  <strong className="text-slate-800">{formatDateTime(selectedEntry.created_at)}</strong>
                </div>
              </div>

              {/* Data Diff View */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  بيانات الحركة (Before / After Payload)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-slate-200 rounded-xl p-3 bg-red-50/20">
                    <span className="text-xs font-bold text-red-700 block mb-2">
                      البيانات السابقة (Old Data):
                    </span>
                    <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-56">
                      {selectedEntry.old_data ? JSON.stringify(selectedEntry.old_data, null, 2) : 'null (حركة إنشاء أولى)'}
                    </pre>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3 bg-emerald-50/20">
                    <span className="text-xs font-bold text-emerald-700 block mb-2">
                      البيانات الجديدة (New Data):
                    </span>
                    <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-56">
                      {selectedEntry.new_data ? JSON.stringify(selectedEntry.new_data, null, 2) : 'null (حركة حذف)'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('common.close') || 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
