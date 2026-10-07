import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials, revokeMockCredential } from '../services/mockStore';
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
      if (Array.isArray(res.data)) {
        setCredentials(res.data);
        return;
      }
      throw new Error('Not an array');
    } catch {
      setCredentials(getStoredCredentials());
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
    } catch {
      revokeMockCredential(revokingCred.credential_id, revokeReason.trim());
      alert(`Credential ${revokingCred.credential_id} revoked on local blockchain state!`);
      setRevokingCred(null);
      setRevokeReason('');
      fetchCredentials();
    } finally {
      setRevokingLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issued Credentials Registry</h1>
        <p className="text-sm text-slate-500 mt-1">Manage active credentials, inspect hashes, or execute on-chain revocations</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
              <th className="pb-3 font-semibold uppercase">ID</th>
              <th className="pb-3 font-semibold uppercase">TITLE</th>
              <th className="pb-3 font-semibold uppercase">STUDENT</th>
              <th className="pb-3 font-semibold uppercase">SHA-256 HASH</th>
              <th className="pb-3 font-semibold uppercase">STATUS</th>
              <th className="pb-3 font-semibold uppercase text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {credentials.map((cred) => (
              <tr key={cred.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 font-mono font-medium text-emerald-700">{cred.credential_id}</td>
                <td className="py-3 text-slate-900 font-semibold">{cred.title}</td>
                <td className="py-3 text-slate-600">
                  <span className="font-medium text-slate-900 block">{cred.student_name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{cred.student_identifier}</span>
                </td>
                <td className="py-3 font-mono text-[11px] text-slate-400">
                  {cred.certificate_hash.slice(0, 16)}...
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    cred.status === 'REVOKED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {cred.status}
                  </span>
                </td>
                <td className="py-3 text-right space-x-3">
                  <Link
                    to={`/verify/${cred.credential_id}`}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs hover:underline"
                  >
                    Verify Card
                  </Link>
                  {cred.status !== 'REVOKED' && (
                    <button
                      onClick={() => {
                        setRevokingCred(cred);
                        setRevokeReason('');
                      }}
                      className="text-amber-700 hover:text-amber-800 font-semibold text-xs hover:underline cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Revoke On-Chain Credential
              </h3>
              <button onClick={() => setRevokingCred(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-2">
              Are you sure you want to revoke credential <span className="font-mono text-emerald-700 font-bold">{revokingCred.credential_id}</span>?
            </p>
            <p className="text-xs text-amber-800 mb-4 bg-amber-50 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
              This will update the status on the smart contract registry, marking this credential invalid for all verifiers worldwide.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audit Revocation Reason</label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder="e.g. Incomplete program requirements / administrative invalidation"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRevokingCred(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revokingLoading}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white shadow-xs cursor-pointer disabled:opacity-50"
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
