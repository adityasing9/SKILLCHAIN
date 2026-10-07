import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Award, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Clock, ShieldCheck, ChevronRight, FileText, TrendingUp 
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/students/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load student statistics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Top Cards */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Student Intelligence Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Decentralized verified credentials and AI skill insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">TOTAL CREDENTIALS</span>
            <Award className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.total_credentials || 0}</p>
          <span className="text-[11px] text-emerald-400 mt-1 block font-mono">100% Cryptographic Hash</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">VERIFIED ON BLOCKCHAIN</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.verified_credentials || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active on EVM</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">AI DETECTED SKILLS</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.detected_skills_count || 0}</p>
          <span className="text-[11px] text-indigo-400 mt-1 block">Confidence Scored</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase">RECOMMENDED SKILLS</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.recommendations_count || 0}</p>
          <span className="text-[11px] text-amber-400 mt-1 block">Career Roadmaps</span>
        </div>
      </div>

      {/* Main Grid: Timeline & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Credential Timeline */}
        <div className="lg:col-span-2 bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Achievement Timeline</h2>
              <p className="text-xs text-slate-400">Chronological history of your blockchain credentials</p>
            </div>
            <Link
              to="/student/credentials"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
            {stats?.timeline && stats.timeline.length > 0 ? (
              stats.timeline.map((item: any, idx: number) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8 group">
                  <span className={`absolute left-2.5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0f172a] ${
                    item.status === 'REVOKED' ? 'bg-amber-400' : 'bg-blue-500'
                  }`}></span>
                  
                  <div className="flex-1 bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 group-hover:border-slate-700 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        item.status === 'REVOKED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{item.institution} &bull; {item.type}</p>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-mono text-blue-400">{item.credential_id}</span>
                      <Link
                        to={`/verify/${item.credential_id}`}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        Public Proof
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 pl-8">No credentials issued yet.</p>
            )}
          </div>
        </div>

        {/* AI Resume Snapshot & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">AI Profile Intelligence</h2>
            </div>
            
            {stats?.resume_summary ? (
              <div className="space-y-4">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 block mb-1">TARGET CAREER</span>
                  <p className="font-semibold text-white">{stats.resume_summary.target_career}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {stats.resume_summary.summary}
                </p>

                <Link
                  to="/student/resume"
                  className="w-full py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Analyze Updated Resume
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-4">No resume analyzed yet. Upload your PDF to generate skill confidence scores.</p>
                <Link
                  to="/student/resume"
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium inline-block"
                >
                  Upload Resume
                </Link>
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">Blockchain Trust Guarantee</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Your credentials are cryptographically protected. Every certificate is hashed with SHA-256 and anchored to the local EVM smart contract.
            </p>
            <Link
              to="/student/skills"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-mono"
            >
              Explore Verified Skills &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
