import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user && user.isOnboarded) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Invalid email credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    // Simulate reset link emission
    setTimeout(() => {
      setForgotSuccess(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative">
      {/* Decorative Glow Particles */}
      <div className="bg-glow-purple top-1/4 left-1/4"></div>
      <div className="bg-glow-green bottom-1/4 right-1/4"></div>

      <Link to="/" className="flex items-center space-x-2 mb-8 z-10">
        <GraduationCap className="w-9 h-9 text-indigo-500" />
        <span className="font-extrabold text-2xl tracking-tight">CampusPrep <span className="text-indigo-400">Hub</span></span>
      </Link>

      <div className="w-full max-w-md glass-card p-8 rounded-2xl z-10 relative">
        {!showForgot ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-100">Welcome Back</h2>
              <p className="text-slate-400 text-sm mt-1">Sign in to resume your placement prep</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@college.edu"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 px-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-indigo-650 disabled:cursor-not-allowed font-bold rounded-xl text-sm transition-all duration-200 mt-6 shadow-md shadow-indigo-650/15"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Login Assist */}
            <div className="mt-5 p-3 rounded-xl bg-slate-900/40 border border-slate-850 text-center">
              <span className="text-[11px] text-slate-400">
                Quick Demo: <button onClick={() => { setEmail('student@college.edu'); setPassword('password123'); }} className="text-indigo-400 hover:underline font-bold">student@college.edu / password123</button>
              </span>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:underline font-bold">
                Register Free
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-100">Reset Password</h2>
              <p className="text-slate-400 text-sm mt-1">We will send you a simulated link to reset your password</p>
            </div>

            {forgotSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-emerald-400 text-sm">Simulated Recovery Email Sent</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  An email has been dispatched to <span className="font-bold text-slate-200">{forgotEmail}</span> with standard password recovery links.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSuccess(false); setForgotEmail(''); }}
                  className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-slate-850 transition-all"
                >
                  Back to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. student@college.edu"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-indigo-700 font-bold rounded-xl text-sm transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setError(''); }}
                  className="w-full py-2.5 bg-transparent text-xs text-slate-400 hover:text-slate-250 font-bold mt-2"
                >
                  Cancel and Back
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
