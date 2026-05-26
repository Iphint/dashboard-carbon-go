import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Leaf, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Check your admin username and password.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl shadow-xl shadow-emerald-100/60 p-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 mb-5">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-950">Carbon-Go Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in with an admin account to monitor frontend and backend activity.</p>

        <form className="mt-7 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</span>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm"
                placeholder="admin"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</span>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm"
                placeholder="admin password"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-3 transition-colors cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>
      </section>
    </main>
  );
}
