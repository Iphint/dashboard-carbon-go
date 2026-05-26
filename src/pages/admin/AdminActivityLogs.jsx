import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import ActivityLogTable from '../../components/admin/ActivityLogTable';
import { TableSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import { deleteActivityLog, getActivityLogs } from '../../services/adminApi';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Good Actions', value: 'good' },
  { label: 'Bad Actions', value: 'bad' },
  { label: 'Neutral / No Special', value: 'neutral' },
  { label: 'Custom Green', value: 'custom' },
  { label: 'Default', value: 'default' },
];

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActivityLogs({
        page,
        filter: filter !== 'all' ? filter : undefined,
        date: dateFilter || undefined,
      });
      setLogs(res.data?.logs || res.data || []);
      setTotalPages(res.data?.total_pages || 1);
    } catch {
      setLogs([]);
      setError('Unable to fetch activity logs. Make sure the API is connected.');
    } finally {
      setLoading(false);
    }
  }, [page, filter, dateFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const removeLog = async (id) => {
    await deleteActivityLog(id);
    fetchLogs();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <Filter className="w-4 h-4 text-gray-400" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  filter === f.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={9} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : (
        <ActivityLogTable
          logs={logs}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onDelete={removeLog}
        />
      )}
    </div>
  );
}
