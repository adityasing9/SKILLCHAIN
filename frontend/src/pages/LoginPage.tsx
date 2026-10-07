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

    // Check demo accounts first if on web / demo mode
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

    // Try backend API
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

    setError('Invalid login. Please click one of the demo profiles above.');
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
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161b22] rounded-lg border border-[#30363d] p-6 shadow-sm">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded bg-[#238636] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base text-white tracking-tight">SkillChain</span>
          </Link>
          <h1 className="text-base font-semibold text-white">Sign in to your account</h1>
          <p className="text-xs text-[#8b949e] mt-1">Select a demo profile to enter directly</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Direct Demo Logins */}
        <div className="mb-5 pb-5 border-b border-[#30363d]">
          <p className="text-[11px] font-medium text-[#8b949e] mb-2 uppercase font-mono tracking-wider">
            Click to Enter Instantly:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => selectDemoProfile('alex@student.edu', 'alex123')}
              className="p-2 rounded border border-[#30363d] bg-[#0d1117] hover:border-[#58a6ff] hover:bg-[#1f6feb]/10 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#58a6ff]" />
                Student
              </div>
              <p className="text-[10px] text-[#8b949e]">Alex R. &rarr;</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('apex@skillchain.edu', 'apex123')}
              className="p-2 rounded border border-[#30363d] bg-[#0d1117] hover:border-[#3fb950] hover:bg-[#238636]/10 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#3fb950]" />
                Issuer
              </div>
              <p className="text-[10px] text-[#8b949e]">Apex &rarr;</p>
            </button>

            <button
              type="button"
              onClick={() => selectDemoProfile('admin@skillchain.edu', 'admin123')}
              className="p-2 rounded border border-[#30363d] bg-[#0d1117] hover:border-[#d29922] hover:bg-[#d29922]/10 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-0.5">
                <Shield className="w-3.5 h-3.5 text-[#d29922]" />
                Admin
              </div>
              <p className="text-[10px] text-[#8b949e]">Audit &rarr;</p>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                placeholder="name@domain.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign in
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
          New to SkillChain?{' '}
          <Link to="/register" className="text-[#58a6ff] hover:underline font-medium">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};
