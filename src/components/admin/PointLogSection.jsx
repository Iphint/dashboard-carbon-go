import { useState, useMemo, Fragment } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';
import EmptyState from './EmptyState';
import { CardSkeleton } from './LoadingSkeleton';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
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

const typeBadge = {
  good: 'bg-emerald-100 text-emerald-700',
  bad: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
  custom: 'bg-blue-100 text-blue-700',
};

export default function PointLogSection({ logs = [], entries = [], loading = false, error = null, onRetry }) {
  const { t, language } = useAdminLanguage();

  const chartData = useMemo(() => {
    return logs.map((log) => ({
      date: log.date,
      [t('pointsIn')]: log.points_in,
      [t('pointsOut')]: -log.points_out,
      [t('cumulative')]: log.cumulative,
    }));
  }, [logs, t]);

  // Group entries by date for expandable rows
  const groupedEntries = useMemo(() => {
    const map = {};
    for (const e of entries) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [entries]);

  // Track expanded dates
  const [expandedDates, setExpandedDates] = useState({});

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

      {/* Charts */}
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

      {/* Detail Table */}
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-8 px-2 py-3"></th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('date')}</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">{t('activity')}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">{t('points')}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">{t('type')}</th>
              </tr>
            </thead>
            <tbody>
              {[...logs].reverse().map((log) => {
                const dateEntries = groupedEntries[log.date] || [];
                const expanded = expandedDates[log.date] || false;
                const hasMultiple = dateEntries.length > 1;
                const nameKey = language === 'en' ? 'name_en' : 'name_id';

                return (
                  <Fragment key={log.date}>
                    {/* Aggregated row */}
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-2 py-3 text-center">
                        {hasMultiple && (
                          <button
                            onClick={() => setExpandedDates(prev => ({ ...prev, [log.date]: !prev[log.date] }))}
                            className="p-0.5 rounded hover:bg-gray-200 cursor-pointer"
                          >
                            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {formatDate(log.date)}
                        {hasMultiple && <span className="text-xs text-gray-400 ml-1">({dateEntries.length})</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {log.total_activities} {t('activity')}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <span className="text-emerald-600">+{log.points_in}</span>
                        {log.points_out > 0 && <span className="text-red-500 ml-1">-{log.points_out}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600`}>
                          {t('netPoints')}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded detail rows */}
                    {expanded && dateEntries.map((e) => (
                      <tr key={e.id} className="bg-gray-50/30 border-b border-gray-50">
                        <td className="px-2 py-2.5"></td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">
                          {formatDate(e.date)}
                          <span className="text-gray-400 ml-1">({e.entry_index})</span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 text-sm">
                          {e[nameKey] || e.name_en || e.name_id}
                        </td>
                        <td className={`px-4 py-2.5 text-right text-sm font-medium ${
                          e.carbon_value >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {e.carbon_value >= 0 ? `+${e.carbon_value}` : e.carbon_value}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${typeBadge[e.type] || typeBadge.neutral}`}>
                            {t(e.type)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
