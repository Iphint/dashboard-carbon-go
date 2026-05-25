import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ActivityLogTable({ logs = [], page = 1, totalPages = 1, onPageChange, onDelete }) {
  if (!logs.length) {
    return <EmptyState title="No Activity Logs" description="No activity logs found for the current filters." />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Eco Point</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              {onDelete && <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log, idx) => (
              <tr key={log.id || idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  {log.date ? new Date(log.date).toLocaleDateString('id-ID') : '—'}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{log.name || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                    {log.type || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{log.unit ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{log.category || '—'}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{log.eco_point ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    log.is_good ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.is_good ? 'Good' : 'Bad'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    log.source === 'custom' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {log.source || 'default'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{log.description || '—'}</td>
                {onDelete && (
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(log.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
