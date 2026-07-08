import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Box, Activity, ThumbsUp, ThumbsDown, Percent,
  Leaf, Sword, Award, Target, TrendingUp, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts';
import StatCard from '../../components/admin/StatCard';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import { getDashboardSummary, getDashboardPointSummary } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMonth(dateStr) {
  if (!dateStr) return '—';
  const [year, month] = String(dateStr).split('-').map(Number);
  const d = new Date(year, month - 1);
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

function formatYear(yearStr) {
  return String(yearStr);
}

function pointLabelFormat(label, group) {
  if (!label) return '—';
  if (group === 'monthly') return formatMonth(label);
  if (group === 'yearly') return formatYear(label);
  return formatDate(label);
}

function PointTooltip({ active, payload, label, group }) {
  const { t } = useAdminLanguage();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{pointLabelFormat(label, group)}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: <span className="font-semibold">{Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

const FILTERS = [
  { labelKey: 'today', value: 'today' },
  { labelKey: 'last7Days', value: '7days' },
  { labelKey: 'last30Days', value: '30days' },
  { labelKey: 'allTime', value: 'all' },
];

const GROUP_FILTERS = [
  { labelKey: 'daily', value: 'daily' },
  { labelKey: 'monthly', value: 'monthly' },
  { labelKey: 'yearly', value: 'yearly' },
];

const PIE_COLORS = ['#10b981', '#ef4444'];

export default function AdminDashboard() {
  const { t } = useAdminLanguage();
  const [filter, setFilter] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pointGroup, setPointGroup] = useState('daily');
  const [pointData, setPointData] = useState([]);
  const [pointLoading, setPointLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardSummary(filter);
      setData(response.data);
    } catch {
      setData(null);
      setError(t('apiUnavailable'));
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  const fetchPointData = useCallback(async () => {
    setPointLoading(true);
    try {
      const res = await getDashboardPointSummary(pointGroup);
      setPointData(res.data?.logs || []);
    } catch {
      setPointData([]);
    } finally {
      setPointLoading(false);
    }
  }, [pointGroup]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchPointData();
  }, [fetchPointData]);

  const stats = [
    { title: t('totalUsers'), value: data?.total_users, icon: Users, color: 'blue' },
    { title: t('totalUnit'), value: data?.total_unit, icon: Box, color: 'purple' },
    { title: t('totalActivities'), value: data?.total_activities, icon: Activity, color: 'cyan' },
    { title: t('goodActions'), value: data?.total_good_actions, icon: ThumbsUp, color: 'emerald' },
    { title: t('badActions'), value: data?.total_bad_actions, icon: ThumbsDown, color: 'red' },
    { title: t('avgEcoRatio'), value: data?.avg_eco_ratio != null ? `${data.avg_eco_ratio}%` : null, icon: Percent, color: 'teal' },
    { title: t('customGreenActions'), value: data?.total_custom_green_actions, icon: Leaf, color: 'emerald' },
    { title: t('questsCompleted'), value: data?.total_quests_completed, icon: Sword, color: 'indigo' },
    { title: t('ecoBadgesEarned'), value: data?.total_badges_earned, icon: Award, color: 'amber' },
    { title: t('milestonesCompleted'), value: data?.total_milestones_completed, icon: Target, color: 'pink' },
  ];

  const pointChartData = useMemo(() => {
    return pointData.map((log) => ({
      date: log.date,
      [t('pointsIn')]: log.points_in,
      [t('pointsOut')]: -log.points_out,
      [t('cumulative')]: log.cumulative,
    }));
  }, [pointData, t]);

  // Demo chart data (only show when real data is available)
  const activityChartData = data?.activity_chart || [];
  const actionsPieData = data?.total_good_actions != null ? [
    { name: t('goodActions'), value: data.total_good_actions || 0 },
    { name: t('badActions'), value: data.total_bad_actions || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <BarChart3 className="w-5 h-5 text-gray-400" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
              filter === f.value
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      {loading ? (
        <CardSkeleton count={10} />
      ) : error && !data ? (
        <div>
          {/* Show stat cards with empty values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 mb-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                {t('activityTrend')}
              </h3>
              {activityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={activityChartData}>
                    <defs>
                      <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      labelFormatter={formatDate}
                    />
                    <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#colorActivities)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
                  {t('noChartData')}
                </div>
              )}
            </div>

            {/* Actions Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                {t('actionsDistribution')}
              </h3>
              {actionsPieData.length > 0 && (actionsPieData[0].value > 0 || actionsPieData[1].value > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={actionsPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {actionsPieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
                  {t('noActionData')}
                </div>
              )}
              {actionsPieData.length > 0 && (
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-600">{t('good')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-gray-600">{t('bad')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CU Accumulation Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                {t('pointAccumulation')}
              </h3>
              <div className="flex items-center gap-2">
                {GROUP_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setPointGroup(f.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      pointGroup === f.value
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t(f.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            {pointLoading ? (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">{t('loading')}</div>
            ) : pointChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pointChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(val) => pointLabelFormat(val, pointGroup)} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<PointTooltip group={pointGroup} />} />
                    <Legend />
                    <Bar dataKey={t('pointsIn')} fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('pointsOut')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-gray-400">
                {t('noChartData')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
