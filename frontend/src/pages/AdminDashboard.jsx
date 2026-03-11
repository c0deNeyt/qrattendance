import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { adminGetAttendance, adminGetUsers, adminGetStats, adminExportCsv } from '../services/api';
import { StatCard, EmptyState, Spinner, Alert } from '../components/UI';

/* ── Mini bar chart ────────────────────────────── */
function BarChart({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-3">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full rounded-t-md bg-brand-500 group-hover:bg-brand-600 transition-all relative"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: '4px' }}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {d.count}
            </span>
          </div>
          <span className="text-[9px] text-gray-400 font-mono">
            {new Date(d.scan_date).toLocaleDateString('en', { weekday: 'short' })}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Tab ────────────────────────────────────────── */
function Tab({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
        active ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50'
      }`}
    >
      {label} {count != null && <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 ${active ? 'bg-white/20' : 'bg-gray-100'}`}>{count}</span>}
    </button>
  );
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const [tab,        setTab]       = useState('attendance');
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState('');
  const [exporting,  setExporting] = useState(false);

  // Attendance state
  const [records,   setRecords]   = useState([]);
  const [attTotal,  setAttTotal]  = useState(0);
  const [attFilter, setAttFilter] = useState({ search: '', date: '' });
  const [stats,     setStats]     = useState(null);

  // Users state
  const [users,     setUsers]     = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch,setUserSearch]= useState('');

  const fetchAttendance = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await adminGetAttendance({ ...attFilter, limit: 100 });
      setRecords(data.data);
      setAttTotal(data.total);
      if (data.stats) setStats(data.stats);
    } catch { setError('Failed to load attendance'); }
    finally { setLoading(false); }
  }, [attFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await adminGetUsers({ search: userSearch, limit: 100 });
      setUsers(data.data);
      setUserTotal(data.total);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  }, [userSearch]);

  useEffect(() => { if (tab === 'attendance') fetchAttendance(); }, [tab, fetchAttendance]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);

  // Also load stats on mount
  useEffect(() => {
    adminGetStats().then(({ data }) => setStats(data.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          onClick={async () => {
            setExporting(true);
            setError('');
            try {
              await adminExportCsv(attFilter);
            } catch {
              setError('CSV export failed. Please try again.');
            } finally {
              setExporting(false);
            }
          }}
          disabled={exporting}
          className="btn-primary gap-2"
        >
          {exporting ? (
            <><Spinner size="sm" /> Exporting…</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </>
          )}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Today"      value={stats?.today}     icon="📅" color="green"  />
        <StatCard label="This Week"  value={stats?.thisWeek}  icon="📊" color="blue"   />
        <StatCard label="This Month" value={stats?.thisMonth} icon="🗓" color="purple" />
        <StatCard label="Total Users" value={userTotal || '…'} icon="👥" color="amber" />
      </div>

      {/* 7-day chart */}
      {stats?.daily?.length > 0 && (
        <div className="card mb-8 animate-fade-up delay-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Last 7 Days</p>
          <BarChart data={stats.daily} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Tab label="Attendance" active={tab === 'attendance'} onClick={() => setTab('attendance')} count={attTotal} />
        <Tab label="Users"      active={tab === 'users'}      onClick={() => setTab('users')}      count={userTotal} />
      </div>

      {/* Filters */}
      {tab === 'attendance' && (
        <div className="flex flex-wrap gap-3 mb-6 animate-fade-up">
          <input
            placeholder="Search name / email…"
            value={attFilter.search}
            onChange={(e) => setAttFilter({ ...attFilter, search: e.target.value })}
            className="input flex-1 min-w-48"
          />
          <input
            type="date"
            value={attFilter.date}
            onChange={(e) => setAttFilter({ ...attFilter, date: e.target.value })}
            className="input w-44"
          />
          <button onClick={fetchAttendance} className="btn-primary px-4 py-2.5">
            Search
          </button>
          {(attFilter.search || attFilter.date) && (
            <button onClick={() => setAttFilter({ search: '', date: '' })} className="btn-ghost text-sm">
              Clear
            </button>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="flex gap-3 mb-6 animate-fade-up">
          <input
            placeholder="Search users…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="input flex-1"
          />
          <button onClick={fetchUsers} className="btn-primary px-4 py-2.5">Search</button>
        </div>
      )}

      {/* Error */}
      {error && <Alert type="error" className="mb-4">{error}</Alert>}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : tab === 'attendance' ? (
        records.length === 0 ? (
          <EmptyState icon="📭" title="No records found" message="Try adjusting your filters" />
        ) : (
          <div className="card overflow-hidden p-0 animate-fade-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 table-head">
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map((r) => (
                    <tr key={r.id} className="table-row transition-colors">
                      <td className="font-medium text-gray-900">{r.full_name}</td>
                      <td className="font-mono text-xs text-gray-500">{r.email || r.mobile}</td>
                      <td>{new Date(r.scan_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="font-mono">{r.scan_time}</td>
                      <td className="font-mono text-xs text-gray-400">{r.ip_address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {records.length} of {attTotal} records
            </div>
          </div>
        )
      ) : (
        users.length === 0 ? (
          <EmptyState icon="👤" title="No users found" />
        ) : (
          <div className="card overflow-hidden p-0 animate-fade-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 table-head">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="table-row transition-colors">
                      <td className="font-medium text-gray-900">{u.full_name}</td>
                      <td className="font-mono text-xs text-gray-500">{u.email || '—'}</td>
                      <td className="font-mono text-xs text-gray-500">{u.mobile || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400">
                        {new Date(u.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {users.length} of {userTotal} users
            </div>
          </div>
        )
      )}
    </div>
  );
}
