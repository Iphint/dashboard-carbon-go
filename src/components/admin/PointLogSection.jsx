import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';
import EmptyState from './EmptyState';
import { CardSkeleton } from './LoadingSkeleton';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  const { t } = useAdminLanguage();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{formatDate(label)}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function PointLogSection({ logs = [], loading = false, error = null, onRetry }) {
  const { t } = useAdminLanguage();

  const chartData = useMemo(() => {
    return logs.map((log) => ({
      date: log.date,
      [t('pointsIn')]: log.points_in,
      [t('pointsOut')]: -log.points_out,
      [t('cumulative')]: log.cumulative,
    }));
  }, [logs, t]);

  if (loading) return <CardSkeleton count={4} />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium cursor-pointer">
            {t('tryAgain')}
          </button>
        )}
      </div>
    );
  }

  if (!logs.length) {
    return <EmptyState title={t('noPointData')} icon={Activity} />;
  }

  const latest = logs[logs.length - 1];
  const first = logs[0];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('pointsIn')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {logs.reduce((s, l) => s + l.points_in, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">{t('pointsOut')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {logs.reduce((s, l) => s + l.points_out, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium">{t('netPoints')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{latest?.net_points || 0}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('totalCumulative')}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{latest?.cumulative || 0}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{t('pointChartTitle')}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={t('cumulative')}
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily bar chart */}
        <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-4">{t('dailyPoints')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey={t('pointsIn')} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t('pointsOut')} fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('date')}</th>
                <th className="text-right px-4 py-3 font-semibold text-emerald-600">{t('pointsIn')}</th>
                <th className="text-right px-4 py-3 font-semibold text-red-500">{t('pointsOut')}</th>
                <th className="text-right px-4 py-3 font-semibold text-blue-600">{t('netPoints')}</th>
                <th className="text-right px-4 py-3 font-semibold text-amber-600">{t('cumulative')}</th>
              </tr>
            </thead>
            <tbody>
              {[...logs].reverse().map((log, i) => (
                <tr key={log.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 text-gray-700">{formatDate(log.date)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">+{log.points_in}</td>
                  <td className="px-4 py-3 text-right text-red-500 font-medium">{log.points_out > 0 ? `-${log.points_out}` : '0'}</td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: log.net_points >= 0 ? '#059669' : '#dc2626' }}>
                    {log.net_points >= 0 ? `+${log.net_points}` : log.net_points}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">{log.cumulative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
