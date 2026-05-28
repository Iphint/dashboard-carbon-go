import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { useAdminLanguage } from '../../context/LanguageContext';

const pageTitles = {
  '/admin': 'dashboard',
  '/admin/dashboard': 'dashboard',
  '/admin/users': 'userManagement',
  '/admin/activity-logs': 'activityLogs',
  '/admin/leaderboard': 'leaderboard',
  '/admin/custom-green-actions': 'customGreenActions',
  '/admin/milestones': 'milestones',
  '/admin/eco-badges': 'ecoBadges',
  '/admin/quests': 'quests',
  '/admin/rank-logs': 'rankLogs',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useAdminLanguage();

  const getTitle = () => {
    if (location.pathname.startsWith('/admin/users/')) return t('userDetail');
    return t(pageTitles[location.pathname] || 'dashboard');
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
