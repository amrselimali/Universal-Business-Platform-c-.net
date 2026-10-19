import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, Warehouse, WarehouseInput, Branch } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const Warehouses: React.FC = () => {
  const { t, language } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.Delete);
  const canToggle = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.ToggleActive);
  const canLink = ubpStore.checkPermission(ScreenCodes.Warehouses, ActionCodes.LinkBranches);

  const [search, setSearch] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => ubpStore.getWarehouses('', false));
  const allBranches = ubpStore.getBranches('', true);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formInput, setFormInput] = useState<WarehouseInput>({
    code: '',
    name_ar: '',
    name_en: '',
    is_active: true,
    branch_ids: [],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Link Branches Dialog
  const [linkingWarehouse, setLinkingWarehouse] = useState<Warehouse | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  // Delete Confirm
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  const reloadData = () => {
    setWarehouses(ubpStore.getWarehouses(search, includeInactive));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setWarehouses(ubpStore.getWarehouses(val, includeInactive));
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingWarehouse(null);
    setFormInput({
      code: '',
      name_ar: '',
      name_en: '',
      is_active: true,
      branch_ids: allBranches.length > 0 ? [allBranches[0].id] : [],
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormInput({
      code: w.code,
      name_ar: w.name_ar,
      name_en: w.name_en || '',
      is_active: w.is_active,
      branch_ids: [...w.branch_ids],
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (editingWarehouse) {
        ubpStore.updateWarehouse(editingWarehouse.id, formInput);
      } else {
        ubpStore.addWarehouse(formInput);
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
      ubpStore.toggleWarehouseActive(id);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingWarehouse) return;
    try {
      ubpStore.deleteWarehouse(deletingWarehouse.id);
      setDeletingWarehouse(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(t(err.message) || err.message);
      }
    }
  };

  const openLinkDialog = (w: Warehouse) => {
    setLinkingWarehouse(w);
    setSelectedBranchIds([...w.branch_ids]);
  };

  const handleSaveLink = () => {
    if (!linkingWarehouse) return;
    try {
      ubpStore.linkWarehouseBranches(linkingWarehouse.id, selectedBranchIds);
      setLinkingWarehouse(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(t(err.message) || err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.warehouses')}
        subtitle={t('warehouses.list_hint') || 'إدارة المخازن وربطها بالفروع وتحديد النطاقات'}
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
            onChange={() => {
              const nextVal = !includeInactive;
              setIncludeInactive(nextVal);
              setWarehouses(ubpStore.getWarehouses(search, nextVal));
            }}
            className="w-4 h-4 rounded text-teal-600 border-slate-300"
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
                <th className="p-4 text-start">{t('warehouses.linked_branches') || 'الفروع المرتبطة'}</th>
                <th className="p-4 text-center">{t('common.status')}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warehouses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                warehouses.map((w) => {
                  const linkedBranches = allBranches.filter((b) => w.branch_ids.includes(b.id));

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">
                        <span className="ubp-code">{w.code}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{w.name_ar}</td>
                      <td className="p-4 text-slate-600">{w.name_en || '—'}</td>
                      <td className="p-4">
                        <div className="ubp-chip-list">
                          {linkedBranches.length === 0 ? (
                            <span className="text-xs text-amber-600 italic">
                              {t('warehouse.unlinked') || 'غير مرتبط بفرع'}
                            </span>
                          ) : (
                            linkedBranches.map((b) => (
                              <span
                                key={b.id}
                                className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {language === 'en' && b.name_en ? b.name_en : b.name_ar}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            w.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {w.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="p-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {canLink.allowed && (
                            <button
                              type="button"
                              onClick={() => openLinkDialog(w)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                              title={t('action.link_branches')}
                            >
                              <AppIcon name="GitFork" size={16} />
                            </button>
                          )}
                          {canToggle.allowed && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(w.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              title={t('action.toggle_active')}
                            >
                              <AppIcon name={w.is_active ? 'Unlock' : 'Lock'} size={16} />
                            </button>
                          )}
                          {canEdit.allowed && (
                            <button
                              type="button"
                              onClick={() => openEditDialog(w)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                              title={t('action.edit')}
                            >
                              <AppIcon name="Edit" size={16} />
                            </button>
                          )}
                          {canDelete.allowed && (
                            <button
                              type="button"
                              onClick={() => setDeletingWarehouse(w)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50"
                              title={t('action.delete')}
                            >
                              <AppIcon name="Trash" size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                {editingWarehouse ? t('warehouses.edit_warehouse') || 'تعديل مخزن' : t('warehouses.add_warehouse') || 'إضافة مخزن'}
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

              {/* Branch Link Selection */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {t('warehouses.link_to_branches') || 'ربط بالفروع'}:
                </span>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {allBranches.map((b) => {
                    const isChecked = formInput.branch_ids.includes(b.id);
                    return (
                      <label key={b.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormInput({ ...formInput, branch_ids: [...formInput.branch_ids, b.id] });
                            } else {
                              setFormInput({
                                ...formInput,
                                branch_ids: formInput.branch_ids.filter((id) => id !== b.id),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded text-teal-600 border-slate-300"
                        />
                        <span>{language === 'en' && b.name_en ? b.name_en : b.name_ar}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

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

      {/* Link Branches Dialog */}
      {linkingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {t('action.link_branches')} — {linkingWarehouse.name_ar}
              </h2>
              <button
                onClick={() => setLinkingWarehouse(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              حدد الفروع المصرح لها الوصول وتبادل البضائع مع هذا المخزن:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50 mb-4">
              {allBranches.map((b) => {
                const isSelected = selectedBranchIds.includes(b.id);
                return (
                  <label key={b.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-teal-500">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranchIds([...selectedBranchIds, b.id]);
                        } else {
                          setSelectedBranchIds(selectedBranchIds.filter((id) => id !== b.id));
                        }
                      }}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {language === 'en' && b.name_en ? b.name_en : b.name_ar}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{b.code}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLinkingWarehouse(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="ubp-primary-btn text-sm"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف المخزن: <strong>{deletingWarehouse.name_ar}</strong> ({deletingWarehouse.code})؟
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingWarehouse(null)}
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
