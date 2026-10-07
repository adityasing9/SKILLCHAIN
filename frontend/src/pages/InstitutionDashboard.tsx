import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';
import { PlusCircle } from 'lucide-react';

export const InstitutionDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/institutions/dashboard-stats');
        setStats(res.data);
      } catch {
        const creds = getStoredCredentials();
        setStats({
          institution_name: 'Apex Institute of Technology',
          registration_number: 'APEX-UNIV-9920',
          total_issued: creds.length,
          active_credentials: creds.filter(c => c.status !== 'REVOKED').length,
          revoked_credentials: creds.filter(c => c.status === 'REVOKED').length,
          total_students: 3,
          recent_activity: creds.map(c => ({
            credential_id: c.credential_id,
            title: c.title,
            student_name: c.student_name,
            status: c.status,
            date: new Date(c.issue_date).toLocaleDateString()
          }))
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {stats?.institution_name || 'Apex Institute of Technology'}
          </h1>
          <p className="text-xs text-[#8b949e]">
            Reg: <span className="font-mono text-[#c9d1d9]">{stats?.registration_number}</span> &bull; Accredited Issuer
          </p>
        </div>

        <Link
          to="/institution/issue"
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Issue Credential
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Total Issued</span>
          <p className="text-2xl font-bold text-white">{stats?.total_issued || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Active Records</span>
          <p className="text-2xl font-bold text-white">{stats?.active_credentials || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Revoked On-Chain</span>
          <p className="text-2xl font-bold text-white">{stats?.revoked_credentials || 0}</p>
        </div>
        <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d]">
          <span className="text-[11px] font-mono uppercase text-[#8b949e] block mb-1">Enrolled Students</span>
          <p className="text-2xl font-bold text-white">{stats?.total_students || 0}</p>
        </div>
      </div>

      <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Issued Credentials Ledger</h2>
          <Link to="/institution/credentials" className="text-xs text-[#58a6ff] hover:underline font-medium">
            Manage All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#30363d] text-[#8b949e] font-mono">
                <th className="pb-2 font-normal">CREDENTIAL ID</th>
                <th className="pb-2 font-normal">TITLE</th>
                <th className="pb-2 font-normal">STUDENT</th>
                <th className="pb-2 font-normal">STATUS</th>
                <th className="pb-2 font-normal text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {stats?.recent_activity?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#21262d]/50">
                  <td className="py-2.5 font-mono text-[#58a6ff]">{item.credential_id}</td>
                  <td className="py-2.5 text-white font-medium">{item.title}</td>
                  <td className="py-2.5 text-[#8b949e]">{item.student_name}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      item.status === 'REVOKED' ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30' : 'bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <Link to={`/verify/${item.credential_id}`} className="text-[#58a6ff] hover:underline font-mono">
                      Verify &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
