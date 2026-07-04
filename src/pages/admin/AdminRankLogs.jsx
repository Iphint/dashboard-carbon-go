import { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, X } from 'lucide-react';
import Swal from 'sweetalert2';
import RankTimeline from '../../components/admin/RankTimeline';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createRankLog, deleteRankLog, getRankLogs, getMilestones, getEcoBadges, getQuests, updateRankLog } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const DEFAULT_RANK_TYPES = ['Guest', 'Explorer', 'Guardian', 'Hero'];

const emptyForm = {
  rank_name: '',
  name_en: '',
  name_id: '',
  description_en: '',
  description_id: '',
  milestone_id: '',
  badge_id: '',
  quest_id: '',
};

export default function AdminRankLogs() {
  const { t } = useAdminLanguage();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRank, setEditingRank] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [milestones, setMilestones] = useState([]);
  const [badges, setBadges] = useState([]);
  const [quests, setQuests] = useState([]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [mRes, bRes, qRes] = await Promise.all([getMilestones(), getEcoBadges(), getQuests()]);
      setMilestones(mRes.data?.milestones || mRes.data || []);
      setBadges(bRes.data?.badges || bRes.data || []);
      setQuests(qRes.data?.quests || qRes.data || []);
    } catch { /* ignore */ }
  }, []);

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
    fetchDropdowns();
  }, [fetchData, fetchDropdowns]);

  const saveRank = async (event) => {
    event.preventDefault();
    const rankName = form.rank_name.trim();
    if (!rankName) return;

    setSaving(true);
    setError(null);
    try {
      const payload = {
        rank_name: rankName,
        name_en: form.name_en || null,
        name_id: form.name_id || null,
        description_en: form.description_en || null,
        description_id: form.description_id || null,
        milestone_id: form.milestone_id || null,
        badge_id: form.badge_id || null,
        quest_id: form.quest_id || null,
      };
      if (editingRank) {
        await updateRankLog(editingRank.id, payload);
      } else {
        await createRankLog(payload);
      }
      setForm(emptyForm);
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
    setForm({
      rank_name: rank.rank_name || rank.name || '',
      name_en: rank.name_en || '',
      name_id: rank.name_id || '',
      description_en: rank.description_en || '',
      description_id: rank.description_id || '',
      milestone_id: rank.milestone_id || '',
      badge_id: rank.badge_id || '',
      quest_id: rank.quest_id || '',
    });
    setError(null);
    setFormOpen(true);
  };

  const cancelForm = () => {
    setEditingRank(null);
    setForm(emptyForm);
    setFormOpen(false);
  };

  const removeRank = async (rank) => {
    if (!rank.id) return;
    const result = await Swal.fire({
      title: t('deleteRankConfirm', { name: rank.name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('delete'),
      cancelButtonText: t('cancel'),
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8'
    });
    if (!result.isConfirmed) return;

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
        <button onClick={() => { setEditingRank(null); setForm(emptyForm); setFormOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addRank')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={saveRank} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>

          <div className="border-t pt-3">
            <p className="text-[11px] text-gray-400 mb-2">{t('bilingualNote')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('nameIndonesian')}</span>
                <input value={form.name_id} onChange={(e) => setForm({ ...form, name_id: e.target.value })} placeholder={t('rankName')} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('nameEnglish')}</span>
                <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder={t('rankName')} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('descIndonesian')}</span>
                <textarea value={form.description_id} onChange={(e) => setForm({ ...form, description_id: e.target.value })} placeholder={t('rankDescription')} rows={2} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('descEnglish')}</span>
                <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder={t('rankDescription')} rows={2} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">{t('requires')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400">{t('requirementMilestone')}</span>
                <select value={form.milestone_id} onChange={(e) => setForm({ ...form, milestone_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">{t('noRequirement')}</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.display_name || m.name} ({m.target} CU)</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400">{t('requirementBadge')}</span>
                <select value={form.badge_id} onChange={(e) => setForm({ ...form, badge_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">{t('noRequirement')}</option>
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>{b.display_name || b.name} ({b.requirement_value} CU)</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400">{t('requirementQuest')}</span>
                <select value={form.quest_id} onChange={(e) => setForm({ ...form, quest_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">{t('noRequirement')}</option>
                  {quests.map((q) => (
                    <option key={q.id} value={q.id}>{q.display_name || q.name} ({q.requirement_value} CU)</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button disabled={saving} className="rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 px-5 py-2">{saving ? t('saving') : editingRank ? t('update') : t('createRank')}</button>
            <button type="button" onClick={cancelForm} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
          </div>
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
