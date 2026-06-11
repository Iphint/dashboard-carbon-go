import { useEffect, useState, useCallback, useRef } from 'react';
import { CalendarCheck, Eye, RefreshCw, X } from 'lucide-react';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { TableSkeleton } from '../../components/admin/LoadingSkeleton';
import { getSurveyLogs, getUserSurveyLogs } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

function formatDate(value, language, options = {}) {
  if (!value) return '—';
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(locale, options);
  }
  return new Date(value).toLocaleString(locale, options);
}

function formatDateTime(value, language) {
  return formatDate(value, language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatCountdown(target) {
  if (!target) return '—';
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function AdminSurveyLogs() {
  const { t, language } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [surveyDate, setSurveyDate] = useState('');
  const [nextResetAt, setNextResetAt] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const hasLogsRef = useRef(false);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      const response = await getSurveyLogs();
      const nextLogs = response.data?.logs || [];
      hasLogsRef.current = Boolean(nextLogs.length);
      setLogs(nextLogs);
      setSurveyDate(response.data?.date || '');
      setNextResetAt(response.data?.next_reset_at || '');
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const detail = err.response?.data?.message || err.message;
      const message = detail ? `${t('fetchSurveyLogsError')} (${detail})` : t('fetchSurveyLogsError');
      if (!silent || !hasLogsRef.current) {
        setLogs([]);
        setSurveyDate('');
        setNextResetAt('');
        setError(message);
      } else {
        setError(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(() => {
      fetchData({ silent: true });
    }, 5000);
    const clock = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(clock);
    };
  }, [fetchData]);

  const openDetail = async (user) => {
    setDetailLoading(true);
    setDetail({ user, history: [] });
    try {
      const response = await getUserSurveyLogs(user.user_id);
      setDetail(response.data);
    } catch {
      setDetail({ user, history: [], error: t('fetchSurveyLogsError') });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{t('dailySurvey')}</p>
          <p className="text-sm text-gray-600">
            {t('surveyDate')}: <span className="font-semibold text-gray-900">{formatDate(surveyDate, language)}</span>
          </p>
          <p className="text-xs text-gray-500">
            {t('nextReset')}: <span className="font-semibold text-gray-800">{formatDateTime(nextResetAt, language)}</span>
          </p>
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={() => fetchData()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {t('reloadData')}
          </button>
          <p className="text-xs text-gray-500">{t('resetIn')}: {formatCountdown(nextResetAt)}</p>
          <p className="text-sm font-medium text-gray-800">{lastUpdated ? lastUpdated.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US') : '—'}</p>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : !logs.length ? (
        <EmptyState title={t('noSurveyLogs')} description={t('noSurveyLogsDesc')} icon={CalendarCheck} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('user')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('dailySurvey')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('completedAt')}</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('detail')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((item) => {
                  const completed = item.daily_survey_status === 'completed';
                  return (
                    <tr key={item.user_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.username}</p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {completed ? t('completed') : t('notCompleted')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {completed ? formatDateTime(item.completed_at, language) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openDetail(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('detail')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{t('surveyHistory')}</h3>
                <p className="text-xs text-gray-400">{detail.user?.username || detail.user?.email}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              {detailLoading ? (
                <p className="text-sm text-gray-500">{t('loading')}</p>
              ) : detail.error ? (
                <p className="text-sm text-red-500">{detail.error}</p>
              ) : detail.history?.length ? (
                <div className="space-y-2">
                  {detail.history.map((item) => (
                    <div key={item.survey_date} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(item.survey_date, language)}
                        {item.last_entry_at && (
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            {formatDate(item.last_entry_at, language, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        )}
                      </span>
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        {t('completed')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title={t('noSurveyHistory')} description={t('noSurveyHistoryDesc')} icon={CalendarCheck} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
