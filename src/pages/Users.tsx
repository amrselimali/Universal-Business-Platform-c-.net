import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import {
  ScreenCodes,
  ActionCodes,
  UserListItem,
  UserInput,
  AppRegistryScreens,
  PermissionEntry,
} from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const Users: React.FC = () => {
  const { t, language } = useI18n();
  const actor = ubpStore.getActor();

  const canView = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.Delete);
  const canResetPassword = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.ResetPassword);
  const canUnlock = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.Unlock);
  const canManagePerms = ubpStore.checkPermission(ScreenCodes.Users, ActionCodes.ManagePermissions);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagedData, setPagedData] = useState(() => ubpStore.getUsersPaged('', 1, 25, !!actor?.is_super_admin));

  const allBranches = ubpStore.getBranches('', true);
  const allWarehouses = ubpStore.getWarehouses('', true);
  const allRoles = ubpStore.getRoles();

  // Add / Edit User Dialog
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<UserInput>({
    name: '',
    username: '',
    password: '',
    is_active: true,
    language: 'ar',
    is_admin: false,
    is_super_admin: false,
    branch_ids: [],
    default_branch_id: null,
    warehouse_ids: [],
    role_ids: [],
  });
  const [editorError, setEditorError] = useState<string | null>(null);

  // Reset Password Dialog
  const [resettingUser, setResettingUser] = useState<UserListItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  // Manage Permissions Dialog
  const [permUser, setPermUser] = useState<UserListItem | null>(null);
  const [userPermEntries, setUserPermEntries] = useState<PermissionEntry[]>([]);

  // Copy Permissions Dialog
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceUserId, setCopySourceUserId] = useState<string>('');

  // Delete Confirm Dialog
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);
  const [topNotice, setTopNotice] = useState<{ message: string; type?: 'info' | 'error' | 'success' } | null>(null);

  const reloadData = (page = currentPage, query = search) => {
    const res = ubpStore.getUsersPaged(query, page, 25, !!actor?.is_super_admin);
    setPagedData(res);
    setCurrentPage(res.page);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    reloadData(1, val);
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingUserId(null);
    setUserInput({
      name: '',
      username: '',
      password: '',
      is_active: true,
      language: 'ar',
      is_admin: false,
      is_super_admin: false,
      branch_ids: allBranches.length > 0 ? [allBranches[0].id] : [],
      default_branch_id: allBranches[0]?.id || null,
      warehouse_ids: allWarehouses.length > 0 ? [allWarehouses[0].id] : [],
      role_ids: [],
    });
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const openEditDialog = (u: UserListItem) => {
    const full = ubpStore.getUser(u.id);
    if (!full) return;

    setEditingUserId(u.id);
    setUserInput({
      name: full.name || '',
      username: full.username,
      password: '',
      is_active: full.is_active,
      language: full.language,
      is_admin: full.is_admin,
      is_super_admin: full.is_super_admin,
      branch_ids: [...full.branch_ids],
      default_branch_id: full.default_branch_id,
      warehouse_ids: [...full.warehouse_ids],
      role_ids: [...full.role_ids],
    });
    setEditorError(null);
    setIsEditorOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setEditorError(null);

    try {
      if (editingUserId) {
        ubpStore.updateUser(editingUserId, {
          name: userInput.name,
          username: userInput.username,
          language: userInput.language,
          is_active: userInput.is_active,
          is_admin: userInput.is_admin,
          is_super_admin: userInput.is_super_admin,
          branch_ids: userInput.branch_ids,
          default_branch_id: userInput.default_branch_id,
          warehouse_ids: userInput.warehouse_ids,
          role_ids: userInput.role_ids,
        });
      } else {
        ubpStore.addUser(userInput);
      }
      setIsEditorOpen(false);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditorError(t(err.message) || err.message);
      }
    }
  };

  const handleUnlock = (id: string) => {
    try {
      ubpStore.unlockUser(id);
      setTopNotice({ message: 'تم فك حظر حساب المستخدم بنجاح.', type: 'success' });
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTopNotice({ message: t(err.message) || err.message, type: 'error' });
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setResetError(null);

    try {
      ubpStore.resetUserPassword(resettingUser.id, newPassword);
      setResettingUser(null);
      setNewPassword('');
      setTopNotice({ message: 'تم تعيين كلمة المرور الجديدة بنجاح.', type: 'success' });
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResetError(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    setDeleteNotice(null);
    try {
      const outcome = ubpStore.deleteUser(deletingUser.id);
      if (outcome.deactivated) {
        setTopNotice({
          message: outcome.message || 'تم تحويل الحذف إلى تعطيل لوجود حركات وسجلات مرتبطة بالمستخدم.',
          type: 'info',
        });
      } else {
        setTopNotice({ message: 'تم حذف المستخدم بنجاح.', type: 'success' });
      }
      setDeletingUser(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteNotice(t(err.message) || err.message);
      }
    }
  };

  const openPermsDialog = (u: UserListItem) => {
    const full = ubpStore.getUser(u.id);
    if (!full) return;
    setPermUser(u);
    setUserPermEntries(full.permissions ? JSON.parse(JSON.stringify(full.permissions)) : []);
  };

  const handleSavePerms = () => {
    if (!permUser) return;
    ubpStore.setUserPermissions(permUser.id, userPermEntries);
    setPermUser(null);
    reloadData();
  };

  const handleSelectAllForScreen = (screenCode: string) => {
    const screen = AppRegistryScreens.find((s) => s.code === screenCode);
    if (!screen) return;
    const existing = userPermEntries.filter((p) => p.screen_code !== screenCode);
    const newEntries: PermissionEntry[] = screen.actions.map((act) => ({
      screen_code: screenCode,
      action_code: act.code,
      is_allowed: true,
      scope: 1,
    }));
    setUserPermEntries([...existing, ...newEntries]);
  };

  const handleClearAllForScreen = (screenCode: string) => {
    setUserPermEntries(userPermEntries.filter((p) => p.screen_code !== screenCode));
  };

  const handleCopyPermissions = () => {
    if (!permUser || !copySourceUserId) return;
    try {
      ubpStore.copyUserPermissions(copySourceUserId, permUser.id);
      const updated = ubpStore.getUser(permUser.id);
      setUserPermEntries(updated?.permissions ? JSON.parse(JSON.stringify(updated.permissions)) : []);
      setIsCopyModalOpen(false);
      setTopNotice({ message: 'تم نسخ الصلاحيات بنجاح!', type: 'success' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTopNotice({ message: t(err.message) || err.message, type: 'error' });
      }
    }
  };

  const otherUsers = ubpStore.getUsers('', !!actor?.is_super_admin).filter((u) => u.id !== permUser?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.users')}
        subtitle={t('users.list_hint') || 'إدارة المستخدمين وحسابات الدخول وتعيين الفروع والصلاحيات مع حد 25 تسجيلاً للصفحة'}
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

      {topNotice && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm ${
            topNotice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : topNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <AppIcon
              name={topNotice.type === 'error' ? 'AlertTriangle' : 'CheckCircle'}
              size={18}
              className={topNotice.type === 'error' ? 'text-red-600' : 'text-emerald-600'}
            />
            <span>{topNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setTopNotice(null)}
            className="text-slate-600 hover:text-slate-900 font-bold text-xs"
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

        <span className="text-xs font-bold text-slate-500">
          إجمالي المستخدمين: {pagedData.total} • الصفحة {pagedData.page} من {pagedData.totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="text-start">{t('auth.username')}</th>
                <th className="text-start">{t('users.name')}</th>
                <th className="text-center">{t('users.branches')}</th>
                <th className="text-center">{t('users.warehouses')}</th>
                <th className="text-center">{t('common.status')}</th>
                <th className="text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                pagedData.items.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td>
                      <div className="ubp-user-cell flex items-center gap-2.5">
                        <span className="ubp-user-avatar">
                          {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <div className="ubp-code">{u.username}</div>
                          {u.is_super_admin && (
                            <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-200 inline-block mt-0.5">
                              {t('role.super_admin')}
                            </span>
                          )}
                          {u.is_admin && !u.is_super_admin && (
                            <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200 inline-block mt-0.5">
                              {t('role.admin')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="font-bold text-slate-800">{u.name || '—'}</td>
                    <td className="text-center font-mono font-bold text-teal-700">{u.branch_count}</td>
                    <td className="text-center font-mono font-bold text-teal-700">{u.warehouse_count}</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {u.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                        {u.is_locked && (
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            مقفل
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        {u.is_locked && canUnlock.allowed && (
                          <button
                            type="button"
                            onClick={() => handleUnlock(u.id)}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                            title={t('action.unlock')}
                          >
                            <AppIcon name="Unlock" size={16} />
                          </button>
                        )}
                        {canResetPassword.allowed && (
                          <button
                            type="button"
                            onClick={() => {
                              setResettingUser(u);
                              setNewPassword('');
                              setResetError(null);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                            title={t('action.reset_password')}
                          >
                            <AppIcon name="Key" size={16} />
                          </button>
                        )}
                        {canManagePerms.allowed && (
                          <button
                            type="button"
                            onClick={() => openPermsDialog(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                            title={t('action.manage_permissions')}
                          >
                            <AppIcon name="ShieldCheck" size={16} />
                          </button>
                        )}
                        {canEdit.allowed && (
                          <button
                            type="button"
                            onClick={() => openEditDialog(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                            title={t('action.edit')}
                          >
                            <AppIcon name="Edit" size={16} />
                          </button>
                        )}
                        {canDelete.allowed && u.id !== actor?.user_id && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteNotice(null);
                              setDeletingUser(u);
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

      {/* User Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUserId ? t('users.edit') || 'تعديل مستخدم' : t('users.add') || 'إضافة مستخدم جديد'}
              </h2>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            {editorError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{editorError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('auth.username')} *</span>
                  <input
                    type="text"
                    value={userInput.username}
                    onChange={(e) => setUserInput({ ...userInput, username: e.target.value })}
                    required
                    disabled={!!editingUserId}
                    className="w-full font-mono text-sm"
                  />
                </label>

                <label className="ubp-field">
                  <span>{t('common.name_ar')}</span>
                  <input
                    type="text"
                    value={userInput.name || ''}
                    onChange={(e) => setUserInput({ ...userInput, name: e.target.value })}
                    className="w-full"
                  />
                </label>
              </div>

              {!editingUserId && (
                <label className="ubp-field">
                  <span>{t('auth.password')} *</span>
                  <input
                    type="password"
                    value={userInput.password || ''}
                    onChange={(e) => setUserInput({ ...userInput, password: e.target.value })}
                    required
                    className="w-full"
                  />
                </label>
              )}

              {/* Roles */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">{t('screen.roles')}:</span>
                <div className="grid grid-cols-3 gap-2 p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                  {allRoles.map((r) => {
                    const checked = userInput.role_ids.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserInput({ ...userInput, role_ids: [...userInput.role_ids, r.id] });
                            } else {
                              setUserInput({
                                ...userInput,
                                role_ids: userInput.role_ids.filter((id) => id !== r.id),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded text-teal-600 border-slate-300"
                        />
                        <span>{language === 'en' && r.name_en ? r.name_en : r.name_ar}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Branches with Default Branch selector */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">الفروع والفرع الافتراضي (is_default):</span>
                <div className="grid grid-cols-2 gap-2 p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                  {allBranches.map((b) => {
                    const checked = userInput.branch_ids.includes(b.id);
                    const isDefault = userInput.default_branch_id === b.id;

                    return (
                      <div key={b.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setUserInput({
                                  ...userInput,
                                  branch_ids: [...userInput.branch_ids, b.id],
                                  default_branch_id: userInput.default_branch_id || b.id,
                                });
                              } else {
                                const newBranchIds = userInput.branch_ids.filter((id) => id !== b.id);
                                setUserInput({
                                  ...userInput,
                                  branch_ids: newBranchIds,
                                  default_branch_id: userInput.default_branch_id === b.id ? (newBranchIds[0] || null) : userInput.default_branch_id,
                                });
                              }
                            }}
                            className="w-4 h-4 rounded text-teal-600 border-slate-300"
                          />
                          <span>{language === 'en' && b.name_en ? b.name_en : b.name_ar}</span>
                        </label>

                        {checked && (
                          <button
                            type="button"
                            onClick={() => setUserInput({ ...userInput, default_branch_id: b.id })}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              isDefault
                                ? 'bg-teal-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isDefault ? 'افتراضي ★' : 'تعيين كافتراضي'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flags: is_admin, is_super_admin, is_active */}
              {actor?.is_super_admin && (
                <div className="flex gap-6 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
                    <input
                      type="checkbox"
                      checked={userInput.is_admin}
                      onChange={(e) => setUserInput({ ...userInput, is_admin: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300"
                    />
                    <span>{t('role.admin')}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-800 text-sm">
                    <input
                      type="checkbox"
                      checked={userInput.is_super_admin}
                      onChange={(e) => setUserInput({ ...userInput, is_super_admin: e.target.checked, is_admin: true })}
                      className="w-4 h-4 rounded text-purple-600 border-slate-300"
                    />
                    <span>{t('role.super_admin')}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-sm">
                    <input
                      type="checkbox"
                      checked={userInput.is_active}
                      onChange={(e) => setUserInput({ ...userInput, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 border-slate-300"
                    />
                    <span>{t('common.active')}</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
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

      {/* Permissions Dialog with "Copy from another user" + Screen-level Select/Clear all */}
      {permUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('action.manage_permissions')} — {permUser.name || permUser.username}
                </h2>
                <p className="text-xs text-slate-500">
                  استثناءات المستخدم الفردية تتغلب على صلاحيات الأدوار الموروثة
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(true)}
                  className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-100 flex items-center gap-1.5"
                >
                  <AppIcon name="ShieldCheck" size={14} />
                  <span>نسخ الصلاحيات من مستخدم آخر</span>
                </button>
                <button onClick={() => setPermUser(null)} className="text-slate-400 hover:text-slate-600">
                  <AppIcon name="Close" size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {AppRegistryScreens.map((screen) => {
                return (
                  <div key={screen.code} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                        <AppIcon name={screen.icon} size={16} className="text-teal-600" />
                        <span>{t(screen.title_key)}</span>
                        <span className="text-[10px] font-mono text-slate-400">({screen.code})</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectAllForScreen(screen.code)}
                          className="text-[11px] font-bold text-teal-700 hover:underline"
                        >
                          {t('common.select_all')}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleClearAllForScreen(screen.code)}
                          className="text-[11px] font-bold text-slate-500 hover:underline"
                        >
                          {t('common.clear_all')}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {screen.actions.map((act) => {
                        const entry = userPermEntries.find(
                          (p) => p.screen_code === screen.code && p.action_code === act.code
                        );
                        const isGranted = entry?.is_allowed ?? false;
                        const scope = entry?.scope ?? 1;

                        return (
                          <div
                            key={act.code}
                            className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200"
                          >
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={isGranted}
                                onChange={(e) => {
                                  const allowed = e.target.checked;
                                  const filtered = userPermEntries.filter(
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
                                  setUserPermEntries(filtered);
                                }}
                                className="w-4 h-4 rounded text-teal-600 border-slate-300"
                              />
                              <span>{t(act.title_key)}</span>
                            </label>

                            {isGranted && (
                              <select
                                value={scope}
                                onChange={(e) => {
                                  const newScope = parseInt(e.target.value, 10);
                                  setUserPermEntries((prev) =>
                                    prev.map((p) =>
                                      p.screen_code === screen.code && p.action_code === act.code
                                        ? { ...p, scope: newScope }
                                        : p
                                    )
                                  );
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
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setPermUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSavePerms}
                className="ubp-primary-btn text-sm"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Permissions Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 mb-2">نسخ الصلاحيات</h2>
            <p className="text-xs text-slate-500 mb-4">
              اختر المستخدم المراد استنساخ صلاحياته وتطبيقها على <strong>{permUser?.name || permUser?.username}</strong>:
            </p>

            <select
              value={copySourceUserId}
              onChange={(e) => setCopySourceUserId(e.target.value)}
              className="ubp-select w-full mb-4 text-sm font-semibold"
            >
              <option value="">-- اختر مستخدم المصدر --</option>
              {otherUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.name || 'بدون اسم'})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={!copySourceUserId}
                onClick={handleCopyPermissions}
                className="ubp-primary-btn text-sm disabled:opacity-40"
              >
                تطبيق النسخ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              {t('action.reset_password')} — {resettingUser.username}
            </h2>

            {resetError && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <label className="ubp-field">
                <span>{t('auth.new_password')} *</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full"
                />
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
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

      {/* Delete / Deactivate Confirm */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف المستخدم: <strong>{deletingUser.username}</strong>؟
              <br />
              <span className="text-xs text-slate-400 mt-1 block">
                ملاحظة: إذا كان المستخدم يمتلك سجلات أو حركات مرتبطة سيتحول الحذف تلقائياً إلى تعطيل للحفاظ على سلامة البيانات.
              </span>
            </p>
            {deleteNotice && (
              <div className="ubp-alert error mb-4 flex items-center gap-2">
                <AppIcon name="AlertTriangle" size={18} className="text-red-600" />
                <span>{deleteNotice}</span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
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
