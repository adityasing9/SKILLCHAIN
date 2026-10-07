import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, CheckCircle2, ArrowRight, Search, 
  ExternalLink, FileCheck, Layers, Hash
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
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans">
      
      {/* Top Bar Header */}
      <nav className="border-b border-[#30363d] bg-[#161b22] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#238636] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">SkillChain</span>
            <span className="text-[10px] font-mono text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded bg-[#0d1117]">
              Credential Verification
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/verify" className="text-xs text-[#c9d1d9] hover:text-white px-2.5 py-1.5 rounded hover:bg-[#21262d]">
              Verify
            </Link>
            <Link to="/login" className="text-xs text-[#c9d1d9] hover:text-white px-2.5 py-1.5 rounded hover:bg-[#21262d]">
              Sign in
            </Link>
            <Link to="/register" className="text-xs bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-1.5 rounded font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-[#30363d] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#8b949e] font-mono bg-[#161b22] border border-[#30363d] px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
            Cryptographic SHA-256 Proof &bull; EVM Smart Contract &bull; Zero Fake Degrees
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            Cryptographic Credential Verification <br className="hidden sm:block" />
            & Skill Intelligence Platform
          </h1>

          <p className="text-sm text-[#8b949e] max-w-2xl mx-auto leading-relaxed">
            SkillChain allows educational institutions to anchor tamper-proof credential digests on the blockchain while extracting structured skill profiles from student coursework and resumes.
          </p>

          {/* Quick Verification Lookup Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <form onSubmit={handleQuickVerify} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Enter Credential ID (e.g. SKILL-2026-ML01)"
                  value={quickSearchId}
                  onChange={(e) => setQuickSearchId(e.target.value)}
                  className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] font-mono"
                />
              </div>
              <button
                type="submit"
                className="bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                Verify Proof
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-center gap-3 text-[11px] text-[#8b949e] font-mono">
              <span>Quick tests:</span>
              <button onClick={() => setQuickSearchId('SKILL-2026-ML01')} className="text-[#58a6ff] hover:underline cursor-pointer">
                SKILL-2026-ML01 (Valid)
              </button>
              <span>&bull;</span>
              <button onClick={() => setQuickSearchId('SKILL-2026-REV05')} className="text-[#f85149] hover:underline cursor-pointer">
                SKILL-2026-REV05 (Revoked)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Overview */}
      <section className="py-12 px-4 border-b border-[#30363d] bg-[#161b22]/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
            <div className="w-8 h-8 rounded bg-[#21262d] flex items-center justify-center text-[#58a6ff] mb-3">
              <Hash className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">On-Chain Digest Only</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              No private student records or PDFs on-chain. Only minimal 256-bit SHA hashes, issuer addresses, and timestamps are recorded.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
            <div className="w-8 h-8 rounded bg-[#21262d] flex items-center justify-center text-[#3fb950] mb-3">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Byte Tamper Detection</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Verifiers can upload any candidate certificate. If even a single grade or letter was modified, the hash fails verification.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
            <div className="w-8 h-8 rounded bg-[#21262d] flex items-center justify-center text-[#d29922] mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Skill Intelligence</h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Analyzes verified achievements and resumes to calculate skill confidence scores and recommend tailored career roadmaps.
            </p>
          </div>
        </div>
      </section>

      {/* Practical Demonstration Matrix */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto bg-[#161b22] rounded-md border border-[#30363d] p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">College Mini-Project Demonstration Matrix</h2>
              <p className="text-xs text-[#8b949e]">Built to demonstrate Solidity smart contracts, cryptographic verification, and AI parsing.</p>
            </div>
            <Link
              to="/verify/SKILL-2026-ML01"
              className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium shrink-0"
            >
              Open Proof Sample
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
              <span className="font-semibold text-white block mb-0.5">1. Issue Credential</span>
              <p className="text-[#8b949e] text-[11px]">Institution generates SHA-256 and registers on EVM.</p>
            </div>
            <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
              <span className="font-semibold text-white block mb-0.5">2. Public Verify</span>
              <p className="text-[#8b949e] text-[11px]">Zero-login lookup matching on-chain cryptographic state.</p>
            </div>
            <div className="p-3 bg-[#0d1117] rounded border border-[#30363d]">
              <span className="font-semibold text-white block mb-0.5">3. AI Resume Extraction</span>
              <p className="text-[#8b949e] text-[11px]">Extracts skills, projects, and target career gaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-[#30363d] bg-[#161b22] text-center text-xs text-[#8b949e]">
        SkillChain &bull; Blockchain Credential Verification &bull; EVM Compatible &bull; GitHub
      </footer>

    </div>
  );
};
