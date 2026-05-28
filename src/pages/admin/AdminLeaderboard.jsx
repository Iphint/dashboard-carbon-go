import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TableSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { getLeaderboard } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const rankColors = {
  Guest: 'bg-gray-100 text-gray-700',
  Explorer: 'bg-blue-100 text-blue-700',
  Guardian: 'bg-emerald-100 text-emerald-700',
  Hero: 'bg-amber-100 text-amber-700',
};

const positionColors = ['', 'bg-amber-400', 'bg-gray-400', 'bg-amber-600'];

export default function AdminLeaderboard() {
  const { t } = useAdminLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeaderboard();
      setData(res.data?.leaderboard || res.data || []);
    } catch {
      setData([]);
      setError(t('fetchLeaderboardError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <TableSkeleton rows={10} cols={7} />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data.length) return <EmptyState title={t('leaderboardEmpty')} description={t('leaderboardEmptyDesc')} icon={Trophy} />;

  return (
    <div className="space-y-6">
      {/* Top 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.slice(0, 3).map((user, i) => (
          <div key={user.id || i} className={`relative rounded-2xl border p-6 text-center transition-all hover:shadow-md ${
            i === 0 ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white' :
            i === 1 ? 'border-gray-200 bg-gradient-to-b from-gray-50 to-white' :
            'border-amber-100 bg-gradient-to-b from-orange-50 to-white'
          }`}>
            <div className={`w-8 h-8 ${positionColors[i + 1]} text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3`}>
              {i + 1}
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
              {user.username?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h3 className="font-bold text-gray-900">{user.username}</h3>
            <p className="text-xs text-gray-500">{user.email}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-bold text-gray-900">{user.eco_score ?? user.total_score ?? '—'}</span>
              <span className="text-xs text-gray-400">{t('pts')}</span>
            </div>
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full mt-2 ${rankColors[user.current_rank] || rankColors.Guest}`}>
              {user.current_rank || 'Guest'}
            </span>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('user')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('ecoScore')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('rank')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('goodActions')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('ecoRatio')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.map((user, i) => {
                const ecoRatio = user.total_activity > 0
                  ? ((user.good_actions / user.total_activity) * 100).toFixed(1)
                  : '0.0';
                return (
                  <tr key={user.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                        i < 3 ? `${positionColors[i + 1]} text-white` : 'bg-gray-100 text-gray-600'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{user.eco_score ?? user.total_score ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${rankColors[user.current_rank] || rankColors.Guest}`}>
                        {user.current_rank || 'Guest'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{user.good_actions ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(parseFloat(ecoRatio), 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{ecoRatio}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
