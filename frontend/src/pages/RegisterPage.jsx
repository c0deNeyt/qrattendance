import { useState } from 'react';
import { registerUser } from '../services/api';
import { Alert, Spinner } from '../components/UI';
import QrDisplay from '../components/QrDisplay';

export default function RegisterPage() {
  const [form, setForm]       = useState({ full_name: '', email: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.full_name.trim()) return setError('Full name is required');
    if (!form.email.trim() && !form.mobile.trim()) return setError('Provide email or mobile');

    setLoading(true);
    try {
      const { data } = await registerUser({
        full_name: form.full_name.trim(),
        email:  form.email.trim()  || undefined,
        mobile: form.mobile.trim() || undefined,
      });
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="card-lg text-center animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold mb-1">You're registered!</h2>
            <p className="text-gray-500 text-sm mb-8">Here's your personal QR attendance code</p>
            <QrDisplay
              qrDataUrl={result.qr_code_url}
              userName={result.full_name}
              scanUrl={result.scan_url}
            />
            <button
              onClick={() => { setResult(null); setForm({ full_name: '', email: '', mobile: '' }); }}
              className="btn-ghost mt-6 text-sm"
            >
              Register another user
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            Attendance System
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 leading-tight">
            Register & Get<br />Your QR Code
          </h1>
          <p className="text-gray-500 mt-3">One-time registration for daily attendance tracking</p>
        </div>

        <div className="card-lg animate-fade-up delay-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g. Juan dela Cruz"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="+63 912 345 6789"
                  className="input"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400">Provide at least one: email or mobile number</p>

            {error && <Alert type="error">{error}</Alert>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Spinner size="sm" /> Registering…</> : 'Register & Generate QR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
