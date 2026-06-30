import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';
import { useAdminLanguage } from '../../context/LanguageContext';

const typeStyles = {
  good: 'bg-emerald-50 text-emerald-700',
  bad: 'bg-red-50 text-red-700',
  neutral: 'bg-amber-50 text-amber-700',
  custom: 'bg-purple-50 text-purple-700',
};

const sourceStyles = {
  custom: 'bg-purple-100 text-purple-700',
  neutral: 'bg-amber-100 text-amber-700',
  default: 'bg-gray-100 text-gray-600',
};

export default function ActivityLogTable({ logs = [], page = 1, totalPages = 1, onPageChange, onDelete }) {
  const { t, label } = useAdminLanguage();

  if (!logs.length) {
    return <EmptyState title={t('noActivityLogs')} description={t('noActivityLogsDesc')} />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('date')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('activity')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('type')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('unit')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('category')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('ecoPoint')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('status')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('source')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('description')}</th>
              {onDelete && <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('action')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {log.date ? new Date(log.date).toLocaleString('id-ID') : '—'}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles[log.type] || 'bg-blue-50 text-blue-700'}`}>
                    {label(log.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{log.unit ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{label(log.category)}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{log.eco_point ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    log.type === 'neutral'
                      ? 'bg-amber-100 text-amber-700'
                      : log.is_good
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {log.type === 'neutral' ? t('neutral') : log.is_good ? t('good') : t('bad')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${sourceStyles[log.source] || sourceStyles.default}`}>
                    {label(log.source || 'default')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{log.description || '—'}</td>
                {onDelete && (
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(log.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('delete')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">{t('pageOf', { page, total: totalPages })}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
