import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
      login(res.data.access_token, res.data.user);
      navigate(role === 'STUDENT' ? '/student/dashboard' : '/institution/dashboard');
      return;
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
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#161b22] rounded-lg border border-[#30363d] p-6 shadow-sm">
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded bg-[#238636] flex items-center justify-center text-white font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base text-white tracking-tight">SkillChain</span>
          </Link>
          <h1 className="text-base font-semibold text-white">Create your account</h1>
          <p className="text-xs text-[#8b949e] mt-1">Select account type to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-[#f85149]/10 border border-[#f85149]/30 text-[#f85149] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#0d1117] rounded border border-[#30363d] mb-4">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
              role === 'STUDENT'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#58a6ff]" />
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('INSTITUTION')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${
              role === 'INSTITUTION'
                ? 'bg-[#21262d] text-white border border-[#30363d]'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#3fb950]" />
            Institution
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
              placeholder={role === 'STUDENT' ? 'Alex Rivera' : 'Apex Institute'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
              placeholder="user@domain.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#58a6ff]"
              placeholder="••••••••"
            />
          </div>

          {role === 'STUDENT' ? (
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Student Identifier</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono"
                placeholder="STU-2026-001"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#c9d1d9] mb-1">Registration Code</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-white font-mono"
                placeholder="REG-2026-01"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Create account
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#30363d] text-center text-xs text-[#8b949e]">
          Already registered?{' '}
          <Link to="/login" className="text-[#58a6ff] hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
