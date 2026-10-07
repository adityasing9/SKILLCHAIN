import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, Lock, Cpu, Database, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">SkillChain</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</Link>
            <Link to="/about" className="text-sm font-medium text-emerald-600 font-semibold">About</Link>
            <Link to="/verify" className="text-sm font-medium text-slate-600 hover:text-slate-900">Verify</Link>
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
            Project Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About the SkillChain Platform
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
            A blockchain-based credential verification and AI skill intelligence system developed for modern higher education and recruitment.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-slate-900">1. Core Objective</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Certificate fraud is a growing challenge worldwide. Fake diplomas and doctored PDF credentials are easy to produce and difficult to detect without slow manual institutional checks. SkillChain solves this by creating an immutable, decentralized trust layer on the Ethereum Virtual Machine (EVM).
          </p>

          <h2 className="text-xl font-bold text-slate-900">2. Important Blockchain Principle: Off-Chain Storage</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SkillChain strictly adheres to modern enterprise privacy principles: <strong>no personal resumes, identity numbers, or certificates are stored directly on the blockchain</strong>. Only minimal cryptographic SHA-256 hashes, timestamps, issuer addresses, and revocation states are anchored into the smart contract. Actual files remain in encrypted off-chain storage.
          </p>

          <h2 className="text-xl font-bold text-slate-900">3. AI Skill Intelligence Engine</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rather than generic chat interfaces, SkillChain includes a tailored intelligence engine that parses verified certificates and resumes, extracts technical skills, computes statistical confidence indicators (e.g. 70%–96%), and benchmarks student profiles against career targets (like Machine Learning Engineer or Full Stack Developer).
          </p>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all"
          >
            Explore Platform Portals
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        SkillChain &bull; Decentralized Credential Verification Platform
      </footer>

    </div>
  );
};
