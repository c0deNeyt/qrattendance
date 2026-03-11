import { useState } from 'react';
import { regenerateQr } from '../services/api';
import { Alert, Spinner } from '../components/UI';
import QrDisplay from '../components/QrDisplay';

export default function RegeneratePage() {
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [result,  setResult]  = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contact.trim()) return setError('Enter email or mobile');
    setLoading(true);
    try {
      const { data } = await regenerateQr(contact.trim());
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
            🔄 QR Recovery
          </div>
          <h1 className="font-display text-4xl font-bold text-gray-900 leading-tight">
            Recover Your<br />QR Code
          </h1>
          <p className="text-gray-500 mt-3">Lost your QR? Enter your email or mobile to get a new one</p>
        </div>

        {!result ? (
          <div className="card-lg animate-fade-up delay-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="input-label">Email or Mobile Number</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com or +63 912…"
                  className="input"
                  autoFocus
                />
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Spinner size="sm" /> Searching…</> : 'Find My QR Code'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card-lg animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">✅</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-1">Here's your new QR!</h2>
            <p className="text-gray-500 text-sm mb-8">Previous QR code has been invalidated</p>
            <QrDisplay
              qrDataUrl={result.qr_code_url}
              userName={result.full_name}
              scanUrl={result.scan_url}
            />
            <button onClick={() => { setResult(null); setContact(''); }} className="btn-ghost mt-6 text-sm">
              ← Search another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
