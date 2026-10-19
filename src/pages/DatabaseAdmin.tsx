import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import {
  ScreenCodes,
  ActionCodes,
  DatabaseStatus,
  TableInfo,
  RowPage,
} from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const DatabaseAdmin: React.FC = () => {
  const { t } = useI18n();
  const actor = ubpStore.getActor();

  // Super Admin check
  if (!actor?.is_super_admin) {
    return <ForbiddenView />;
  }

  const canView = ubpStore.checkPermission(ScreenCodes.DatabaseAdmin, ActionCodes.View);
  const canMigrate = ubpStore.checkPermission(ScreenCodes.DatabaseAdmin, ActionCodes.RunMigrations);
  const canEditRows = ubpStore.checkPermission(ScreenCodes.DatabaseAdmin, ActionCodes.EditRows);

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const [dbStatus, setDbStatus] = useState<DatabaseStatus>(() => ubpStore.getDatabaseStatus());
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationMsg, setMigrationMsg] = useState<string | null>(null);

  // Table Rows Modal
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [rowPage, setRowPage] = useState<RowPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Row Action (Edit / Delete) Modal
  const [actionType, setActionType] = useState<'EDIT' | 'DELETE' | null>(null);
  const [targetRow, setTargetRow] = useState<Record<string, unknown> | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, unknown>>({});

  const reloadStatus = () => {
    setDbStatus(ubpStore.getDatabaseStatus());
  };

  const handleRunMigrations = () => {
    if (!canMigrate.allowed) return;
    setMigrationRunning(true);
    setMigrationMsg(null);

    setTimeout(() => {
      const outcome = ubpStore.runMigrations();
      setMigrationRunning(false);
      if (outcome.Success) {
        setMigrationMsg('تم تنفيذ جميع الترحيلات بنجاح وتم فحص بنية الجداول');
      } else {
        setMigrationMsg(outcome.Error || 'حدث خطأ أثناء تنفيذ الترحيل');
      }
      reloadStatus();
    }, 500);
  };

  const openTableRows = (tableName: string, page = 1) => {
    setActiveTable(tableName);
    setCurrentPage(page);
    const data = ubpStore.getTableRows(tableName, page, 15);
    setRowPage(data);
  };

  const openRowAction = (type: 'EDIT' | 'DELETE', row: Record<string, unknown>) => {
    setActionType(type);
    setTargetRow(row);
    setConfirmationInput('');
    setActionError(null);
    setEditedFields({ ...row });
  };

  const handleExecuteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTable || !targetRow || !actionType) return;
    setActionError(null);

    const recordId = String(targetRow.id || targetRow.code || '');

    try {
      if (actionType === 'EDIT') {
        ubpStore.updateTableRow(activeTable, recordId, editedFields, confirmationInput);
      } else {
        ubpStore.deleteTableRow(activeTable, recordId, confirmationInput);
      }
      setActionType(null);
      setTargetRow(null);
      openTableRows(activeTable, currentPage);
      reloadStatus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(t(err.message) || err.message);
      }
    }
  };

  const handleResetToSeed = () => {
    if (confirm('هل أنت متأكد من إعادة ضبط قاعدة البيانات للبيانات الافتراضية (Seed Data)؟')) {
      ubpStore.resetAllToSeed();
      reloadStatus();
      if (activeTable) {
        openTableRows(activeTable, 1);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.database_admin')}
        subtitle="إدارة الجداول، استعراض الصفوف، تشغيل الترحيلات وحوكمة قاعدة البيانات (Super Admin Only)"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetToSeed}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <AppIcon name="Refresh" size={16} />
              <span>إعادة التهيئة (Seed)</span>
            </button>

            {canMigrate.allowed && (
              <button
                type="button"
                disabled={migrationRunning}
                onClick={handleRunMigrations}
                className="ubp-primary-btn flex items-center gap-2"
              >
                <AppIcon name="Database" size={16} />
                <span>
                  {migrationRunning ? 'جاري التنفيذ...' : t('action.run_migrations')}
                </span>
              </button>
            )}
          </div>
        }
      />

      {/* Database Connection Card */}
      <div className="ubp-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 font-mono">
              {dbStatus.server} — db: {dbStatus.database}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Connected User: <strong className="text-slate-800">{dbStatus.user}</strong> • Applied Migrations: {dbStatus.applied.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            قاعدة البيانات متصلة وجاهزة
          </span>
        </div>
      </div>

      {migrationMsg && (
        <div className="ubp-alert success flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-sm">
          <AppIcon name="CheckCircle" size={18} className="text-emerald-600" />
          <span>{migrationMsg}</span>
        </div>
      )}

      {/* Tables Grid */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 mb-3">
          جداول المنصة (21 Tables in Schema)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dbStatus.tables.map((tInfo: TableInfo) => (
            <div
              key={tInfo.name}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-teal-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {tInfo.name}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                    {tInfo.columns_count} cols
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  عدد الصفوف: <strong className="text-slate-900 font-mono">{tInfo.rows_count}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => openTableRows(tInfo.name)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 flex items-center gap-1.5"
                >
                  <AppIcon name="Eye" size={14} />
                  <span>استعراض الصفوف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Migrations Section */}
      <div className="ubp-card">
        <h3 className="text-sm font-extrabold text-slate-800 mb-3">
          الترحيلات المنفذة (DbUp Migrations History):
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {dbStatus.applied.map((script) => (
            <div
              key={script}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 flex items-center gap-2"
            >
              <AppIcon name="CheckCircle" size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate">{script}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table Rows Viewer Modal */}
      {activeTable && rowPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-mono">
                  Table: {activeTable}
                </h2>
                <span className="text-xs text-slate-500">
                  إجمالي الصفوف: {rowPage.total_rows} • الصفحة {rowPage.page}
                </span>
              </div>
              <button onClick={() => setActiveTable(null)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            {/* Rows Table */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-xl">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-mono uppercase font-bold sticky top-0">
                    {rowPage.columns.map((c) => (
                      <th key={c.name} className="p-3 text-start whitespace-nowrap">
                        {c.name} {c.is_primary_key && <span className="text-teal-600 font-bold">*PK</span>}
                      </th>
                    ))}
                    {canEditRows.allowed && activeTable !== 'audit_log' && (
                      <th className="p-3 text-end">{t('common.actions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {rowPage.rows.length === 0 ? (
                    <tr>
                      <td colSpan={rowPage.columns.length + 1} className="p-6 text-center text-slate-400">
                        {t('common.no_data')}
                      </td>
                    </tr>
                  ) : (
                    rowPage.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {rowPage.columns.map((c) => {
                          const val = row[c.name];
                          return (
                            <td key={c.name} className="p-3 text-slate-800 max-w-[200px] truncate">
                              {val === null || val === undefined ? (
                                <span className="text-slate-300 italic">null</span>
                              ) : typeof val === 'object' ? (
                                JSON.stringify(val)
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                        {canEditRows.allowed && activeTable !== 'audit_log' && (
                          <td className="p-3 text-end font-sans">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openRowAction('EDIT', row)}
                                className="px-2 py-1 rounded-md text-teal-700 bg-teal-50 border border-teal-200 text-xs font-bold"
                              >
                                {t('common.edit')}
                              </button>
                              <button
                                type="button"
                                onClick={() => openRowAction('DELETE', row)}
                                className="px-2 py-1 rounded-md text-red-700 bg-red-50 border border-red-200 text-xs font-bold"
                              >
                                {t('common.delete')}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-4">
              <span className="text-xs text-slate-500">
                عرض {rowPage.rows.length} من {rowPage.total_rows}
              </span>
              <button
                type="button"
                onClick={() => setActiveTable(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row Edit / Delete Confirmation Modal */}
      {actionType && targetRow && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95">
            <h2 className={`text-lg font-bold mb-2 ${actionType === 'DELETE' ? 'text-red-600' : 'text-slate-900'}`}>
              {actionType === 'DELETE' ? `حذف صف من الجدول ${activeTable}` : `تعديل صف في الجدول ${activeTable}`}
            </h2>

            <p className="text-xs text-slate-600 mb-4">
              {actionType === 'DELETE'
                ? `للحذف الآمن، يُشترط كتابة عبارة التأكيد الصريحة: `
                : `للتأكيد الصريح، اكتب العبارة التالية: `}
              <code className="bg-slate-100 font-bold px-1.5 py-0.5 rounded text-red-700 font-mono">
                {actionType === 'DELETE' ? `DELETE ${activeTable}` : `UPDATE ${activeTable}`}
              </code>
            </p>

            {actionError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="space-y-4">
              {actionType === 'EDIT' && (
                <div className="space-y-3 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {Object.keys(targetRow).map((key) => {
                    if (key === 'id' || key === 'created_at' || key === 'version') return null;
                    return (
                      <label key={key} className="block text-xs">
                        <span className="font-bold text-slate-600 font-mono block mb-1">{key}:</span>
                        <input
                          type="text"
                          value={String(editedFields[key] ?? '')}
                          onChange={(e) => setEditedFields({ ...editedFields, [key]: e.target.value })}
                          className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              <label className="ubp-field">
                <span>عبارة التأكيد (Confirmation):</span>
                <input
                  type="text"
                  placeholder={actionType === 'DELETE' ? `DELETE ${activeTable}` : `UPDATE ${activeTable}`}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  required
                  className="w-full font-mono text-sm border-2 border-red-200 focus:border-red-500"
                />
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActionType(null);
                    setTargetRow(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white font-bold rounded-xl text-sm ${
                    actionType === 'DELETE' ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  {actionType === 'DELETE' ? t('common.delete') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
