import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  LayoutDashboard, 
  Brain, 
  Code, 
  FileText, 
  Building2, 
  Mic, 
  Briefcase, 
  User,
  Users, 
  LogOut, 
  GraduationCap, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

// Import Pages (will create next)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AptitudePrep from './pages/AptitudePrep';
import TechnicalPrep from './pages/TechnicalPrep';
import MockTest from './pages/MockTest';
import CompanyHub from './pages/CompanyHub';
import InterviewSimulator from './pages/InterviewSimulator';
import PlacementHub from './pages/PlacementHub';
import Profile from './pages/Profile';
import HRPrep from './pages/HRPrep';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium animate-pulse">Initializing Placement Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarded && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Sidebar Layout for Authenticated & Onboarded Users
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Aptitude Prep', path: '/aptitude', icon: Brain },
    { name: 'Technical Prep', path: '/technical', icon: Code },
    { name: 'HR Prep', path: '/hr-prep', icon: Users },
    { name: 'Mock Tests', path: '/mock-tests', icon: FileText },
    { name: 'Company Hub', path: '/companies', icon: Building2 },
    { name: 'AI Interview', path: '/interview', icon: Mic },
    { name: 'Placement Hub', path: '/placements', icon: Briefcase },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-nav border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-indigo-500" />
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">CampusPrep <span className="text-indigo-400">Hub</span></h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest flex items-center">
              <Sparkles className="w-3 h-3 text-indigo-400 mr-1 animate-pulse" /> AI Powered
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-900/40 border border-slate-800 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white uppercase text-sm">
              {user?.profile?.fullName?.substring(0, 2) || user?.email?.substring(0, 2) || 'ST'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.profile?.fullName || 'Student'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-rose-950/20 hover:text-rose-400 text-slate-400 border border-slate-850 hover:border-rose-500/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 glass-nav">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-7 h-7 text-indigo-500" />
            <span className="font-bold text-base">CampusPrep Hub</span>
          </div>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md pt-20 px-6">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-xl ${
                      isActive 
                        ? 'bg-indigo-600/30 text-indigo-400 font-bold' 
                        : 'text-slate-350 hover:text-white'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-lg">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="flex items-center space-x-4 px-4 py-3 text-rose-400 rounded-xl"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Log Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

// Routing Wrapper
const Routing = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Pages that DO NOT get the Sidebar Layout
  const noLayoutPaths = ['/', '/login', '/register', '/onboarding'];
  const showLayout = user && user.isOnboarded && !noLayoutPaths.includes(location.pathname) && !location.pathname.startsWith('/mock-tests/arena');

  const pageContent = (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Onboarding Protected Route */}
      <Route path="/onboarding" element={
        <ProtectedRoute requireOnboarded={false}>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* General Dashboards Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/aptitude" element={
        <ProtectedRoute>
          <AptitudePrep />
        </ProtectedRoute>
      } />
      <Route path="/technical" element={
        <ProtectedRoute>
          <TechnicalPrep />
        </ProtectedRoute>
      } />
      <Route path="/hr-prep" element={
        <ProtectedRoute>
          <HRPrep />
        </ProtectedRoute>
      } />
      
      {/* Mock Tests routes */}
      <Route path="/mock-tests/*" element={
        <ProtectedRoute>
          <MockTest />
        </ProtectedRoute>
      } />
      
      <Route path="/companies" element={
        <ProtectedRoute>
          <CompanyHub />
        </ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute>
          <InterviewSimulator />
        </ProtectedRoute>
      } />
      <Route path="/placements" element={
        <ProtectedRoute>
          <PlacementHub />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      {/* Redirect fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  if (showLayout) {
    return <MainLayout>{pageContent}</MainLayout>;
  }

  return pageContent;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </Router>
  );
}

export default App;
