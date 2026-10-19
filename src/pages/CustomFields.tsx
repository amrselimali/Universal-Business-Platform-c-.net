import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, CustomFieldDefinition, CustomFieldInput } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const CustomFields: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.CustomFields, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.CustomFields, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.CustomFields, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.CustomFields, ActionCodes.Delete);

  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [fields, setFields] = useState<CustomFieldDefinition[]>(() => ubpStore.getCustomFields());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [formInput, setFormInput] = useState<CustomFieldInput>({
    entity_name: 'branches',
    field_key: '',
    label_ar: '',
    label_en: '',
    data_type: 'text',
    options: [],
    is_required: false,
    is_active: true,
    sort_order: 1,
  });
  const [rawOptions, setRawOptions] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingField, setDeletingField] = useState<CustomFieldDefinition | null>(null);

  const reloadData = () => {
    setFields(ubpStore.getCustomFields(entityFilter === 'all' ? undefined : entityFilter));
  };

  const handleEntityFilterChange = (entity: string) => {
    setEntityFilter(entity);
    setFields(ubpStore.getCustomFields(entity === 'all' ? undefined : entity));
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingField(null);
    setFormInput({
      entity_name: entityFilter === 'all' ? 'branches' : entityFilter,
      field_key: '',
      label_ar: '',
      label_en: '',
      data_type: 'text',
      options: [],
      is_required: false,
      is_active: true,
      sort_order: fields.length + 1,
    });
    setRawOptions('');
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (f: CustomFieldDefinition) => {
    setEditingField(f);
    setFormInput({
      entity_name: f.entity_name,
      field_key: f.field_key,
      label_ar: f.label_ar,
      label_en: f.label_en || '',
      data_type: f.data_type,
      options: f.options,
      is_required: f.is_required,
      is_active: f.is_active,
      sort_order: f.sort_order,
    });
    setRawOptions(f.options.join('\n'));
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const opts = formInput.data_type === 'select'
      ? rawOptions.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload: CustomFieldInput = {
      ...formInput,
      options: opts,
    };

    try {
      if (editingField) {
        ubpStore.updateCustomField(editingField.id, payload);
      } else {
        ubpStore.addCustomField(payload);
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
    if (!deletingField) return;
    try {
      ubpStore.deleteCustomField(deletingField.id);
      setDeletingField(null);
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
        title={t('screen.custom_fields')}
        subtitle={t('custom_fields.list_hint') || 'تعريف حقول إضافية مخصصة للكيانات المختلفة في النظام'}
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

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => handleEntityFilterChange('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            entityFilter === 'all'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('common.all') || 'الكل'}
        </button>
        <button
          type="button"
          onClick={() => handleEntityFilterChange('branches')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            entityFilter === 'branches'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('screen.branches')}
        </button>
        <button
          type="button"
          onClick={() => handleEntityFilterChange('warehouses')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            entityFilter === 'warehouses'
              ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {t('screen.warehouses')}
        </button>
      </div>

      {/* Table */}
      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 text-start">{t('custom_fields.entity') || 'الكيان'}</th>
                <th className="p-4 text-start">{t('custom_fields.field_key') || 'مفتاح الحقل'}</th>
                <th className="p-4 text-start">{t('common.name_ar')}</th>
                <th className="p-4 text-start">{t('custom_fields.data_type') || 'النوع'}</th>
                <th className="p-4 text-center">{t('custom_fields.required') || 'إلزامي'}</th>
                <th className="p-4 text-center">{t('common.status')}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    {t('common.no_data')}
                  </td>
                </tr>
              ) : (
                fields.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-700 capitalize">
                      {f.entity_name === 'branches' ? t('screen.branches') : t('screen.warehouses')}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">
                      <span className="ubp-code">{f.field_key}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{f.label_ar}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {f.data_type}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {f.is_required ? (
                        <span className="text-red-600 font-bold text-xs">{t('common.yes')}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">{t('common.no')}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          f.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {f.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="p-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit.allowed && (
                          <button
                            type="button"
                            onClick={() => openEditDialog(f)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                            title={t('action.edit')}
                          >
                            <AppIcon name="Edit" size={16} />
                          </button>
                        )}
                        {canDelete.allowed && (
                          <button
                            type="button"
                            onClick={() => setDeletingField(f)}
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
                {editingField ? t('custom_fields.edit') || 'تعديل حقل مخصص' : t('custom_fields.add') || 'إضافة حقل مخصص'}
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

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('custom_fields.entity') || 'الكيان'} *</span>
                  <select
                    value={formInput.entity_name}
                    onChange={(e) => setFormInput({ ...formInput, entity_name: e.target.value })}
                    className="ubp-select w-full"
                  >
                    <option value="branches">{t('screen.branches')}</option>
                    <option value="warehouses">{t('screen.warehouses')}</option>
                  </select>
                </label>

                <label className="ubp-field">
                  <span>{t('custom_fields.field_key') || 'مفتاح الحقل (code)'} *</span>
                  <input
                    type="text"
                    value={formInput.field_key}
                    onChange={(e) => setFormInput({ ...formInput, field_key: e.target.value })}
                    required
                    placeholder="tax_no"
                    className="w-full font-mono text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('common.name_ar')} *</span>
                  <input
                    type="text"
                    value={formInput.label_ar}
                    onChange={(e) => setFormInput({ ...formInput, label_ar: e.target.value })}
                    required
                    className="w-full"
                  />
                </label>

                <label className="ubp-field">
                  <span>{t('common.name_en')}</span>
                  <input
                    type="text"
                    value={formInput.label_en || ''}
                    onChange={(e) => setFormInput({ ...formInput, label_en: e.target.value })}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="ubp-field">
                  <span>{t('custom_fields.data_type') || 'نوع البيانات'} *</span>
                  <select
                    value={formInput.data_type}
                    onChange={(e) => setFormInput({ ...formInput, data_type: e.target.value as any })}
                    className="ubp-select w-full"
                  >
                    <option value="text">نص (Text)</option>
                    <option value="number">رقم (Number)</option>
                    <option value="boolean">نعم/لا (Boolean)</option>
                    <option value="date">تاريخ (Date)</option>
                    <option value="select">قائمة خيارات (Dropdown)</option>
                  </select>
                </label>

                <label className="ubp-field">
                  <span>{t('custom_fields.sort_order') || 'الترتيب'}</span>
                  <input
                    type="number"
                    value={formInput.sort_order}
                    onChange={(e) => setFormInput({ ...formInput, sort_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full font-mono"
                  />
                </label>
              </div>

              {formInput.data_type === 'select' && (
                <label className="ubp-field">
                  <span>الخيارات (سطر لكل خيار)</span>
                  <textarea
                    rows={3}
                    value={rawOptions}
                    onChange={(e) => setRawOptions(e.target.value)}
                    placeholder="خيار 1&#10;خيار 2&#10;خيار 3"
                    className="w-full border border-slate-300 rounded-xl p-2 text-sm"
                  />
                </label>
              )}

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={formInput.is_required}
                    onChange={(e) => setFormInput({ ...formInput, is_required: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300"
                  />
                  <span>{t('custom_fields.required') || 'حقل إلزامي'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={formInput.is_active}
                    onChange={(e) => setFormInput({ ...formInput, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300"
                  />
                  <span>{t('common.active')}</span>
                </label>
              </div>

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

      {/* Delete Confirm */}
      {deletingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف الحقل المخصص: <strong>{deletingField.label_ar}</strong> ({deletingField.field_key})؟
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingField(null)}
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
