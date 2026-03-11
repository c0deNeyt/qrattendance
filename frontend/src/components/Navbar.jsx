import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';

export default function Navbar() {
  const { isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/',            label: 'Register' },
    { to: '/regenerate',  label: 'Get QR' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-gray-900">QR<span className="text-brand-600">Attend</span></span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`btn-ghost text-sm ${pathname === to ? 'text-brand-600 bg-brand-50' : ''}`}
            >
              {label}
            </Link>
          ))}

          {isAdmin ? (
            <>
              <Link to="/admin" className={`btn-ghost text-sm ${pathname.startsWith('/admin') ? 'text-brand-600 bg-brand-50' : ''}`}>
                Dashboard
              </Link>
              <button onClick={signOut} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="btn-primary text-sm py-2 px-4">
              Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
