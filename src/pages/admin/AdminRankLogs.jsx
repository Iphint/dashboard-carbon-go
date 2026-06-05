import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, X } from 'lucide-react';
import RankTimeline from '../../components/admin/RankTimeline';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createRankLog, deleteRankLog, getRankLogs, updateRankLog } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const DEFAULT_RANK_TYPES = ['Guest', 'Explorer', 'Guardian', 'Hero'];

export default function AdminRankLogs() {
  const { t } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRank, setEditingRank] = useState(null);
  const [form, setForm] = useState({ rank_name: '' });

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
    const rankName = form.rank_name.trim();
    if (!rankName) return;

    setSaving(true);
    setError(null);
    try {
      if (editingRank) {
        await updateRankLog(editingRank.id, { rank_name: rankName });
      } else {
        await createRankLog({ rank_name: rankName });
      }
      setForm({ rank_name: '' });
      setEditingRank(null);
      setFormOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('saveRankError'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (rank) => {
    setEditingRank(rank);
    setForm({ rank_name: rank.name });
    setError(null);
    setFormOpen(true);
  };

  const cancelForm = () => {
    setEditingRank(null);
    setForm({ rank_name: '' });
    setFormOpen(false);
  };

  const removeRank = async (rank) => {
    if (!rank.id || !window.confirm(t('deleteRankConfirm', { name: rank.name }))) return;

    setSaving(true);
    setError(null);
    try {
      await deleteRankLog(rank.id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('deleteRankError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditingRank(null); setForm({ rank_name: '' }); setFormOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addRank')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={saveRank} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500">{t('rankType')}</span>
            <input
              required
              maxLength={40}
              list="rank-type-suggestions"
              value={form.rank_name}
              onChange={(e) => setForm({ ...form, rank_name: e.target.value })}
              placeholder={t('rankNamePlaceholder')}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <datalist id="rank-type-suggestions">
              {DEFAULT_RANK_TYPES.map((rank) => (
                <option key={rank} value={rank} />
              ))}
            </datalist>
          </label>
          <button disabled={saving} className="rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 px-5 py-2">{saving ? t('saving') : editingRank ? t('update') : t('createRank')}</button>
          <button type="button" onClick={cancelForm} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
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
        <RankTimeline rankLogs={logs} summary onEdit={startEdit} onDelete={removeRank} />
      )}
    </div>
  );
}
