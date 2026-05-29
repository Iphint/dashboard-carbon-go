import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, X } from 'lucide-react';
import RankTimeline from '../../components/admin/RankTimeline';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createRankLog, getRankLogs } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

export default function AdminRankLogs() {
  const { t } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ user_id: '', rank_name: 'Guest' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRankLogs();
      setLogs(res.data?.logs || res.data || []);
    } catch {
      setLogs([]);
      setError(t('fetchRankLogsError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveRank = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createRankLog(form);
      setForm({ user_id: '', rank_name: 'Guest' });
      setFormOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('saveRankError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addRank')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={saveRank} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
          <input required type="number" min="1" placeholder={t('userId')} value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <select value={form.rank_name} onChange={(e) => setForm({ ...form, rank_name: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
            {['Guest', 'Explorer', 'Guardian', 'Hero'].map((rank) => (
              <option key={rank} value={rank}>{t(rank.toLowerCase())}</option>
            ))}
          </select>
          <button disabled={saving} className="rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 px-5 py-2">{saving ? t('saving') : t('createRank')}</button>
          <button type="button" onClick={() => setFormOpen(false)} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
        </form>
      )}

      {loading ? (
        <CardSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : !logs.length ? (
        <div>
          <RankTimeline rankLogs={[]} summary />
          <div className="mt-4">
            <EmptyState title={t('noRankLogs')} description={t('noRankLogsDesc')} icon={TrendingUp} />
          </div>
        </div>
      ) : (
        <RankTimeline rankLogs={logs} summary />
      )}
    </div>
  );
}
