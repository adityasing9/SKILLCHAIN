import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Award, AlertTriangle, CheckCircle2, QrCode, ExternalLink, X } from 'lucide-react';

export const InstitutionCredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Revocation Modal
  const [revokingCred, setRevokingCred] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokingLoading, setRevokingLoading] = useState(false);

  const fetchCredentials = async () => {
    try {
      const res = await api.get('/institutions/credentials');
      setCredentials(res.data);
    } catch (err) {
      console.error('Failed to load credentials', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingCred || !revokeReason.trim()) return;

    setRevokingLoading(true);
    try {
      await api.post(`/credentials/${revokingCred.credential_id}/revoke`, {
        reason: revokeReason.trim()
      });
      alert(`Credential ${revokingCred.credential_id} successfully revoked on blockchain!`);
      setRevokingCred(null);
      setRevokeReason('');
      fetchCredentials();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Revocation failed.');
    } finally {
      setRevokingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Issued Credentials Registry</h1>
        <p className="text-xs text-slate-400 mt-1">Manage active credentials, inspect hashes, or execute on-chain revocations</p>
      </div>

      <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono">
              <th className="pb-3 font-semibold">ID</th>
              <th className="pb-3 font-semibold">TITLE</th>
              <th className="pb-3 font-semibold">STUDENT</th>
              <th className="pb-3 font-semibold">SHA-256 HASH</th>
              <th className="pb-3 font-semibold">STATUS</th>
              <th className="pb-3 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {credentials.map((cred) => (
              <tr key={cred.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 font-mono text-blue-400">{cred.credential_id}</td>
                <td className="py-3 text-white font-medium">{cred.title}</td>
                <td className="py-3 text-slate-300">
                  {cred.student_name}
                  <span className="block text-[10px] text-slate-500 font-mono">{cred.student_identifier}</span>
                </td>
                <td className="py-3 font-mono text-[11px] text-slate-400">
                  {cred.certificate_hash.slice(0, 14)}...
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    cred.status === 'REVOKED'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {cred.status}
                  </span>
                </td>
                <td className="py-3 text-right space-x-2">
                  <Link
                    to={`/verify/${cred.credential_id}`}
                    className="text-blue-400 hover:text-blue-300 font-mono text-[11px]"
                  >
                    Public Card
                  </Link>
                  {cred.status !== 'REVOKED' && (
                    <button
                      onClick={() => {
                        setRevokingCred(cred);
                        setRevokeReason('');
                      }}
                      className="text-amber-400 hover:text-amber-300 font-mono text-[11px]"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Revocation Modal */}
      {revokingCred && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Revoke On-Chain Credential
              </h3>
              <button onClick={() => setRevokingCred(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-2">
              Are you sure you want to revoke credential <span className="font-mono text-blue-400 font-semibold">{revokingCred.credential_id}</span>?
            </p>
            <p className="text-[11px] text-amber-300/80 mb-4 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              This will submit a state update to the Ethereum smart contract marking the credential invalid for all verifiers.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Audit Revocation Reason</label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Incomplete program requirements / administrative invalidation"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokingCred(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revokingLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {revokingLoading ? 'Broadcasting Revocation TX...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
