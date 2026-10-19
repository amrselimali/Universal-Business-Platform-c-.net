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

  const [filter, setFilter] = useState<AuditFilter>({
    table_name: '',
    action: '',
  });

  const [logs, setLogs] = useState<AuditEntry[]>(() => ubpStore.getAuditLogs());
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const handleApplyFilter = () => {
    setLogs(ubpStore.getAuditLogs(filter));
  };

  const handleClearFilter = () => {
    setFilter({ table_name: '', action: '' });
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.audit')}
        subtitle={t('audit.list_hint') || 'سجل العمليات والأنشطة غير القابل للتعديل لجميع حركات النظام'}
      />

      {/* Filter Toolbar */}
      <div className="ubp-card flex flex-wrap items-center gap-3 !p-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{t('audit.table') || 'الجدول'}:</span>
          <select
            value={filter.table_name || ''}
            onChange={(e) => setFilter({ ...filter, table_name: e.target.value })}
            className="ubp-select text-xs py-1.5"
          >
            <option value="">{t('common.all') || 'كل الجداول'}</option>
            <option value="users">users</option>
            <option value="branches">branches</option>
            <option value="warehouses">warehouses</option>
            <option value="currencies">currencies</option>
            <option value="roles">roles</option>
            <option value="app_settings">app_settings</option>
            <option value="schemaversions">schemaversions</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{t('audit.action') || 'نوع العملية'}:</span>
          <select
            value={filter.action || ''}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="ubp-select text-xs py-1.5"
          >
            <option value="">{t('common.all') || 'كل العمليات'}</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="MIGRATION">MIGRATION</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleApplyFilter}
          className="ubp-primary-btn text-xs py-2 px-3 font-semibold"
        >
          {t('common.apply')}
        </button>

        {(filter.table_name || filter.action) && (
          <button
            type="button"
            onClick={handleClearFilter}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            {t('common.clear')}
          </button>
        )}
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium font-sans">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                logs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-700">#{entry.id}</td>
                    <td className="p-4 text-slate-600 font-sans">{formatDateTime(entry.created_at)}</td>
                    <td className="p-4 font-sans font-bold text-slate-900">{entry.username || 'system'}</td>
                    <td className="p-4 font-sans text-slate-600">{entry.branch_name || '—'}</td>
                    <td className="p-4 font-bold text-teal-800">{entry.table_name}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          entry.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : entry.action === 'UPDATE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : entry.action === 'DELETE'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{entry.trace_id}</td>
                    <td className="p-4 text-end font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100"
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
                  {selectedEntry.table_name} • {selectedEntry.action} • Record ID: {selectedEntry.record_id}
                </span>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600">
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
                  <span className="text-slate-400 block">Trace ID:</span>
                  <strong className="text-slate-800 font-mono">{selectedEntry.trace_id}</strong>
                </div>
              </div>

              {/* Data Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">
                    البيانات السابقة (Old Data):
                  </span>
                  <pre className="bg-slate-900 text-slate-200 text-xs p-3 rounded-xl font-mono overflow-x-auto max-h-60">
                    {selectedEntry.old_data
                      ? JSON.stringify(selectedEntry.old_data, null, 2)
                      : '// لا توجد بيانات سابقة (سجل جديد)'}
                  </pre>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-600 block mb-1">
                    البيانات الجديدة (New Data):
                  </span>
                  <pre className="bg-slate-900 text-teal-300 text-xs p-3 rounded-xl font-mono overflow-x-auto max-h-60">
                    {selectedEntry.new_data
                      ? JSON.stringify(selectedEntry.new_data, null, 2)
                      : '// تم حذف السجل'}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
