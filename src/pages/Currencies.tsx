import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, Currency, CurrencyInput } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const Currencies: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.Currencies, ActionCodes.View);
  const canAdd = ubpStore.checkPermission(ScreenCodes.Currencies, ActionCodes.Add);
  const canEdit = ubpStore.checkPermission(ScreenCodes.Currencies, ActionCodes.Edit);
  const canDelete = ubpStore.checkPermission(ScreenCodes.Currencies, ActionCodes.Delete);

  const [currencies, setCurrencies] = useState<Currency[]>(() => ubpStore.getCurrencies());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formInput, setFormInput] = useState<CurrencyInput>({
    currency_code: '',
    name_ar: '',
    name_en: '',
    symbol: '',
    decimals: 2,
    is_base: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingCurrency, setDeletingCurrency] = useState<Currency | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reloadData = () => {
    setCurrencies(ubpStore.getCurrencies());
  };

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const openAddDialog = () => {
    setEditingCurrency(null);
    setFormInput({
      currency_code: '',
      name_ar: '',
      name_en: '',
      symbol: '',
      decimals: 2,
      is_base: false,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (c: Currency) => {
    setEditingCurrency(c);
    setFormInput({
      currency_code: c.currency_code,
      name_ar: c.name_ar,
      name_en: c.name_en || '',
      symbol: c.symbol || '',
      decimals: c.decimals,
      is_base: c.is_base,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingCurrency) {
        ubpStore.updateCurrency(editingCurrency.id, formInput);
      } else {
        ubpStore.addCurrency(formInput);
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
    if (!deletingCurrency) return;
    setDeleteError(null);
    try {
      ubpStore.deleteCurrency(deletingCurrency.id);
      setDeletingCurrency(null);
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
        title={t('screen.currencies')}
        subtitle={t('currencies.list_hint') || 'إدارة عملات النظام وتحديد العملة الأساسية للحسابات'}
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

      <div className="ubp-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="p-4 text-start">{t('currency.code') || t('common.code')}</th>
                <th className="p-4 text-start">{t('common.name_ar')}</th>
                <th className="p-4 text-start">{t('common.name_en')}</th>
                <th className="p-4 text-start">{t('currency.symbol') || 'الرمز'}</th>
                <th className="p-4 text-center">{t('currency.decimals') || 'الكسور العشرية'}</th>
                <th className="p-4 text-center">{t('currency.is_base') || 'العملة الأساسية'}</th>
                <th className="p-4 text-end">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currencies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-800">
                    <span className="ubp-code">{c.currency_code}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{c.name_ar}</td>
                  <td className="p-4 text-slate-600">{c.name_en || '—'}</td>
                  <td className="p-4 font-mono font-bold text-slate-700">{c.symbol || '—'}</td>
                  <td className="p-4 text-center font-mono">{c.decimals}</td>
                  <td className="p-4 text-center">
                    {c.is_base ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-300">
                        {t('currency.base_badge') || 'أساسية (Base)'}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit.allowed && (
                        <button
                          type="button"
                          onClick={() => openEditDialog(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50"
                          title={t('action.edit')}
                        >
                          <AppIcon name="Edit" size={16} />
                        </button>
                      )}
                      {canDelete.allowed && !c.is_base && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null);
                            setDeletingCurrency(c);
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

      {/* Add / Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCurrency ? t('currency.edit') || 'تعديل عملة' : t('currency.add') || 'إضافة عملة'}
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
                  <span>{t('currency.code') || 'كود العملة (ISO)'} *</span>
                  <input
                    type="text"
                    value={formInput.currency_code}
                    onChange={(e) => setFormInput({ ...formInput, currency_code: e.target.value })}
                    required
                    maxLength={10}
                    placeholder="EGP"
                    className="w-full uppercase font-mono"
                  />
                </label>

                <label className="ubp-field">
                  <span>{t('currency.symbol') || 'الرمز'}</span>
                  <input
                    type="text"
                    value={formInput.symbol || ''}
                    onChange={(e) => setFormInput({ ...formInput, symbol: e.target.value })}
                    maxLength={10}
                    placeholder="ج.م"
                    className="w-full font-mono"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="ubp-field">
                  <span>{t('currency.decimals') || 'الكسور العشرية'}</span>
                  <input
                    type="number"
                    min={0}
                    max={6}
                    value={formInput.decimals}
                    onChange={(e) => setFormInput({ ...formInput, decimals: parseInt(e.target.value, 10) || 2 })}
                    className="w-full font-mono"
                  />
                </label>

                <label className="flex items-center gap-2 pt-5 cursor-pointer font-bold text-slate-800 text-sm">
                  <input
                    type="checkbox"
                    checked={formInput.is_base}
                    onChange={(e) => setFormInput({ ...formInput, is_base: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300"
                  />
                  <span>{t('currency.is_base') || 'العملة الأساسية'}</span>
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
      {deletingCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95">
            <h2 className="text-lg font-bold text-red-600 mb-2">{t('common.confirm_delete')}</h2>
            <p className="text-sm text-slate-600 mb-4">
              هل أنت متأكد من رغبتك في حذف العملة: <strong>{deletingCurrency.name_ar}</strong> ({deletingCurrency.currency_code})؟
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
                onClick={() => setDeletingCurrency(null)}
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
