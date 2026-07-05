import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Edit2, Lock, Plus, Target, Trash2, X } from 'lucide-react';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createMilestone, deleteMilestone, getMilestones, updateMilestone } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const emptyForm = {
  name: '', name_en: '', name_id: '',
  description: '', description_en: '', description_id: '',
  target_value: '',
};

export default function AdminMilestones() {
  const { t } = useAdminLanguage();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMilestones();
      setMilestones(res.data?.milestones || res.data || []);
    } catch {
      setMilestones([]);
      setError(t('fetchMilestonesError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openForm = (milestone = null) => {
    setEditing(milestone);
    setForm(milestone ? {
      name: milestone.name || '',
      name_en: milestone.name_en || '',
      name_id: milestone.name_id || '',
      description: milestone.description || '',
      description_en: milestone.description_en || '',
      description_id: milestone.description_id || '',
      target_value: milestone.target || milestone.target_value || '',
    } : emptyForm);
    setFormOpen(true);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateMilestone(editing.id, form);
      else await createMilestone(form);
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('saveMilestoneError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteMilestone(id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addMilestone')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            <input required type="number" min="0" placeholder={t('targetJourneyPoints')} value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            <input required placeholder={t('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-2" />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">🇮🇩 {t('bahasaIndonesia')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('name')}</span>
                <input value={form.name_id} onChange={(e) => setForm({ ...form, name_id: e.target.value })} placeholder={t('name')} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('description')}</span>
                <textarea value={form.description_id} onChange={(e) => setForm({ ...form, description_id: e.target.value })} placeholder={t('description')} rows={2} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">🇬🇧 {t('bahasaInggris')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('name')}</span>
                <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder={t('name')} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">{t('description')}</span>
                <textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} placeholder={t('description')} rows={2} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button disabled={saving} className="flex-1 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">{saving ? t('saving') : editing ? t('update') : t('create')}</button>
            <button type="button" onClick={closeForm} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {loading ? <CardSkeleton count={6} /> : error ? <ErrorState message={error} onRetry={fetchData} /> : !milestones.length ? (
        <EmptyState title={t('noMilestones')} description={t('noMilestonesDesc')} icon={Target} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {milestones.map((m, i) => (
            <div key={m.id || i} className={`rounded-2xl border p-5 transition-all hover:shadow-md ${m.achieved ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.achieved ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {m.achieved ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{m.display_name || m.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => openForm(m)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{m.display_description || m.description || t('completeThisMilestone')}</p>
                  <p className="text-xs text-gray-400 mt-2">{t('target')}: {m.target || m.target_value || 0} {t('journeyPoints')} · {t('achievedBy')} {m.achieved_count || 0} {t('users')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
