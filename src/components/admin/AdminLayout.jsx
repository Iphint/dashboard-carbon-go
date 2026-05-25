import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/activity-logs': 'Activity Logs',
  '/admin/leaderboard': 'Leaderboard',
  '/admin/custom-green-actions': 'Custom Green Actions',
  '/admin/milestones': 'Milestones',
  '/admin/eco-badges': 'Eco Badges',
  '/admin/quests': 'Quests',
  '/admin/rank-logs': 'Rank Logs',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.startsWith('/admin/users/')) return 'User Detail';
    return pageTitles[location.pathname] || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
