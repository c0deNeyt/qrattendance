import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import Navbar from './components/Navbar';
import RegisterPage    from './pages/RegisterPage';
import RegeneratePage  from './pages/RegeneratePage';
import ScanResultPage  from './pages/ScanResultPage';
import AdminLoginPage  from './pages/AdminLoginPage';
import AdminDashboard  from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public pages with navbar */}
          <Route path="/" element={<><Navbar /><RegisterPage /></>} />
          <Route path="/regenerate" element={<><Navbar /><RegeneratePage /></>} />

          {/* Scan result — no navbar (fullscreen) */}
          <Route path="/scan/:uuid/:token" element={<ScanResultPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin"       element={<><Navbar /><AdminDashboard /></>} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
              <p className="text-6xl mb-4">🔍</p>
              <h1 className="font-display text-3xl font-bold mb-2">Page not found</h1>
              <a href="/" className="btn-primary mt-6">Go home</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
