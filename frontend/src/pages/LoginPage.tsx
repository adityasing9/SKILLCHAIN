import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DEMO_USERS } from '../services/mockStore';
import { ThemeSelector } from '../components/ThemeSelector';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Building2, GraduationCap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex@student.edu');
  const [password, setPassword] = useState('alex123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Check offline demo accounts
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (!isLocalhost && DEMO_USERS[cleanEmail]) {
      const demo = DEMO_USERS[cleanEmail];
      login(demo.token, demo.user);
      if (demo.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (demo.user.role === 'INSTITUTION') {
        navigate('/institution/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
      setLoading(false);
      return;
    }

    // Attempt API
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      login(res.data.access_token, res.data.user);

      if (res.data.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (res.data.user.role === 'INSTITUTION') {
        navigate('/institution/dashboard');
      } else if (res.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
      return;
    } catch {
      // Backend offline fallback
      const demo = DEMO_USERS[cleanEmail];
      if (demo) {
        login(demo.token, demo.user);
        if (demo.user.role === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (demo.user.role === 'INSTITUTION') {
          navigate('/institution/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
        setLoading(false);
        return;
      }

      const customUserStr = localStorage.getItem(`registered_${cleanEmail}`);
      if (customUserStr) {
        try {
          const customUser = JSON.parse(customUserStr);
          login('custom-mock-jwt', customUser);
          navigate(customUser.role === 'STUDENT' ? '/student/dashboard' : '/institution/dashboard');
          setLoading(false);
          return;
        } catch {
          // ignore
        }
      }
    }

    setError('Invalid login. Click one of the demo profiles to sign in.');
    setLoading(false);
  };

  const selectDemoProfile = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    const demo = DEMO_USERS[demoEmail];
    if (demo) {
      login(demo.token, demo.user);
      if (demo.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (demo.user.role === 'INSTITUTION') {
        navigate('/institution/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center p-4 transition-colors duration-200">
      
      {/* Top Bar with Home Link & Theme Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-1">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          &larr; Back to Home
        </Link>
        <ThemeSelector />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs transition-colors">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-theme-primary flex items-center justify-center text-white shadow-xs transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SkillChain</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a demo role or enter your credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Fast Profile Switcher */}
        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick 1-Click Demo Profiles:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectDemoProfile('alex@student.edu', 'alex123')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:border-theme-primary text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                <GraduationCap className="w-4 h-4 text-theme-primary" />
                Student
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Alex R.</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('apex@skillchain.edu', 'apex123')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:border-theme-primary text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                <Building2 className="w-4 h-4 text-theme-primary" />
                Issuer
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Apex Tech</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('admin@skillchain.edu', 'admin123')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:border-blue-500 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white mb-0.5">
                <Shield className="w-4 h-4 text-blue-500" />
                Admin
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Audit</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-theme-primary"
                placeholder="name@domain.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-theme-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme-primary hover:bg-theme-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer shadow-xs"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          New to SkillChain?{' '}
          <Link to="/register" className="text-theme-primary hover:underline font-semibold">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
