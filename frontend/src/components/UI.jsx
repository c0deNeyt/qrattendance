// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return (
    <svg className={`animate-spin text-brand-600 ${sz} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path  className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

// ── Alert ─────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const styles = {
    info:    'bg-blue-50  border-blue-200  text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error:   'bg-red-50   border-red-200   text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue:  'bg-blue-50  text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple:'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card flex items-center gap-4 animate-fade-up">
      <div className={`rounded-2xl p-3 text-2xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-display font-bold text-gray-900">{value ?? '—'}</p>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="font-display font-bold text-gray-700 text-lg">{title}</p>
      {message && <p className="text-sm text-gray-400 mt-1">{message}</p>}
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
