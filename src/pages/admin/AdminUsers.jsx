import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import UserTable from '../../components/admin/UserTable';
import { TableSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import { deleteUser, getUsers } from '../../services/adminApi';

const RANKS = ['All', 'Guest', 'Explorer', 'Guardian', 'Hero'];
const ONBOARDING = ['All', 'Complete', 'Pending'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState('All');
  const [onboardingFilter, setOnboardingFilter] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        search: search || undefined,
        rank: rankFilter !== 'All' ? rankFilter : undefined,
        onboarding: onboardingFilter !== 'All' ? onboardingFilter.toLowerCase() : undefined,
        sort: sortField || undefined,
        order: sortOrder || undefined,
      };
      const response = await getUsers(params);
      setUsers(response.data?.users || response.data || []);
      setTotalPages(response.data?.total_pages || 1);
    } catch {
      setUsers([]);
      setError('Unable to fetch users. Make sure the API is connected.');
    } finally {
      setLoading(false);
    }
  }, [page, search, rankFilter, onboardingFilter, sortField, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRankFilter('All');
    setOnboardingFilter('All');
    setSortField('');
    setSortOrder('desc');
    setPage(1);
  };

  const removeUser = async (id) => {
    await deleteUser(id);
    fetchUsers();
  };

  const hasActiveFilters = search || rankFilter !== 'All' || onboardingFilter !== 'All';

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search username or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all cursor-pointer ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {[search, rankFilter !== 'All', onboardingFilter !== 'All'].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            {/* Rank filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Rank</label>
              <div className="flex gap-1">
                {RANKS.map((rank) => (
                  <button
                    key={rank}
                    onClick={() => { setRankFilter(rank); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      rankFilter === rank
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>

            {/* Onboarding filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Onboarding</label>
              <div className="flex gap-1">
                {ONBOARDING.map((status) => (
                  <button
                    key={status}
                    onClick={() => { setOnboardingFilter(status); setPage(1); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      onboardingFilter === status
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={11} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        <UserTable
          users={users}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onDelete={removeUser}
        />
      )}
    </div>
  );
}
