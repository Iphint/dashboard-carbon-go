import { useEffect, useState, useCallback } from 'react';
import { CalendarCheck, Eye, X } from 'lucide-react';
import EmptyState from '../../components/admin/EmptyState';
import ErrorState from '../../components/admin/ErrorState';
import { TableSkeleton } from '../../components/admin/LoadingSkeleton';
import { getSurveyLogs, getUserSurveyLogs } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

function formatDate(value, language) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US');
}

export default function AdminSurveyLogs() {
  const { t, language } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSurveyLogs();
      setLogs(response.data?.logs || []);
    } catch {
      setLogs([]);
      setError(t('fetchSurveyLogsError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
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
                      <span className="text-sm font-medium text-gray-800">{formatDate(item.survey_date, language)}</span>
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
