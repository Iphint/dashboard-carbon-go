import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Shield, Calendar, Clock, CheckCircle,
  BookOpen, ClipboardCheck, Activity, ThumbsUp, ThumbsDown, Percent,
  Leaf, Sword, Award, Target, Trophy, TrendingUp, Box, Hash,
  Filter, X
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import ActivityLogTable from '../../components/admin/ActivityLogTable';
import ProgressSection from '../../components/admin/ProgressSection';
import RankTimeline from '../../components/admin/RankTimeline';
import { DetailSkeleton, TableSkeleton, CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import {
  getUserById,
  getUserActivityLogs,
  getUserCustomGreenActions,
  getUserProgress,
  getUserRankLogs,
} from '../../services/adminApi';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'activity', label: 'Activity Logs', icon: Activity },
  { id: 'green-actions', label: 'Green Actions', icon: Leaf },
  { id: 'progress', label: 'Progress', icon: Target },
  { id: 'ranks', label: 'Rank History', icon: TrendingUp },
];

const LOG_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Good Actions', value: 'good' },
  { label: 'Bad Actions', value: 'bad' },
  { label: 'Custom', value: 'custom' },
  { label: 'Default', value: 'default' },
];

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // User data
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // Activity logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState(null);
  const [logFilter, setLogFilter] = useState('all');
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // Custom green actions
  const [greenActions, setGreenActions] = useState([]);
  const [greenLoading, setGreenLoading] = useState(false);
  const [greenError, setGreenError] = useState(null);

  // Progress
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(null);

  // Rank logs
  const [rankLogs, setRankLogs] = useState([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState(null);

  // Fetch user details
  const fetchUser = useCallback(async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await getUserById(id);
      setUser(res.data);
    } catch {
      setUser(null);
      setUserError('Unable to fetch user details.');
    } finally {
      setUserLoading(false);
    }
  }, [id]);

  // Fetch activity logs
  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const res = await getUserActivityLogs(id, { page: logPage, filter: logFilter !== 'all' ? logFilter : undefined });
      setLogs(res.data?.logs || res.data || []);
      setLogTotalPages(res.data?.total_pages || 1);
    } catch {
      setLogs([]);
      setLogsError('Unable to fetch activity logs.');
    } finally {
      setLogsLoading(false);
    }
  }, [id, logPage, logFilter]);

  // Fetch green actions
  const fetchGreenActions = useCallback(async () => {
    setGreenLoading(true);
    setGreenError(null);
    try {
      const res = await getUserCustomGreenActions(id);
      setGreenActions(res.data?.actions || res.data || []);
    } catch {
      setGreenActions([]);
      setGreenError('Unable to fetch custom green actions.');
    } finally {
      setGreenLoading(false);
    }
  }, [id]);

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    setProgressLoading(true);
    setProgressError(null);
    try {
      const res = await getUserProgress(id);
      setProgress(res.data);
    } catch {
      setProgress(null);
      setProgressError('Unable to fetch progress data.');
    } finally {
      setProgressLoading(false);
    }
  }, [id]);

  // Fetch rank logs
  const fetchRankLogs = useCallback(async () => {
    setRankLoading(true);
    setRankError(null);
    try {
      const res = await getUserRankLogs(id);
      setRankLogs(res.data?.logs || res.data || []);
    } catch {
      setRankLogs([]);
      setRankError('Unable to fetch rank logs.');
    } finally {
      setRankLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (activeTab === 'activity') fetchLogs();
    if (activeTab === 'green-actions') fetchGreenActions();
    if (activeTab === 'progress') fetchProgress();
    if (activeTab === 'ranks') fetchRankLogs();
  }, [activeTab, fetchLogs, fetchGreenActions, fetchProgress, fetchRankLogs]);

  const ecoRatio = user?.total_activity > 0
    ? ((user.good_actions / user.total_activity) * 100).toFixed(1)
    : '0.0';

  const rankColors = {
    Guest: 'bg-gray-100 text-gray-700',
    Explorer: 'bg-blue-100 text-blue-700',
    Guardian: 'bg-emerald-100 text-emerald-700',
    Hero: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/users')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      {/* User Header */}
      {userLoading ? (
        <DetailSkeleton />
      ) : userError ? (
        <ErrorState message={userError} onRetry={fetchUser} />
      ) : user ? (
        <>
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200">
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${rankColors[user.current_rank] || rankColors.Guest}`}>
                    {user.current_rank || 'Guest'}
                  </span>
                  {user.role === 'admin' && (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Admin</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
              </div>
              {user.leaderboard_position != null && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-[10px] text-amber-600 font-medium uppercase">Leaderboard</p>
                    <p className="text-lg font-bold text-amber-700">#{user.leaderboard_position}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Account Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InfoItem icon={Hash} label="User ID" value={user.id} />
              <InfoItem icon={User} label="Username" value={user.username} />
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Shield} label="Role" value={user.role || 'user'} />
              <InfoItem icon={Calendar} label="Registered" value={user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '—'} />
              <InfoItem icon={Clock} label="Last Login" value={user.last_login ? new Date(user.last_login).toLocaleString('id-ID') : '—'} />
            </div>
          </div>

          {/* Onboarding Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
              Onboarding Data
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <InfoItem
                icon={CheckCircle}
                label="Status"
                value={
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    user.onboarding_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {user.onboarding_complete ? 'Complete' : 'Pending'}
                  </span>
                }
              />
              <InfoItem icon={Calendar} label="Completed At" value={user.onboarding_completed_at ? new Date(user.onboarding_completed_at).toLocaleDateString('id-ID') : '—'} />
              <InfoItem icon={Activity} label="Last Step" value={user.onboarding_last_step ?? '—'} />
              <InfoItem icon={BookOpen} label="Guidebook Viewed" value={user.guidebook_viewed ? 'Yes' : 'No'} />
              <InfoItem icon={Calendar} label="Last Daily Survey" value={user.last_daily_survey ? new Date(user.last_daily_survey).toLocaleDateString('id-ID') : '—'} />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <StatCard title="Total Unit" value={user.total_unit ?? '—'} icon={Box} color="purple" />
            <StatCard title="Total Activity" value={user.total_activity ?? '—'} icon={Activity} color="cyan" />
            <StatCard title="Good Actions" value={user.good_actions ?? '—'} icon={ThumbsUp} color="emerald" />
            <StatCard title="Bad Actions" value={user.bad_actions ?? '—'} icon={ThumbsDown} color="red" />
            <StatCard title="Eco Ratio" value={`${ecoRatio}%`} icon={Percent} color="teal" />
            <StatCard title="Custom Green" value={user.total_custom_green_actions ?? '—'} icon={Leaf} color="emerald" />
            <StatCard title="Quests Done" value={user.total_quests_completed ?? '—'} icon={Sword} color="indigo" />
            <StatCard title="Badges Earned" value={user.total_badges_earned ?? '—'} icon={Award} color="amber" />
            <StatCard title="Milestones" value={user.total_milestones_completed ?? '—'} icon={Target} color="pink" />
            <StatCard title="Current Rank" value={user.current_rank || 'Guest'} icon={Shield} color="blue" />
            <StatCard title="LB Position" value={user.leaderboard_position ? `#${user.leaderboard_position}` : '—'} icon={Trophy} color="amber" />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-100">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-200">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{user.username}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${rankColors[user.current_rank] || rankColors.Guest}`}>
                        {user.current_rank || 'Guest'}
                      </span>
                      {user.leaderboard_position && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-700">
                          <Trophy className="w-3.5 h-3.5" />
                          #{user.leaderboard_position}
                        </span>
                      )}
                    </div>

                    {/* Eco Ratio Visual */}
                    <div className="max-w-xs mx-auto mt-6">
                      <p className="text-xs font-medium text-gray-500 mb-2">Eco Ratio</p>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(parseFloat(ecoRatio), 100)}%` }}
                        />
                      </div>
                      <p className="text-2xl font-bold text-emerald-600 mt-2">{ecoRatio}%</p>
                      <p className="text-xs text-gray-400">Good Actions / Total Activities</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Logs Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400" />
                    {LOG_FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => { setLogFilter(f.value); setLogPage(1); }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          logFilter === f.value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {logsLoading ? (
                    <TableSkeleton rows={5} cols={9} />
                  ) : logsError ? (
                    <ErrorState message={logsError} onRetry={fetchLogs} />
                  ) : (
                    <ActivityLogTable
                      logs={logs}
                      page={logPage}
                      totalPages={logTotalPages}
                      onPageChange={setLogPage}
                    />
                  )}
                </div>
              )}

              {/* Custom Green Actions Tab */}
              {activeTab === 'green-actions' && (
                <div>
                  {greenLoading ? (
                    <CardSkeleton count={4} />
                  ) : greenError ? (
                    <ErrorState message={greenError} onRetry={fetchGreenActions} />
                  ) : greenActions.length === 0 ? (
                    <EmptyState title="No Custom Green Actions" description="This user hasn't created any custom green actions yet." icon={Leaf} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {greenActions.map((action, i) => (
                        <div key={action.id || i} className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                              <Leaf className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900">{action.name}</h4>
                              <p className="text-xs text-gray-500 mt-0.5">{action.description || '—'}</p>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {action.category && (
                                  <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-100 text-blue-700">
                                    {action.category}
                                  </span>
                                )}
                                {action.eco_point != null && (
                                  <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-700">
                                    {action.eco_point} pts
                                  </span>
                                )}
                              </div>

                              {action.feedback && (
                                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                  <p className="text-[11px] font-medium text-gray-500 mb-0.5">System Feedback</p>
                                  <p className="text-xs text-gray-700">{action.feedback}</p>
                                </div>
                              )}
                              {action.recommendation && (
                                <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                                  <p className="text-[11px] font-medium text-emerald-600 mb-0.5">Recommendation</p>
                                  <p className="text-xs text-emerald-800">{action.recommendation}</p>
                                </div>
                              )}

                              <p className="text-[11px] text-gray-400 mt-2">
                                Created: {action.created_at ? new Date(action.created_at).toLocaleDateString('id-ID') : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div>
                  {progressLoading ? (
                    <CardSkeleton count={6} />
                  ) : progressError ? (
                    <ErrorState message={progressError} onRetry={fetchProgress} />
                  ) : (
                    <ProgressSection
                      milestones={progress?.milestones || []}
                      badges={progress?.badges || []}
                      quests={progress?.quests || []}
                    />
                  )}
                </div>
              )}

              {/* Rank History Tab */}
              {activeTab === 'ranks' && (
                <div>
                  {rankLoading ? (
                    <CardSkeleton count={4} />
                  ) : rankError ? (
                    <ErrorState message={rankError} onRetry={fetchRankLogs} />
                  ) : (
                    <RankTimeline rankLogs={rankLogs} />
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="User Not Found" description="The requested user could not be found." />
      )}
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 font-medium">{label}</p>
        <div className="text-sm font-medium text-gray-800 truncate">{value || '—'}</div>
      </div>
    </div>
  );
}
