import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../services/auth';
import { Alert, Spinner } from '../components/UI';

/* ── Animated success screen shown after login ── */
function LoginSuccess({ adminName }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 2000;
    const raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      setProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed < duration) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f2027 0%, #1a3a2a 50%, #0f3020 100%)' }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Ripple circle */}
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
              style={{
                animation: 'ripple 2s ease-out infinite',
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 z-10">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              style={{ animation: 'checkDraw 0.6s ease forwards 0.2s', opacity: 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-2"
           style={{ animation: 'fadeUp 0.4s ease forwards 0.4s', opacity: 0 }}>
          Authentication successful
        </p>
        <h1
          className="font-display text-3xl font-bold text-white mb-1"
          style={{ animation: 'fadeUp 0.4s ease forwards 0.5s', opacity: 0 }}
        >
          Welcome back,
        </h1>
        <h2
          className="font-display text-2xl font-bold text-emerald-400 mb-8"
          style={{ animation: 'fadeUp 0.4s ease forwards 0.6s', opacity: 0 }}
        >
          {adminName}
        </h2>

        {/* Progress bar */}
        <div
          className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden"
          style={{ animation: 'fadeUp 0.4s ease forwards 0.7s', opacity: 0 }}
        >
          <div
            className="h-full bg-emerald-400 rounded-full transition-all"
            style={{ width: `${progress}%`, transition: 'width 0.05s linear' }}
          />
        </div>
        <p className="text-white/30 text-xs mt-3"
           style={{ animation: 'fadeUp 0.4s ease forwards 0.8s', opacity: 0 }}>
          Redirecting to dashboard…
        </p>

        <style>{`
          @keyframes ripple {
            0%   { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes checkDraw {
            from { opacity: 0; transform: scale(0.5); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(null); // null | { adminName }

  // Navigate to dashboard after success screen
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate('/admin'), 2200);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form.email, form.password);
      signIn(data.token, data.user);
      setSuccess({ adminName: data.user.full_name });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* Show success screen while the 2-second redirect timer runs */
  if (success) return <LoginSuccess adminName={success.adminName} />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-600/30">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-white/50 text-sm mt-1">QR Attendance System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                className="input bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-white/40"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:ring-white/40"
              />
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl py-3 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Spinner size="sm" className="text-white" /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Default: admin@qrattend.local / Admin@1234
        </p>
      </div>
    </div>
  );
}
