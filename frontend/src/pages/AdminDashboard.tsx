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
        setStats(res.data);
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
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System & Smart Contract Governance</h1>
        <p className="text-xs text-[#8b949e] mt-0.5">EVM Registry Status & Public Audit Verification Trail</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Total Users</span>
          <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Accredited Issuers</span>
          <p className="text-2xl font-bold text-white">{stats?.total_institutions || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Registered Hashes</span>
          <p className="text-2xl font-bold text-white">{stats?.total_credentials || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Audit Checks</span>
          <p className="text-2xl font-bold text-white">{stats?.total_verifications || 0}</p>
        </div>
      </div>

      {/* Contract address */}
      <div className="p-3 bg-[#161b22] rounded-lg border border-[#30363d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[#8b949e] block text-[10px]">EVM REGISTRY CONTRACT</span>
          <span className="font-mono text-[#3fb950]">{stats?.contract_address || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#3fb950]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
          EVM Localhost (31337)
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Verification Audit Trail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#30363d] text-[#8b949e] font-mono">
                <th className="pb-2 font-normal">TIMESTAMP</th>
                <th className="pb-2 font-normal">CREDENTIAL ID</th>
                <th className="pb-2 font-normal">VERIFIER</th>
                <th className="pb-2 font-normal">RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {stats?.recent_verifications && stats.recent_verifications.length > 0 ? (
                stats.recent_verifications.map((v: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#21262d]/50">
                    <td className="py-2.5 font-mono text-[#8b949e]">{v.timestamp}</td>
                    <td className="py-2.5 font-mono text-[#58a6ff]">{v.credential_id}</td>
                    <td className="py-2.5 text-[#c9d1d9]">{v.verifier}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        v.result === 'AUTHENTIC'
                          ? 'bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30'
                          : 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30'
                      }`}>
                        {v.result}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-[#8b949e]">No records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
