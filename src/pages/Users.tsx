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
  PermissionScope,
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
  const [users, setUsers] = useState<UserListItem[]>(() => ubpStore.getUsers());

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

  // Delete Confirm Dialog
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reloadData = () => {
    setUsers(ubpStore.getUsers(search));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setUsers(ubpStore.getUsers(val));
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
      password: '', // Leave blank unless changing
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
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(t(err.message) || err.message);
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
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResetError(t(err.message) || err.message);
      }
    }
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    setDeleteError(null);
    try {
      ubpStore.deleteUser(deletingUser.id);
      setDeletingUser(null);
      reloadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(t(err.message) || err.message);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.users')}
        subtitle={t('users.list_hint') || 'إدارة المستخدمين وحسابات الدخول وتعيين الفروع والصلاحيات'}
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
      </div>

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 text-start">{t('auth.username')}</th>
                <th className="p-4 text-start">{t('common.name_ar')}</th>
                <th className="p-4 text-start">{t('screen.roles')}</th>
                <th className="p-4 text-center">{t('screen.branches')}</th>
                <th className="p-4 text-center">{t('screen.warehouses')}</th>
                <th className="p-4 text-center">{t('common.status')}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{u.username}</span>
                      {u.is_super_admin && (
                        <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-md bg-purple-100 text-purple-800">
                          Super Admin
                        </span>
                      )}
                      {u.is_admin && !u.is_super_admin && (
                        <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-md bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{u.name || '—'}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.role_names.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">بدون دور</span>
                      ) : (
                        u.role_names.map((rn, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700"
                          >
                            {rn}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-teal-700">{u.branch_count}</td>
                  <td className="p-4 text-center font-mono font-bold text-teal-700">{u.warehouse_count}</td>
                  <td className="p-4 text-center">
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
                  <td className="p-4 text-end">
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
                            setDeleteError(null);
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
              ))}
            </tbody>
          </table>
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
                <div className="grid grid-cols-3 gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50">
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

              {/* Branches */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">{t('screen.branches')}:</span>
                <div className="grid grid-cols-2 gap-2 p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {allBranches.map((b) => {
                    const checked = userInput.branch_ids.includes(b.id);
                    return (
                      <label key={b.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserInput({ ...userInput, branch_ids: [...userInput.branch_ids, b.id] });
                            } else {
                              setUserInput({
                                ...userInput,
                                branch_ids: userInput.branch_ids.filter((id) => id !== b.id),
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
                      onChange={(e) => setUserInput({ ...userInput, is_super_admin: e.target.checked })}
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

      {/* User Granular Permissions Dialog */}
      {permUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t('action.manage_permissions')} — {permUser.name || permUser.username}
                </h2>
                <p className="text-xs text-slate-500">
                  تعديل الصلاحيات الفردية (تتغلب استثناءات المستخدم على صلاحيات الأدوار)
                </p>
              </div>
              <button onClick={() => setPermUser(null)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {AppRegistryScreens.map((screen) => {
                return (
                  <div key={screen.code} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <div className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2">
                      <AppIcon name={screen.icon} size={16} className="text-teal-600" />
                      <span>{t(screen.title_key)}</span>
                      <span className="text-[10px] font-mono text-slate-400">({screen.code})</span>
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
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200"
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

      {/* Delete Confirm */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف المستخدم: <strong>{deletingUser.username}</strong>؟
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
