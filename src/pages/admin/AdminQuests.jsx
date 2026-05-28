import { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle2, Edit2, Plus, Sword, Trash2, X } from 'lucide-react';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import { createQuest, deleteQuest, getQuests, updateQuest } from '../../services/adminApi';
import { useAdminLanguage } from '../../context/LanguageContext';

const emptyForm = {
  slug: '',
  icon: '🌱',
  name: '',
  description: '',
  requirement_value: '',
  reward: 25,
  is_active: true,
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminQuests() {
  const { t } = useAdminLanguage();
  const [quests, setQuests] = useState([]);
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
      const res = await getQuests();
      setQuests(res.data?.quests || res.data || []);
    } catch {
      setQuests([]);
      setError(t('fetchQuestsError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openForm = (quest = null) => {
    setEditing(quest);
    setForm(quest ? {
      slug: quest.slug || slugify(quest.name || ''),
      icon: quest.icon || '🌱',
      name: quest.name || '',
      description: quest.description || '',
      requirement_value: quest.requirement_value || quest.target || '',
      reward: quest.reward || 25,
      is_active: quest.is_active !== 0,
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
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (editing) await updateQuest(editing.id, payload);
      else await createQuest(payload);
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || t('saveQuestError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteQuest(id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openForm()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('addQuest')}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3">
          <input required placeholder={t('name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || slugify(e.target.value) })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-2" />
          <input required placeholder={t('slug')} value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required placeholder={t('icon')} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required type="number" min="0" placeholder={t('targetCu')} value={form.requirement_value} onChange={(e) => setForm({ ...form, requirement_value: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required type="number" min="0" placeholder={t('reward')} value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required placeholder={t('description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-5" />
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            {t('active')}
          </label>
          <div className="flex gap-2 md:col-span-6">
            <button disabled={saving} className="rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60 px-5 py-2">{saving ? t('saving') : editing ? t('updateQuest') : t('createQuest')}</button>
            <button type="button" onClick={closeForm} className="px-3 rounded-xl bg-gray-100 text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      {loading ? <CardSkeleton count={6} /> : error ? <ErrorState message={error} onRetry={fetchData} /> : !quests.length ? (
        <EmptyState title={t('noQuests')} description={t('noQuestsDesc')} icon={Sword} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quests.map((q, i) => {
            const completed = q.completed;
            const active = q.active;
            return (
              <div key={q.id || i} className={`rounded-2xl border p-5 transition-all hover:shadow-md ${
                completed ? 'border-emerald-200 bg-emerald-50/30' :
                active ? 'border-blue-200 bg-blue-50/30' :
                'border-gray-100 bg-white'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    completed ? 'bg-emerald-500 text-white' :
                    active ? 'bg-blue-500 text-white' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xl">{q.icon || '🌱'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{q.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => openForm(q)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => remove(q.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{q.description || t('completeThisQuest')}</p>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${active ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${Math.min((q.progress / (q.target || 100)) * 100, 100)}%` }} />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{q.progress}/{q.target || 100} CU · {t('reward')} {q.reward || 0}</p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-1">
                        {t('achievedBy')} {q.achieved_count || 0} {t('users')}
                      </p>
                    </div>
                    {completed && q.completed_at && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(q.completed_at).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
