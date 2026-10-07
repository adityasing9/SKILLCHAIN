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
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.total_credentials !== undefined) {
          setStats(res.data);
          return;
        }
        throw new Error('Invalid payload');
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
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Verified on-chain credentials & AI skill intelligence</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Credentials</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_credentials || 0}</p>
          <span className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> On-Chain Anchored
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Active Verified</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.verified_credentials || 0}</p>
          <span className="text-xs text-slate-500 mt-2 block font-medium">Tamper-Proof Proofs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Extracted Skills</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.detected_skills_count || 0}</p>
          <span className="text-xs text-emerald-700 font-medium mt-2 block">Confidence Scored</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Recommendations</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.recommendations_count || 0}</p>
          <span className="text-xs text-amber-700 font-medium mt-2 block">Career Opportunities</span>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Credential Timeline</h2>
              <p className="text-xs text-slate-500">Chronological records verified on blockchain</p>
            </div>
            <Link to="/student/credentials" className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-semibold">
              View All
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.timeline && stats.timeline.length > 0 ? (
              stats.timeline.map((item: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-50/70 hover:bg-slate-50 transition-colors rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{item.date}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'REVOKED' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.institution} &bull; {item.type}</p>
                  </div>
                  <Link
                    to={`/verify/${item.credential_id}`}
                    className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 shrink-0 font-medium font-mono"
                  >
                    Verify &rarr;
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">No credentials on record.</p>
            )}
          </div>
        </div>

        {/* AI Resume Snapshot */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-2">Target Career Readiness</h2>
            
            {stats?.resume_summary ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Role</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{stats.resume_summary.target_career}</p>
                </div>

                <p className="text-slate-600 leading-relaxed text-xs">
                  {stats.resume_summary.summary}
                </p>

                <Link
                  to="/student/resume"
                  className="block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                >
                  Analyze Resume PDF
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Upload your resume to extract career insights.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
