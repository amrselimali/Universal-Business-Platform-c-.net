import React, { useState } from 'react';
import { useI18n } from '../i18n';
import { ubpStore } from '../services/store';
import { ScreenCodes, ActionCodes, QaMatrixRow, QaRunSummary } from '../types/ubp';
import { PageHeader } from '../components/Shared/PageHeader';
import { ForbiddenView } from '../components/Shared/ForbiddenView';
import { AppIcon } from '../components/Shared/AppIcon';

export const QaCenter: React.FC = () => {
  const { t } = useI18n();
  const canView = ubpStore.checkPermission(ScreenCodes.QaCenter, ActionCodes.View);
  const canRun = ubpStore.checkPermission(ScreenCodes.QaCenter, ActionCodes.RunTests);

  const [matrix, setMatrix] = useState<QaMatrixRow[]>(() => ubpStore.getQaMatrix());
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  // Result / History Dialog
  const [lastRun, setLastRun] = useState<QaRunSummary | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [runsHistory, setRunsHistory] = useState<QaRunSummary[]>(() => ubpStore.getQaRuns());

  if (!canView.allowed) {
    return <ForbiddenView />;
  }

  const handleSelectCode = (code: string) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const handleSelectAll = () => {
    setSelectedCodes(matrix.map((m) => m.definition.code));
  };

  const handleClearSelection = () => {
    setSelectedCodes([]);
  };

  const executeTests = (codesToRun: string[]) => {
    if (!canRun.allowed) return;
    setRunning(true);

    setTimeout(() => {
      const summary = ubpStore.runQaTests(codesToRun);
      setLastRun(summary);
      setMatrix(ubpStore.getQaMatrix());
      setRunsHistory(ubpStore.getQaRuns());
      setRunning(false);
    }, 400);
  };

  const criticalityColor = (c: string) => {
    switch (c) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('screen.qa')}
        subtitle="مركز الفحص الآلي واختبارات تكامل قواعد العمل وصلاحيات النظام والتطبيع"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <AppIcon name="History" size={18} />
              <span>سجل الفحوصات ({runsHistory.length})</span>
            </button>

            {canRun.allowed && (
              <button
                type="button"
                disabled={running}
                onClick={() => executeTests(selectedCodes.length > 0 ? selectedCodes : [])}
                className="ubp-primary-btn flex items-center gap-2"
              >
                <AppIcon name="Play" size={18} />
                <span>
                  {running
                    ? 'جاري الفحص...'
                    : selectedCodes.length > 0
                    ? `تنفيذ المحدد (${selectedCodes.length})`
                    : 'تنفيذ جميع الفحوصات (9)'}
                </span>
              </button>
            )}
          </div>
        }
      />

      {/* Control bar */}
      <div className="ubp-card flex items-center justify-between !p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase">الاختيار:</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200"
          >
            {t('common.select_all')}
          </button>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
          >
            {t('common.clear_all')}
          </button>
        </div>

        {selectedCodes.length > 0 && (
          <span className="text-xs font-bold text-teal-700">
            تم تحديد {selectedCodes.length} من {matrix.length} فحص
          </span>
        )}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matrix.map((row) => {
          const isSelected = selectedCodes.includes(row.definition.code);

          return (
            <div
              key={row.definition.code}
              className={`p-4 rounded-2xl border transition-all bg-white shadow-xs cursor-pointer ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleSelectCode(row.definition.code)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectCode(row.definition.code)}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300"
                  />
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {row.definition.code}
                  </span>
                </label>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${criticalityColor(
                    row.definition.criticality
                  )}`}
                >
                  {row.definition.criticality}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1">{row.definition.name_ar}</h3>
              <p className="text-xs text-slate-500 mb-3 font-sans">{row.definition.name_en}</p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">{row.definition.category}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                    row.status === 'Passed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : row.status === 'Failed'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {row.status === 'Passed' ? 'ناجح (Passed)' : row.status === 'Failed' ? 'فشل (Failed)' : 'لم يُختبر'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* QA Run Results Dialog */}
      {lastRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">نتائج الفحص الآلي</h2>
                <span className="text-xs text-slate-500 font-mono">
                  Trace ID: {lastRun.trace_id} • البيئة: {lastRun.environment}
                </span>
              </div>
              <button onClick={() => setLastRun(null)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            <div className="flex gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-center">
              <div className="flex-1">
                <span className="text-xs text-slate-400 block font-bold">الإجمالي</span>
                <strong className="text-lg text-slate-800">{lastRun.total_count}</strong>
              </div>
              <div className="flex-1 border-x border-slate-200">
                <span className="text-xs text-emerald-600 block font-bold">الناجحة</span>
                <strong className="text-lg text-emerald-700">{lastRun.passed_count}</strong>
              </div>
              <div className="flex-1">
                <span className="text-xs text-red-500 block font-bold">الفاشلة</span>
                <strong className="text-lg text-red-600">{lastRun.failed_count}</strong>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {lastRun.results?.map((res) => (
                <div
                  key={res.test_code}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800 font-mono">{res.test_code}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{res.message}</div>
                  </div>
                  <div className="text-end shrink-0">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md inline-block text-[11px] ${
                        res.status === 'Passed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {res.status}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] block mt-1">
                      {res.duration_ms} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setLastRun(null)}
                className="ubp-primary-btn text-sm"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Dialog */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">سجل عمليات الفحص السابقة</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <AppIcon name="Close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {runsHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">{t('common.no_data')}</p>
              ) : (
                runsHistory.map((run) => (
                  <div
                    key={run.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{run.trace_id}</span>
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        {new Date(run.started_at).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700">✓ {run.passed_count}</span>
                      <span className="font-bold text-red-600">✕ {run.failed_count}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLastRun(run);
                          setIsHistoryOpen(false);
                        }}
                        className="px-2.5 py-1 rounded-lg text-teal-700 bg-teal-50 border border-teal-200 font-semibold"
                      >
                        عرض
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
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
