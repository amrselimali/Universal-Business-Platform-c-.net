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
  const [branches, setBranches] = useState<Branch[]>(() => ubpStore.getBranches('', false));

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
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirm Dialog
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reloadData = () => {
    setBranches(ubpStore.getBranches(search, includeInactive));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setBranches(ubpStore.getBranches(val, includeInactive));
  };

  const handleIncludeInactiveToggle = () => {
    const nextVal = !includeInactive;
    setIncludeInactive(nextVal);
    setBranches(ubpStore.getBranches(search, nextVal));
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingBranch(null);
    setFormInput({
      code: '',
      name_ar: '',
      name_en: '',
      address: '',
      phone: '',
      is_active: true,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (b: Branch) => {
    setEditingBranch(b);
    setFormInput({
      code: b.code,
      name_ar: b.name_ar,
      name_en: b.name_en || '',
      address: b.address || '',
      phone: b.phone || '',
      is_active: b.is_active,
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
        alert(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingBranch) return;
    setDeleteError(null);
    try {
      ubpStore.deleteBranch(deletingBranch.id);
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
        subtitle={t('branches.list_hint') || 'إدارة فروع الشركة وربطها بالمخازن والصلاحيات'}
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
                <th className="p-4 text-start">{t('common.code')}</th>
                <th className="p-4 text-start">{t('common.name_ar')}</th>
                <th className="p-4 text-start">{t('common.name_en')}</th>
                <th className="p-4 text-start">{t('common.phone')}</th>
                <th className="p-4 text-start">{t('common.address')}</th>
                <th className="p-4 text-center">{t('common.status')}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-800">
                      <span className="ubp-code">{b.code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{b.name_ar}</td>
                    <td className="p-4 text-slate-600">{b.name_en || '—'}</td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{b.phone || '—'}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{b.address || '—'}</td>
                    <td className="p-4 text-center">
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
                    <td className="p-4 text-end">
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
                    maxLength={50}
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
                    maxLength={150}
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
                    maxLength={150}
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
                  className="w-full"
                />
              </label>

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

      {/* Delete Confirmation Dialog */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف الفرع: <strong>{deletingBranch.name_ar}</strong> ({deletingBranch.code})؟
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
