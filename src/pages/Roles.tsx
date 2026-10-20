import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import {
  ScreenCodes,
  ActionCodes,
  Role,
  RoleInput,
  AppRegistryScreens,
  PermissionEntry,
} from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const Roles: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.Roles, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.Roles, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.Roles, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.Roles, ActionCodes.Delete);
  const canManagePerms = ubpStore.checkPermission(ScreenCodes.Roles, ActionCodes.ManagePermissions);

  const [roles, setRoles] = useState<Role[]>(() => ubpStore.getRoles());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formInput, setFormInput] = useState<RoleInput>({
    code: '',
    name_ar: '',
    name_en: '',
    is_active: true,
    permissions: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reloadData = () => {
    setRoles(ubpStore.getRoles());
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingRole(null);
    setFormInput({
      code: '',
      name_ar: '',
      name_en: '',
      is_active: true,
      permissions: [
        { screen_code: ScreenCodes.Dashboard, action_code: ActionCodes.View, is_allowed: true, scope: 1 },
      ],
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (r: Role) => {
    setEditingRole(r);
    setFormInput({
      code: r.code,
      name_ar: r.name_ar,
      name_en: r.name_en || '',
      is_active: r.is_active,
      permissions: r.permissions ? JSON.parse(JSON.stringify(r.permissions)) : [],
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingRole) {
        ubpStore.updateRole(editingRole.id, formInput);
      } else {
        ubpStore.addRole(formInput);
      }
      setIsDialogOpen(false);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingRole) return;
    setDeleteError(null);
    try {
      ubpStore.deleteRole(deletingRole.id);
      setDeletingRole(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(t(err.message) || err.message);
      }
    }
  };

  const handleSelectAll = () => {
    const allPerms: PermissionEntry[] = [];
    AppRegistryScreens.forEach((screen) => {
      screen.actions.forEach((act) => {
        allPerms.push({
          screen_code: screen.code,
          action_code: act.code,
          is_allowed: true,
          scope: 2, // All
        });
      });
    });
    setFormInput({ ...formInput, permissions: allPerms });
  };

  const handleClearAll = () => {
    setFormInput({ ...formInput, permissions: [] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.roles')}
        subtitle={t('roles.list_hint') || 'إدارة أدوار المستخدمين ومصفوفة الصلاحيات الموروثة'}
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

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 text-start">{t('common.code')}</th>
                <th className="p-4 text-start">{t('common.name_ar')}</th>
                <th className="p-4 text-center">{t('common.status')}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-800">
                    <span className="ubp-code">{r.code}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{r.name_ar}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-300'
                      }`}
                    >
                      {r.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-1">
                      {canManagePerms.allowed && canEdit.allowed && (
                        <button
                          type="button"
                          onClick={() => openEditDialog(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                          title={t('action.manage_permissions')}
                        >
                          <AppIcon name="ShieldCheck" size={16} />
                        </button>
                      )}
                      {canDelete.allowed && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingRole(r);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Dialog with Permissions Matrix */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingRole ? t('roles.edit') || 'تعديل الدور والصلاحيات' : t('roles.add') || 'إضافة دور جديد'}
              </h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            {formError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('common.code')} *</span>
                  <input
                    type="text"
                    value={formInput.code}
                    onChange={(e) => setFormInput({ ...formInput, code: e.target.value })}
                    required
                    maxLength={50}
                    placeholder="MANAGER"
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
                    maxLength={100}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="ubp-field">
                  <span>{t('common.name_en')}</span>
                  <input
                    type="text"
                    value={formInput.name_en || ''}
                    onChange={(e) => setFormInput({ ...formInput, name_en: e.target.value })}
                    maxLength={100}
                    className="w-full"
                  />
                </label>

                <label className="flex items-center gap-2 pt-4 cursor-pointer font-bold text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={formInput.is_active}
                    onChange={(e) => setFormInput({ ...formInput, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300"
                  />
                  <span>{t('common.active')}</span>
                </label>
              </div>

              {/* Permissions Matrix Header */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {t('roles.permissions_matrix') || 'مصفوفة الصلاحيات (Screen Permissions)'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
                  >
                    {t('common.select_all')}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    {t('common.clear_all')}
                  </button>
                </div>
              </div>

              {/* Screens Matrix List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {AppRegistryScreens.map((screen) => (
                  <div key={screen.code} className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
                    <div className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <AppIcon name={screen.icon} size={16} className="text-teal-600" />
                      <span>{t(screen.title_key)}</span>
                      <span className="text-[10px] font-mono text-slate-400">({screen.code})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {screen.actions.map((act) => {
                        const entry = formInput.permissions.find(
                          (p) => p.screen_code === screen.code && p.action_code === act.code
                        );
                        const isChecked = entry?.is_allowed ?? false;
                        const scope = entry?.scope ?? 1;

                        return (
                          <div
                            key={act.code}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
                          >
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const allowed = e.target.checked;
                                  const filtered = formInput.permissions.filter(
                                    (p) => !(p.screen_code === screen.code && p.action_code === act.code)
                                  );
                                  if (allowed) {
                                    filtered.push({
                                      screen_code: screen.code,
                                      action_code: act.code,
                                      is_allowed: true,
                                      scope: 1,
                                    });
                                  }
                                  setFormInput({ ...formInput, permissions: filtered });
                                }}
                                className="w-4 h-4 rounded text-teal-600 border-slate-300"
                              />
                              <span>{t(act.title_key)}</span>
                            </label>

                            {isChecked && (
                              <select
                                value={scope}
                                onChange={(e) => {
                                  const newScope = parseInt(e.target.value, 10);
                                  setFormInput({
                                    ...formInput,
                                    permissions: formInput.permissions.map((p) =>
                                      p.screen_code === screen.code && p.action_code === act.code
                                        ? { ...p, scope: newScope }
                                        : p
                                    ),
                                  });
                                }}
                                className="text-[11px] p-1 border border-slate-300 rounded font-medium"
                              >
                                <option value={0}>سجلاتي (Own)</option>
                                <option value={1}>فروعي (Branches)</option>
                                <option value={2}>الكل (All)</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
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

      {/* Delete Confirm */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف الدور: <strong>{deletingRole.name_ar}</strong> ({deletingRole.code})؟
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
                onClick={() => setDeletingRole(null)}
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
