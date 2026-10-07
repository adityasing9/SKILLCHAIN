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
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data) && res.data.total_issued !== undefined) {
          setStats(res.data);
          return;
        }
        throw new Error('Invalid payload');
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
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.institution_name || 'Apex Institute of Technology'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registry Code: <span className="font-mono font-semibold text-slate-700">{stats?.registration_number}</span> &bull; Accredited Issuer
          </p>
        </div>

        <Link
          to="/institution/issue"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Issue Credential
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Total Issued</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_issued || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Active Records</span>
          <p className="text-3xl font-extrabold text-emerald-700">{stats?.active_credentials || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Revoked On-Chain</span>
          <p className="text-3xl font-extrabold text-amber-700">{stats?.revoked_credentials || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Enrolled Students</span>
          <p className="text-3xl font-extrabold text-slate-900">{stats?.total_students || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Issued Credentials Ledger</h2>
          <Link to="/institution/credentials" className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold hover:underline">
            Manage All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold uppercase">CREDENTIAL ID</th>
                <th className="pb-3 font-semibold uppercase">TITLE</th>
                <th className="pb-3 font-semibold uppercase">STUDENT</th>
                <th className="pb-3 font-semibold uppercase">STATUS</th>
                <th className="pb-3 font-semibold uppercase text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_activity?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 font-mono font-medium text-emerald-700">{item.credential_id}</td>
                  <td className="py-3 text-slate-900 font-semibold">{item.title}</td>
                  <td className="py-3 text-slate-600">{item.student_name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'REVOKED' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link to={`/verify/${item.credential_id}`} className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline">
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
