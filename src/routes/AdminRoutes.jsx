import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminActivityLogs from '../pages/admin/AdminActivityLogs';
import AdminLeaderboard from '../pages/admin/AdminLeaderboard';
import AdminCustomGreenActions from '../pages/admin/AdminCustomGreenActions';
import AdminMilestones from '../pages/admin/AdminMilestones';
import AdminEcoBadges from '../pages/admin/AdminEcoBadges';
import AdminQuests from '../pages/admin/AdminQuests';
import AdminRankLogs from '../pages/admin/AdminRankLogs';
import Unauthorized from '../pages/admin/Unauthorized';
import AdminLogin from '../pages/admin/AdminLogin';
import { useAdminLanguage } from '../context/LanguageContext';

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const { t } = useAdminLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
}

function AdminIndexRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/admin/login'} replace />;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/unauthorized" element={<Unauthorized />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="activity-logs" element={<AdminActivityLogs />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="custom-green-actions" element={<AdminCustomGreenActions />} />
        <Route path="milestones" element={<AdminMilestones />} />
        <Route path="eco-badges" element={<AdminEcoBadges />} />
        <Route path="quests" element={<AdminQuests />} />
        <Route path="rank-logs" element={<AdminRankLogs />} />
      </Route>
      {/* Keep every dashboard route under the /admin namespace. */}
      <Route path="/" element={<AdminIndexRedirect />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
