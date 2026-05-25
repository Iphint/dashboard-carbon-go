import { useState, useEffect, useCallback } from 'react';
import { Calendar, Edit2, Leaf, Plus, Trash2, X } from 'lucide-react';
import { CardSkeleton } from '../../components/admin/LoadingSkeleton';
import ErrorState from '../../components/admin/ErrorState';
import EmptyState from '../../components/admin/EmptyState';
import {
  createCustomGreenAction,
  deleteCustomGreenAction,
  getCustomGreenActions,
  updateCustomGreenAction,
} from '../../services/adminApi';

const emptyForm = { user_id: '', name: '', description: '' };

export default function AdminCustomGreenActions() {
  const [actions, setActions] = useState([]);
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
      const res = await getCustomGreenActions();
      setActions(res.data?.actions || res.data || []);
    } catch {
      setActions([]);
      setError('Unable to fetch custom green actions. Make sure the API is connected.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (action) => {
    setEditing(action);
    setForm({
      user_id: action.user_id || '',
      name: action.name || '',
      description: action.description || '',
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCustomGreenAction(editing.id, form);
      } else {
        await createCustomGreenAction(form);
      }
      closeForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save custom green action.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await deleteCustomGreenAction(id);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Add Custom Action
        </button>
      </div>

      {formOpen && (
        <form onSubmit={save} className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
          <input required type="number" min="1" placeholder="User ID" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <input required placeholder="Action name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm md:col-span-1" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <div className="flex gap-2">
            <button disabled={saving} className="flex-1 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={closeForm} className="px-3 rounded-xl bg-gray-100 text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {loading ? <CardSkeleton count={6} /> : error ? <ErrorState message={error} onRetry={fetchData} /> : !actions.length ? (
        <EmptyState title="No Custom Green Actions" description="No custom green actions have been created yet." icon={Leaf} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {actions.map((action, i) => (
            <div key={action.id || i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{action.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(action)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(action.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{action.description || '—'}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-100 text-blue-700">
                      User #{action.user_id}
                    </span>
                    <span className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-700">
                      0 pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {action.created_at ? new Date(action.created_at).toLocaleDateString('id-ID') : '—'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
