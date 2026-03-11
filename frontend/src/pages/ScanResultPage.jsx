import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { scanQr } from '../services/api';

/* ── Animated icons ──────────────────────────────────────────── */
function CheckAnim() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto mb-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
          style={{ animation: 'ripple 2.4s ease-out infinite', animationDelay: `${i * 0.6}s` }}
        />
      ))}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-400/40 z-10">
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards 0.3s', opacity: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

function WarningAnim() {
  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-400/40"
      style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards', opacity: 0 }}>
      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
  );
}

function ErrorAnim() {
  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-400/40"
      style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards', opacity: 0 }}>
      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  );
}

/* ── Shared keyframes injected once ─────────────────────────── */
const GLOBAL_STYLES = `
  @keyframes ripple {
    0%   { transform: scale(0.85); opacity: 0.9; }
    100% { transform: scale(2.4);  opacity: 0; }
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.4) rotate(-10deg); }
    to   { opacity: 1; transform: scale(1)   rotate(0deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  @keyframes floatUp {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-60px) scale(1.4); }
  }
`;

/* ── Attendance success full-screen redirect page ───────────── */
function AttendanceSuccess({ data, redirectUrl }) {
  const [countdown, setCountdown] = useState(redirectUrl ? 4 : null);
  const [particles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      delay: Math.random() * 1.2,
      size: 6 + Math.random() * 8,
      color: ['#34d399','#6ee7b7','#a7f3d0','#fbbf24','#60a5fa'][i % 5],
    }))
  );

  useEffect(() => {
    if (!redirectUrl) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); window.location.href = redirectUrl; return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [redirectUrl]);

  const formattedDate = data?.scan_date
    ? new Date(data.scan_date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%)' }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            bottom: '20%',
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `floatUp 2.5s ease-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center">

          <CheckAnim />

          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 mb-4"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.5s', opacity: 0 }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold tracking-wide uppercase">Attendance Recorded</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-1"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.6s', opacity: 0 }}>
            Present!
          </h1>
          <p className="text-emerald-300 text-lg font-semibold mb-6"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.7s', opacity: 0 }}>
            {data?.full_name}
          </p>

          {/* Info pills */}
          <div className="flex justify-center gap-3 mb-8"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.8s', opacity: 0 }}>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white text-xs font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white text-xs font-mono font-medium">{data?.scan_time}</span>
            </div>
          </div>

          {/* Redirect bar */}
          {redirectUrl ? (
            <div style={{ animation: 'fadeUp 0.4s ease forwards 0.9s', opacity: 0 }}>
              <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden mb-2">
                <div className="h-full bg-emerald-400 rounded-full"
                  style={{ animation: `progressFill ${countdown === 4 ? 4 : 0}s linear forwards` }} />
              </div>
              <p className="text-emerald-300/70 text-xs">
                Redirecting in <span className="font-bold text-emerald-300">{countdown}s</span>
                {' · '}
                <a href={redirectUrl} className="underline underline-offset-2 hover:text-white transition-colors">
                  Go now
                </a>
              </p>
            </div>
          ) : (
            <p className="text-white/30 text-xs"
              style={{ animation: 'fadeUp 0.4s ease forwards 0.9s', opacity: 0 }}>
              You may close this page
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Already checked in page ────────────────────────────────── */
function AlreadyCheckedIn({ data }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #78350f 0%, #92400e 50%, #b45309 100%)' }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <WarningAnim />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 mb-4"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.3s', opacity: 0 }}>
            <span className="text-amber-300 text-xs font-semibold tracking-wide uppercase">Already Checked In</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.4s', opacity: 0 }}>
            Duplicate Scan
          </h1>
          <p className="text-amber-200/80 text-sm leading-relaxed"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.5s', opacity: 0 }}>
            <span className="font-semibold text-white">{data?.full_name}</span>, your attendance for{' '}
            <span className="font-semibold text-amber-300">{data?.scan_date}</span> was already recorded earlier today.
          </p>
          <p className="text-white/30 text-xs mt-6"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.6s', opacity: 0 }}>
            You may close this page
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Error / invalid page ───────────────────────────────────── */
function ScanError({ state }) {
  const copy = {
    invalid: { title: 'Invalid QR Code',  sub: 'This QR code is not recognised. Please request a new one.' },
    expired: { title: 'QR Code Expired',  sub: 'This QR code has expired. Regenerate it below.' },
    error:   { title: 'Something Wrong',  sub: 'An unexpected error occurred. Please try again.' },
  }[state] || { title: 'Error', sub: 'Please try again.' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)' }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 text-center">
          <ErrorAnim />
          <h1 className="font-display text-3xl font-bold text-white mb-2"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.3s', opacity: 0 }}>
            {copy.title}
          </h1>
          <p className="text-red-200/80 text-sm leading-relaxed mb-8"
            style={{ animation: 'fadeUp 0.4s ease forwards 0.4s', opacity: 0 }}>
            {copy.sub}
          </p>
          {(state === 'invalid' || state === 'expired') && (
            <a href="/regenerate"
              className="inline-flex items-center gap-2 bg-white text-red-700 font-semibold rounded-xl px-5 py-3 hover:bg-red-50 transition-colors"
              style={{ animation: 'fadeUp 0.4s ease forwards 0.5s', opacity: 0 }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate QR Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Loading screen ─────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #1a1a2e 100%)' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-200/20 border-t-brand-400 animate-spin mx-auto mb-4" />
        <p className="text-white/50 text-sm font-medium">Verifying QR Code…</p>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function ScanResultPage() {
  const { uuid, token }    = useParams();
  const [searchParams]     = useSearchParams();
  const redirectUrl        = searchParams.get('redirect');

  const [state, setState]  = useState('loading');
  const [data,  setData]   = useState(null);

  useEffect(() => {
    scanQr(uuid, token, redirectUrl)
      .then(({ data: res }) => { setState(res.status); setData(res.data); })
      .catch((err)          => { setState(err.response?.data?.status || 'error'); });
  }, [uuid, token]);

  if (state === 'loading')           return <LoadingScreen />;
  if (state === 'checked_in')        return <AttendanceSuccess data={data} redirectUrl={redirectUrl} />;
  if (state === 'already_checked_in')return <AlreadyCheckedIn data={data} />;
  return <ScanError state={state} />;
}
