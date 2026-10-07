import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';
import { 
  Award, Sparkles, CheckCircle2, TrendingUp, 
  ArrowUpRight, ChevronRight, FileText, ExternalLink
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/students/dashboard-stats');
        setStats(res.data);
      } catch {
        // Local fallback stats
        const creds = getStoredCredentials();
        const alexCreds = creds.filter(c => c.student_name.includes('Alex') || c.student_identifier === 'STU-2026-001');
        setStats({
          total_credentials: alexCreds.length,
          verified_credentials: alexCreds.filter(c => c.status !== 'REVOKED').length,
          detected_skills_count: 7,
          recommendations_count: 3,
          timeline: alexCreds.map(c => ({
            date: new Date(c.issue_date).toLocaleDateString(),
            title: c.title,
            institution: c.institution_name,
            type: c.credential_type,
            status: c.status,
            credential_id: c.credential_id
          })),
          resume_summary: {
            target_career: 'Machine Learning Engineer',
            summary: 'Profile demonstrates solid foundations in Python and machine learning algorithms. Next recommended focus is containerization and deployment (Docker / MLOps).'
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Student Overview</h1>
        <p className="text-xs text-[#8b949e] mt-0.5">Verified on-chain credentials & AI skill profiles</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Total Credentials</span>
          <p className="text-2xl font-bold text-white">{stats?.total_credentials || 0}</p>
          <span className="text-[11px] text-[#3fb950] font-mono mt-1 block">On-chain Anchored</span>
        </div>

        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Active Verified</span>
          <p className="text-2xl font-bold text-white">{stats?.verified_credentials || 0}</p>
          <span className="text-[11px] text-[#8b949e] mt-1 block">Tamper-Proof</span>
        </div>

        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Extracted Skills</span>
          <p className="text-2xl font-bold text-white">{stats?.detected_skills_count || 0}</p>
          <span className="text-[11px] text-[#58a6ff] mt-1 block">Confidence Scored</span>
        </div>

        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Recommendations</span>
          <p className="text-2xl font-bold text-white">{stats?.recommendations_count || 0}</p>
          <span className="text-[11px] text-[#d29922] mt-1 block">Career Roadmaps</span>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Timeline */}
        <div className="lg:col-span-2 bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#30363d]">
            <div>
              <h2 className="text-sm font-semibold text-white">Credential Timeline</h2>
              <p className="text-xs text-[#8b949e]">Chronological records verified on blockchain</p>
            </div>
            <Link to="/student/credentials" className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium">
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.timeline && stats.timeline.length > 0 ? (
              stats.timeline.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0d1117] rounded border border-[#30363d] flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-[#8b949e]">{item.date}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        item.status === 'REVOKED' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30' : 'bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                    <p className="text-[11px] text-[#8b949e]">{item.institution} &bull; {item.type}</p>
                  </div>
                  <Link
                    to={`/verify/${item.credential_id}`}
                    className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 shrink-0 font-mono"
                  >
                    Verify &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8b949e]">No credentials on record.</p>
            )}
          </div>
        </div>

        {/* AI Resume Snapshot */}
        <div className="space-y-4">
          <div className="bg-[#161b22] p-5 rounded-lg border border-[#30363d]">
            <h2 className="text-sm font-semibold text-white mb-2">Target Career Readiness</h2>
            
            {stats?.resume_summary ? (
              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-[#0d1117] rounded border border-[#30363d]">
                  <span className="text-[10px] font-mono text-[#8b949e] uppercase block">Benchmark</span>
                  <p className="font-semibold text-white mt-0.5">{stats.resume_summary.target_career}</p>
                </div>

                <p className="text-[#8b949e] leading-relaxed text-[11px]">
                  {stats.resume_summary.summary}
                </p>

                <Link
                  to="/student/resume"
                  className="block w-full text-center py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white rounded text-xs font-medium transition-colors"
                >
                  Analyze Resume PDF
                </Link>
              </div>
            ) : (
              <p className="text-xs text-[#8b949e]">Upload your resume to extract career insights.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
