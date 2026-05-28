import { useState, useEffect, useCallback } from 'react';
import { Award, Calendar, Edit2, Lock, Plus, Trash2, X } from 'lucide-react';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createEcoBadge, deleteEcoBadge, getEcoBadges, updateEcoBadge } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const emptyForm = { name: '', description: '', icon: '🌿', requirement_type: 'carbon_points', requirement_value: '' };

export default function AdminEcoBadges() {
  const { t } = useAdminLanguage();
  const [badges, setBadges] = useState([]);
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
      const res = await getEcoBadges();
      setBadges(res.data?.badges || res.data || []);
    } catch {
      setBadges([]);
      setError(t('fetchEcoBadgesError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openForm = (badge = null) => {
    setEditing(badge);
    setForm(badge ? {
      name: badge.name || '',
      description: badge.description || '',
      icon: badge.icon || '🌿',
      requirement_type: badge.requirement_type || 'carbon_points',
      requirement_value: badge.requirement_value || String(badge.requirement || '').replace(/\D/g, ''),
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
      if (editing) await updateEcoBadge(editing.id, form);
      else await createEcoBadge(form);
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('saveEcoBadgeError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteEcoBadge(id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addEcoBadge')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3">
          <input required placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-2" />
          <input required placeholder={t('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-2" />
          <input required placeholder={t('icon')} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required type="number" min="0" placeholder="CU" value={form.requirement_value} onChange={(e) => setForm({ ...form, requirement_value: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <div className="flex gap-2 md:col-span-6">
            <button disabled={saving} className="rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 px-5 py-2">{saving ? t('saving') : editing ? t('updateBadge') : t('createBadge')}</button>
            <button type="button" onClick={closeForm} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {loading ? <CardSkeleton count={8} /> : error ? <ErrorState message={error} onRetry={fetchData} /> : !badges.length ? (
        <EmptyState title={t('noEcoBadges')} description={t('noEcoBadgesDesc')} icon={Award} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {badges.map((b, i) => (
            <div key={b.id || i} className={`rounded-2xl border p-5 text-center transition-all hover:shadow-md ${b.achieved ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex justify-end gap-1 mb-1">
                <button onClick={() => openForm(b)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(b.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${b.achieved ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {b.achieved ? <span className="text-2xl">{b.icon || '🏅'}</span> : <Lock className="w-7 h-7" />}
              </div>
              <h3 className={`font-semibold text-sm ${b.achieved ? 'text-amber-800' : 'text-gray-600'}`}>{b.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{b.requirement || t('meetRequirements')}</p>
              <p className="text-[11px] text-gray-400 mt-1">{t('earnedBy')} {b.achieved_count || 0} {t('users')}</p>
              {b.achieved && b.achieved_at && (
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-amber-600">
                  <Calendar className="w-3 h-3" />
                  {new Date(b.achieved_at).toLocaleDateString('id-ID')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
