import React, { useState, useEffect } from 'react';
import api from '../services/api';


export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Smart Contract Administration</h1>
        <p className="text-xs text-slate-400 mt-1">EVM Registry Governance & Verification Audit Log Trail</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">TOTAL USERS</span>
          <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">INSTITUTIONS</span>
          <p className="text-2xl font-bold text-white">{stats?.total_institutions || 0}</p>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">TOTAL CREDENTIALS</span>
          <p className="text-2xl font-bold text-white">{stats?.total_credentials || 0}</p>
        </div>
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">VERIFICATION CHECKS</span>
          <p className="text-2xl font-bold text-white">{stats?.total_verifications || 0}</p>
        </div>
      </div>

      {/* Smart Contract Status Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">ACTIVE SMART CONTRACT ADDRESS</span>
          <span className="font-mono text-emerald-400">{stats?.contract_address || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span className="font-mono text-slate-300">Hardhat EVM Localhost</span>
        </div>
      </div>

      {/* Verification Audit Trail */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6">
        <h2 className="text-base font-bold text-white mb-4">Verification Audit Activity Trail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="pb-3">TIMESTAMP</th>
                <th className="pb-3">CREDENTIAL ID</th>
                <th className="pb-3">VERIFIER</th>
                <th className="pb-3">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats?.recent_verifications && stats.recent_verifications.length > 0 ? (
                stats.recent_verifications.map((v: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-400 text-[11px]">{v.timestamp}</td>
                    <td className="py-3 font-mono text-blue-400">{v.credential_id}</td>
                    <td className="py-3 text-slate-300">{v.verifier}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        v.result === 'AUTHENTIC'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : v.result === 'REVOKED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {v.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No verifications logged yet.
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
