import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ThemeSelector } from '../components/ThemeSelector';
import { Shield, ArrowRight, AlertCircle, Building, GraduationCap } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'STUDENT' | 'INSTITUTION'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Student
  const [studentId, setStudentId] = useState('');
  const [college, setCollege] = useState('Apex Institute of Technology');
  
  // Institution
  const [regNumber, setRegNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const payload: any = {
      name,
      email: cleanEmail,
      password,
      role,
      student_identifier: studentId || `STU-${Date.now().toString().slice(-4)}`,
      college,
      institution_name: name,
      registration_number: regNumber || `REG-${Date.now().toString().slice(-4)}`,
    };

    // 1. Attempt API
    try {
      const res = await api.post('/auth/register', payload);
      if (res.data && res.data.access_token && res.data.user) {
        login(res.data.access_token, res.data.user);
        navigate(role === 'STUDENT' ? '/student/dashboard' : '/institution/dashboard');
        return;
      }
      throw new Error('Invalid register response');
    } catch {
      console.warn('API unavailable, registering locally');
    }

    // 2. Local fallback registration
    const userObj = {
      id: Date.now(),
      name,
      email: cleanEmail,
      role,
      profile: role === 'STUDENT'
        ? { student_id: Date.now(), student_identifier: payload.student_identifier, college }
        : { institution_id: Date.now(), institution_name: name, registration_number: payload.registration_number }
    };

    localStorage.setItem(`registered_${cleanEmail}`, JSON.stringify(userObj));
    login('local-jwt-token', userObj);
    navigate(role === 'STUDENT' ? '/student/dashboard' : '/institution/dashboard');
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select your account role to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              role === 'STUDENT'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-theme-primary" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('INSTITUTION')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              role === 'INSTITUTION'
                ? 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building className="w-4 h-4 text-theme-primary" />
            Institution
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-theme-primary"
              placeholder={role === 'STUDENT' ? 'e.g. Alex Rivera' : 'e.g. Apex Institute of Technology'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-theme-primary"
              placeholder="user@domain.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-theme-primary"
              placeholder="••••••••"
            />
          </div>

          {role === 'STUDENT' ? (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Student Identifier / Roll No</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-theme-primary"
                placeholder="STU-2026-001"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-theme-primary"
                placeholder="REG-2026-01"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-theme-primary hover:bg-theme-hover text-white font-medium py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Create account
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-theme-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
