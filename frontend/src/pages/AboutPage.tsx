import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Shield, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Unified Navbar with Theme & Dark Mode Controls */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-theme-light border border-theme-border text-theme-primary text-xs font-semibold px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5" />
            Project Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About the SkillChain Platform
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
            A blockchain-based credential verification and AI skill intelligence system developed for modern higher education and recruitment.
          </p>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-6 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Core Objective</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Certificate fraud is a growing challenge worldwide. Fake diplomas and doctored PDF credentials are easy to produce and difficult to detect without slow manual institutional checks. SkillChain solves this by creating an immutable, decentralized trust layer on the Ethereum Virtual Machine (EVM).
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Important Blockchain Principle: Off-Chain Storage</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            SkillChain strictly adheres to modern enterprise privacy principles: <strong>no personal resumes, identity numbers, or certificates are stored directly on the blockchain</strong>. Only minimal cryptographic SHA-256 hashes, timestamps, issuer addresses, and revocation states are anchored into the smart contract. Actual files remain in encrypted off-chain storage.
          </p>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. AI Skill Intelligence Engine</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Rather than generic chat interfaces, SkillChain includes a tailored intelligence engine that parses verified certificates and resumes, extracts technical skills, computes statistical confidence indicators (e.g. 70%–96%), and benchmarks student profiles against career targets (like Machine Learning Engineer or Full Stack Developer).
          </p>
        </div>

        <div className="text-center pt-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-theme-primary hover:bg-theme-hover text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-xs transition-all"
          >
            Explore Platform Portals
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        SkillChain &bull; Decentralized Credential Verification Platform
      </footer>

    </div>
  );
};
