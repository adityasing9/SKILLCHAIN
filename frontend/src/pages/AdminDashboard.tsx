import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.total_users !== undefined) {
          setStats(res.data);
          return;
        }
        throw new Error('Invalid admin stats');
      } catch {
        const creds = getStoredCredentials();
        setStats({
          total_users: 14,
          total_institutions: 3,
          total_credentials: creds.length,
          total_verifications: 28,
          contract_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          recent_verifications: [
            { id: 1, credential_id: 'SKILL-2026-ML01', verifier: 'Employer Portal', result: 'AUTHENTIC', timestamp: '2026-10-07 14:10:00' },
            { id: 2, credential_id: 'SKILL-2026-REV05', verifier: 'Academic Inspector', result: 'REVOKED', timestamp: '2026-10-07 13:45:00' },
            { id: 3, credential_id: 'SKILL-2026-WEB03', verifier: 'HR Screener', result: 'AUTHENTIC', timestamp: '2026-10-07 12:30:00' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Smart Contract Governance</h1>
        <p className="text-sm text-slate-500 mt-1">EVM Registry Status & Public Audit Verification Trail</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Users</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Accredited Issuers</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_institutions || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Registered Hashes</span>
          <p className="text-3xl font-extrabold text-emerald-700">{stats?.total_credentials || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Audit Checks</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_verifications || 0}</p>
        </div>
      </div>

      {/* Contract address */}
      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-emerald-800 block text-[10px] font-semibold uppercase tracking-wider">EVM REGISTRY CONTRACT</span>
          <span className="font-mono text-emerald-950 font-bold">{stats?.contract_address || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-emerald-800 bg-white py-1 px-3 rounded-full border border-emerald-200/60 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Hardhat Local &bull; 31337
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Verification Audit Trail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold uppercase">TIMESTAMP</th>
                <th className="pb-3 font-semibold uppercase">CREDENTIAL ID</th>
                <th className="pb-3 font-semibold uppercase">VERIFIER</th>
                <th className="pb-3 font-semibold uppercase">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_verifications && stats.recent_verifications.length > 0 ? (
                stats.recent_verifications.map((v: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-mono text-slate-500">{v.timestamp}</td>
                    <td className="py-3 font-mono font-medium text-emerald-700">{v.credential_id}</td>
                    <td className="py-3 text-slate-800 font-medium">{v.verifier}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        v.result === 'AUTHENTIC'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {v.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">No records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
