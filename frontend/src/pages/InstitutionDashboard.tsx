import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building, Award, CheckCircle2, AlertTriangle, Users, PlusCircle, ArrowUpRight, Search } from 'lucide-react';

export const InstitutionDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/institutions/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load institution stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {stats?.institution_name || 'Institution Console'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reg. No: <span className="font-mono text-slate-300">{stats?.registration_number}</span> &bull; Accredited Issuer
          </p>
        </div>

        <Link
          to="/institution/issue"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Issue New Credential
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">TOTAL ISSUED</span>
          <p className="text-2xl font-bold text-white">{stats?.total_issued || 0}</p>
          <span className="text-[11px] text-blue-400 mt-1 block">Registered on EVM</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">ACTIVE CREDENTIALS</span>
          <p className="text-2xl font-bold text-white">{stats?.active_credentials || 0}</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Valid & Untampered</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">REVOKED ON-CHAIN</span>
          <p className="text-2xl font-bold text-white">{stats?.revoked_credentials || 0}</p>
          <span className="text-[11px] text-amber-400 mt-1 block">Revocation Broadcasted</span>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">STUDENTS ENROLLED</span>
          <p className="text-2xl font-bold text-white">{stats?.total_students || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recipient Profiles</span>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Recent Credential Transactions</h2>
          <Link to="/institution/credentials" className="text-xs text-indigo-400 hover:underline">
            Manage All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3 font-semibold">CREDENTIAL ID</th>
                <th className="pb-3 font-semibold">TITLE</th>
                <th className="pb-3 font-semibold">STUDENT</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold">DATE</th>
                <th className="pb-3 font-semibold text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-mono text-blue-400">{item.credential_id}</td>
                    <td className="py-3 text-white font-medium">{item.title}</td>
                    <td className="py-3 text-slate-300">{item.student_name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        item.status === 'REVOKED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{item.date}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/verify/${item.credential_id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px]"
                      >
                        Verify &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No credentials issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
