import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, Branch, BranchInput } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const Branches: React.FC = () => {
  const { t, language } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.Branches, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.Branches, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.Branches, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.Branches, ActionCodes.Delete);
  const canToggle = ubpStore.checkPermission(ScreenCodes.Branches, ActionCodes.ToggleActive);

  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedData, setPagedData] = useState(() => ubpStore.getBranchesPaged('', false, 1, 25));
  const branchCustomFields = ubpStore.getCustomFields('branches').filter((f) => f.is_active);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formInput, setFormInput] = useState<BranchInput>({
    code: '',
    name_ar: '',
    name_en: '',
    address: '',
    phone: '',
    is_active: true,
    custom_fields: {},
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Delete Confirm Dialog
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reloadData = (page = currentPage, query = search, incInactive = includeInactive) => {
    const res = ubpStore.getBranchesPaged(query, incInactive, page, 25);
    setPagedData(res);
    setCurrentPage(res.page);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    reloadData(1, val, includeInactive);
  };

  const handleIncludeInactiveToggle = () => {
    const nextVal = !includeInactive;
    setIncludeInactive(nextVal);
    reloadData(1, search, nextVal);
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingBranch(null);
    const initialCustom: Record<string, unknown> = {};
    branchCustomFields.forEach((cf) => {
      initialCustom[cf.field_key] = cf.data_type === 'bool' ? false : '';
    });
    setFormInput({
      code: '',
      name_ar: '',
      name_en: '',
      address: '',
      phone: '',
      is_active: true,
      custom_fields: initialCustom,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (b: Branch) => {
    setEditingBranch(b);
    const initialCustom: Record<string, unknown> = { ...(b.custom_fields || {}) };
    branchCustomFields.forEach((cf) => {
      if (initialCustom[cf.field_key] === undefined) {
        initialCustom[cf.field_key] = cf.data_type === 'bool' ? false : '';
      }
    });
    setFormInput({
      code: b.code,
      name_ar: b.name_ar,
      name_en: b.name_en || '',
      address: b.address || '',
      phone: b.phone || '',
      is_active: b.is_active,
      custom_fields: initialCustom,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingBranch) {
        ubpStore.updateBranch(editingBranch.id, formInput);
      } else {
        ubpStore.addBranch(formInput);
      }
      setIsDialogOpen(false);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(t(err.message) || err.message);
      }
    }
  };

  const handleToggleActive = (id: string) => {
    try {
      ubpStore.toggleBranchActive(id);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAlertNotice(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    setDeleteError(null);
    try {
      const outcome = ubpStore.deleteBranch(deletingBranch.id);
      if (outcome.deactivated) {
        setAlertNotice(outcome.message || 'تم تحويل حذف الفرع إلى تعطيل لوجود حركات وارتباطات قائمة.');
      }
      setDeletingBranch(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(t(err.message) || err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.branches')}
        subtitle="إدارة فروع الشركة وتحديد النطاقات والبحث السريع المفهرس (25 فرعاً لكل صفحة)"
        actions={
          canAdd.allowed && (
            <button
              type="button"
              onClick={openAddDialog}
              className="ubp-primary-btn flex items-center gap-2"
            >
              <AppIcon name="Plus" size={18} />
              <span>{t('common.add')}</span>
            </button>
          )
        }
      />

      {alertNotice && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          <div className="flex items-center gap-2">
            <AppIcon name="AlertTriangle" size={18} className="text-amber-600 shrink-0" />
            <span>{alertNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs"
          >
            {t('common.close') || 'إغلاق'}
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="ubp-toolbar flex-wrap">
        <div className="relative ubp-search">
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-10 py-2.5 text-sm outline-none focus:border-teal-600 shadow-xs"
          />
          <div className="absolute start-3 top-3 text-slate-400">
            <AppIcon name="Search" size={18} />
          </div>
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute end-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <AppIcon name="Close" size={16} />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={handleIncludeInactiveToggle}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
          />
          <span>{t('common.include_inactive')}</span>
        </label>
      </div>

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="text-start">{t('common.code')}</th>
                <th className="text-start">{t('common.name_ar')}</th>
                <th className="text-start">{t('common.phone')}</th>
                <th className="text-center">{t('common.status')}</th>
                <th className="text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedData.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                pagedData.items.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="font-mono font-bold text-slate-800">
                      <span className="ubp-code">{b.code}</span>
                    </td>
                    <td className="font-bold text-slate-900">
                      <div>{b.name_ar}</div>
                      {b.custom_fields && Object.keys(b.custom_fields).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {branchCustomFields.map((cf) => {
                            const v = b.custom_fields?.[cf.field_key];
                            if (v === undefined || v === null || v === '') return null;
                            const label = language === 'en' && cf.label_en ? cf.label_en : cf.label_ar;
                            return (
                              <span
                                key={cf.id}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                              >
                                <span className="text-slate-400">{label}:</span>
                                <span className="font-mono text-slate-800">{String(v)}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="text-slate-600 font-mono text-sm">{b.phone || '—'}</td>
                    <td className="text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {b.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        {canToggle.allowed && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(b.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title={t('action.toggle_active')}
                          >
                            <AppIcon name={b.is_active ? 'Unlock' : 'Lock'} size={16} />
                          </button>
                        )}
                        {canEdit.allowed && (
                          <button
                            type="button"
                            onClick={() => openEditDialog(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                            title={t('action.edit')}
                          >
                            <AppIcon name="Edit" size={16} />
                          </button>
                        )}
                        {canDelete.allowed && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingBranch(b);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50"
                            title={t('action.delete')}
                          >
                            <AppIcon name="Trash" size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 25-Rows Pager Controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200/80 bg-slate-50/60 text-xs">
          <span className="text-slate-500">
            {t('common.pager_info', (pagedData.page - 1) * 25 + 1, Math.min(pagedData.page * 25, pagedData.total), pagedData.total)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagedData.page <= 1}
              onClick={() => reloadData(pagedData.page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              {t('common.previous')}
            </button>
            <span className="px-3 py-1.5 font-bold text-slate-800">
              {pagedData.page} / {pagedData.totalPages}
            </span>
            <button
              type="button"
              disabled={pagedData.page >= pagedData.totalPages}
              onClick={() => reloadData(pagedData.page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBranch ? t('branches.edit_branch') || 'تعديل فرع' : t('branches.add_branch') || 'إضافة فرع'}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            {formError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('common.code')} *</span>
                  <input
                    type="text"
                    value={formInput.code}
                    onChange={(e) => setFormInput({ ...formInput, code: e.target.value })}
                    required
                    maxLength={30}
                    className="w-full uppercase font-mono"
                  />
                </label>

                <label className="ubp-field">
                  <span>{t('common.name_ar')} *</span>
                  <input
                    type="text"
                    value={formInput.name_ar}
                    onChange={(e) => setFormInput({ ...formInput, name_ar: e.target.value })}
                    required
                    maxLength={255}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('common.name_en')}</span>
                  <input
                    type="text"
                    value={formInput.name_en || ''}
                    onChange={(e) => setFormInput({ ...formInput, name_en: e.target.value })}
                    maxLength={255}
                    className="w-full"
                  />
                </label>

                <label className="ubp-field">
                  <span>{t('common.phone')}</span>
                  <input
                    type="text"
                    value={formInput.phone || ''}
                    onChange={(e) => setFormInput({ ...formInput, phone: e.target.value })}
                    maxLength={50}
                    className="w-full font-mono text-sm"
                  />
                </label>
              </div>

              <label className="ubp-field">
                <span>{t('common.address')}</span>
                <input
                  type="text"
                  value={formInput.address || ''}
                  onChange={(e) => setFormInput({ ...formInput, address: e.target.value })}
                  maxLength={500}
                  className="w-full"
                />
              </label>

              {/* Dynamic Custom Fields */}
              {branchCustomFields.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AppIcon name="SlidersHorizontal" size={14} className="text-teal-600" />
                    <span>{t('custom_fields.section_title') || 'الحقول الإضافية (Custom Fields)'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {branchCustomFields.map((cf) => {
                      const val = formInput.custom_fields?.[cf.field_key];
                      const label = language === 'en' && cf.label_en ? cf.label_en : cf.label_ar;

                      if (cf.data_type === 'bool') {
                        return (
                          <label key={cf.id} className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-xs col-span-2 py-1">
                            <input
                              type="checkbox"
                              checked={Boolean(val)}
                              onChange={(e) =>
                                setFormInput({
                                  ...formInput,
                                  custom_fields: {
                                    ...(formInput.custom_fields || {}),
                                    [cf.field_key]: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 rounded text-teal-600 border-slate-300"
                            />
                            <span>{label} {cf.is_required && '*'}</span>
                          </label>
                        );
                      }

                      if (cf.data_type === 'list') {
                        return (
                          <label key={cf.id} className="ubp-field col-span-2">
                            <span>{label} {cf.is_required && '*'}</span>
                            <select
                              value={String(val || '')}
                              onChange={(e) =>
                                setFormInput({
                                  ...formInput,
                                  custom_fields: {
                                    ...(formInput.custom_fields || {}),
                                    [cf.field_key]: e.target.value,
                                  },
                                })
                              }
                              required={cf.is_required}
                              className="w-full text-sm"
                            >
                              <option value="">-- {t('common.select') || 'اختر'} --</option>
                              {cf.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </label>
                        );
                      }

                      return (
                        <label key={cf.id} className="ubp-field col-span-2 sm:col-span-1">
                          <span>{label} {cf.is_required && '*'}</span>
                          <input
                            type={cf.data_type === 'number' ? 'number' : cf.data_type === 'date' ? 'date' : 'text'}
                            value={val !== undefined && val !== null ? String(val) : ''}
                            onChange={(e) =>
                              setFormInput({
                                ...formInput,
                                custom_fields: {
                                  ...(formInput.custom_fields || {}),
                                  [cf.field_key]: cf.data_type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value,
                                },
                              })
                            }
                            required={cf.is_required}
                            className="w-full text-sm"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-2 pt-2 cursor-pointer font-medium text-slate-800 text-sm">
                <input
                  type="checkbox"
                  checked={formInput.is_active}
                  onChange={(e) => setFormInput({ ...formInput, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300"
                />
                <span>{t('common.active')}</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  {t('common.cancel')}
                </button>
                <button type="submit" className="ubp-primary-btn text-sm">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Deactivate Confirmation Dialog */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف الفرع: <strong>{deletingBranch.name_ar}</strong> ({deletingBranch.code})؟
              <br />
              <span className="text-xs text-slate-400 mt-1 block">
                ملاحظة: إذا كان الفرع مرتبطاً بمخازن أو مستخدمين أو حركات سيتحول الحذف تلقائياً إلى تعطيل.
              </span>
            </p>

            {deleteError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingBranch(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
