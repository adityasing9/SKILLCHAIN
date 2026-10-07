import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { 
  Shield, CheckCircle2, ArrowRight, Search, 
  Lock, Award, Users, Zap, Check, ChevronRight, FileCheck, Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [quickSearchId, setQuickSearchId] = useState('');
  const navigate = useNavigate();

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchId.trim()) {
      navigate(`/verify/${quickSearchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Unified Navbar with Live Theme Selector */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 text-center bg-gradient-to-b from-white to-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-theme-light border border-theme-border text-theme-primary text-xs font-semibold px-3 py-1 rounded-full transition-all">
            <Shield className="w-3.5 h-3.5 text-theme-primary" />
            Trusted by 100+ Educational Institutions
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Smart Credential Verification <br />
            <span className="text-theme-primary transition-colors">Made Simple</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload, verify, and share your academic achievements with confidence. <br className="hidden sm:block" />
            Built for students, trusted by institutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-theme-primary hover:bg-theme-hover text-white font-semibold text-sm shadow-xs transition-all"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-xs transition-all"
            >
              Learn More
            </Link>
          </div>

          {/* Instant Search Bar */}
          <div className="pt-6 max-w-lg mx-auto">
            <form onSubmit={handleQuickVerify} className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Verify Credential ID (e.g. SKILL-2026-ML01)"
                  value={quickSearchId}
                  onChange={(e) => setQuickSearchId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-theme-primary hover:bg-theme-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Verify
              </button>
            </form>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              Try demo: <button onClick={() => setQuickSearchId('SKILL-2026-ML01')} className="text-emerald-600 hover:underline cursor-pointer">SKILL-2026-ML01</button> &bull; <button onClick={() => setQuickSearchId('SKILL-2026-REV05')} className="text-rose-600 hover:underline cursor-pointer">SKILL-2026-REV05 (Revoked)</button>
            </div>
          </div>

        </div>
      </section>

      {/* Everything You Need Section (Matches image reference) */}
      <section className="py-20 px-4 bg-sky-50/50">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Everything You Need</h2>
            <p className="text-sm text-slate-500">A complete platform for credential management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Instant Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Get your credentials verified by faculty in minutes, not days.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Blockchain Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                SHA-256 hashing ensures your documents are tamper-proof and immutable on-chain.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Digital Portfolio</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Create a beautiful, shareable portfolio of verified credentials and skills.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Role-Based Access</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students, faculty, and employers get customized dashboards and controls.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">AI Skill Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extracts skills from resumes and certificates with confidence scoring and career roadmaps.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">OWASP & EVM Compliant</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enterprise security standards keeping documents private and off-chain.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        SkillChain &bull; Decentralized Credential Verification Platform &bull; EVM Compatible
      </footer>

    </div>
  );
};
