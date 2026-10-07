import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, ArrowRight, Lock, Sparkles, 
  Search, Cpu, Database, ChevronRight, AlertTriangle 
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
    <div className="min-h-screen bg-[#0b0f17] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Ethereum Smart Contracts &bull; SHA-256 On-Chain Proof &bull; AI Skills
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Proof of Skills. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Powered by Blockchain.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate fake certifications. Educational institutions cryptographically anchor credential hashes on the blockchain, while our AI intelligence engine extracts verified skill profiles and career trajectories.
          </p>

          {/* Quick Instant Verification Search */}
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter Credential ID (e.g. SKILL-2026-ML01)"
                  value={quickSearchId}
                  onChange={(e) => setQuickSearchId(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
              >
                Verify Proof
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>Try Demo ID:</span>
              <button onClick={() => setQuickSearchId('SKILL-2026-ML01')} className="text-blue-400 hover:underline font-mono">
                SKILL-2026-ML01
              </button>
              <span>&bull;</span>
              <button onClick={() => setQuickSearchId('SKILL-2026-REV05')} className="text-rose-400 hover:underline font-mono">
                SKILL-2026-REV05 (Revoked)
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold text-white transition-all shadow-sm"
            >
              Sign In to Portal
            </Link>
            <Link
              to="/verify"
              className="px-6 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-sm font-semibold text-blue-300 transition-all flex items-center gap-2"
            >
              Document Tamper Inspector
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Pillars Architecture */}
      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Decentralized Trust Architecture</h2>
          <p className="mt-2 text-sm text-slate-400">Strict separation of application data, cryptographic trust, and AI intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Blockchain Trust Layer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No private documents on-chain. Only minimal cryptographic SHA-256 digests, issuer identity, timestamps, and revocation state are anchored in the Solidity smart contract.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Skill Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts validated competencies from verified certificates and uploaded resumes. Assigns statistical confidence scores and recommends priority career roadmaps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Tamper-Proof Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant QR code scan or document upload. If even a single byte or grade in the certificate PDF is altered, the SHA-256 digest fails against the blockchain registry.
            </p>
          </div>
        </div>
      </div>

      {/* Demonstration Scenarios */}
      <div className="py-12 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400">DEMONSTRATION SCENARIOS</span>
              <h4 className="text-xl font-bold text-white mt-1">Live Evaluation Ready</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Ready-to-test demonstration flows for university faculty and hackathon evaluators: issuance, QR verification, document tampering failure, and instant revocation.
              </p>
            </div>
            <Link
              to="/verify/SKILL-2026-ML01"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap transition-colors"
            >
              View Sample Verified Proof &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500 font-mono">
        SkillChain &bull; Blockchain Credential Verification & AI Intelligence &bull; EVM Paris Compliant
      </footer>
    </div>
  );
};
