import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Trophy,
  Leaf,
  Target,
  Award,
  Sword,
  TrendingUp,
  X,
  TreePine,
} from 'lucide-react';
import { useAdminLanguage } from '../../context/LanguageContext';

const menuItems = [
  { labelKey: 'dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { labelKey: 'userManagement', path: '/admin/users', icon: Users },
  { labelKey: 'activityLogs', path: '/admin/activity-logs', icon: Activity },
  { labelKey: 'leaderboard', path: '/admin/leaderboard', icon: Trophy },
  { labelKey: 'customGreenActions', path: '/admin/custom-green-actions', icon: Leaf },
  { labelKey: 'milestones', path: '/admin/milestones', icon: Target },
  { labelKey: 'ecoBadges', path: '/admin/eco-badges', icon: Award },
  { labelKey: 'quests', path: '/admin/quests', icon: Sword },
  { labelKey: 'rankLogs', path: '/admin/rank-logs', icon: TrendingUp },
];

export default function AdminSidebar({ open, onClose }) {
  const { t } = useAdminLanguage();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">EcoTrack</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t('adminPanel')}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{t('menu')}</p>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="px-3 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <p className="text-xs font-semibold text-emerald-800">EcoTrack v1.0</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">{t('adminDashboard')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
