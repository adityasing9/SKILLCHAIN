import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DEMO_USERS } from '../services/mockStore';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">SkillChain</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="text-xs text-slate-500 mt-1">Select a demo role or enter your credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Fast Profile Switcher */}
        <div className="mb-6 pb-6 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Quick 1-Click Demo Profiles:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectDemoProfile('alex@student.edu', 'alex123')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                Student
              </div>
              <p className="text-[10px] text-slate-500">Alex R.</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('apex@skillchain.edu', 'apex123')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Issuer
              </div>
              <p className="text-[10px] text-slate-500">Apex Tech</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('admin@skillchain.edu', 'admin123')}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-blue-500 hover:bg-blue-50/50 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                <Shield className="w-4 h-4 text-blue-600" />
                Admin
              </div>
              <p className="text-[10px] text-slate-500">Audit</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="name@domain.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer shadow-xs"
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

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          New to SkillChain?{' '}
          <Link to="/register" className="text-emerald-600 hover:underline font-medium">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
