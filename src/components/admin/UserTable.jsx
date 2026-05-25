import { useNavigate } from 'react-router-dom';
import { Eye, ArrowUpDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';

const rankColors = {
  Guest: 'bg-gray-100 text-gray-700',
  Explorer: 'bg-blue-100 text-blue-700',
  Guardian: 'bg-emerald-100 text-emerald-700',
  Hero: 'bg-amber-100 text-amber-700',
};

export default function UserTable({ users = [], sortField, sortOrder, onSort, page = 1, totalPages = 1, onPageChange, onDelete }) {
  const navigate = useNavigate();

  const SortHeader = ({ field, children }) => (
    <button
      onClick={() => onSort?.(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors cursor-pointer"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-emerald-600' : 'text-gray-300'}`} />
    </button>
  );

  if (!users.length) {
    return <EmptyState title="No Users Found" description="No users match your current filters." />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Onboarding</th>
              <th className="px-4 py-3 text-left"><SortHeader field="total_unit">Unit</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="total_activity">Activity</SortHeader></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Good</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bad</th>
              <th className="px-4 py-3 text-left"><SortHeader field="eco_ratio">Eco Ratio</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="rank">Rank</SortHeader></th>
              <th className="px-4 py-3 text-left"><SortHeader field="leaderboard_rank">LB Rank</SortHeader></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const ecoRatio = user.total_activity > 0
                ? ((user.good_actions / user.total_activity) * 100).toFixed(1)
                : '0.0';
              return (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      user.onboarding_complete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {user.onboarding_complete ? 'Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{user.total_unit ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{user.total_activity ?? '—'}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{user.good_actions ?? '—'}</td>
                  <td className="px-4 py-3 text-red-500 font-medium">{user.bad_actions ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(parseFloat(ecoRatio), 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{ecoRatio}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${rankColors[user.current_rank] || rankColors.Guest}`}>
                      {user.current_rank || 'Guest'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">#{user.leaderboard_rank ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.joined_at ? new Date(user.joined_at).toLocaleDateString('id-ID') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                    {onDelete && user.role !== 'admin' && (
                      <button
                        onClick={() => onDelete(user.id)}
                        className="ml-1 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
