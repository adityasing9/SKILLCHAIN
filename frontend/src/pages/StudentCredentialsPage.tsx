import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../services/api';
import type { Credential } from '../types';
import { Award, QrCode, Download, ExternalLink, ShieldCheck, Calendar, Building, FileText, Check } from 'lucide-react';

export const StudentCredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const res = await api.get('/students/credentials');
        setCredentials(res.data);
      } catch (err) {
        console.error('Failed to fetch credentials', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCredentials();
  }, []);

  const openQrModal = (cred: Credential) => {
    setSelectedCred(cred);
    setShowQrModal(true);
  };

  const copyVerificationLink = (id: string) => {
    const link = `${window.location.origin}/verify/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Verified Credentials</h1>
          <p className="text-xs text-slate-400 mt-1">Cryptographically anchored records issued to your profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map((cred) => (
          <div key={cred.id} className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {cred.credential_type}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  cred.status === 'REVOKED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {cred.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-white mb-1.5">{cred.title}</h2>
              <p className="text-xs text-slate-400 line-clamp-2 mb-4">{cred.description}</p>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{cred.institution_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(cred.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  Hash: <span className="text-slate-400">{cred.certificate_hash.slice(0, 20)}...</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => openQrModal(cred)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                QR Proof
              </button>

              <div className="flex items-center gap-2">
                <Link
                  to={`/verify/${cred.credential_id}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-500/30"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Public Verify
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code & Share Modal */}
      {showQrModal && selectedCred && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 max-w-sm w-full p-6 text-center shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-1">Verification QR Code</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedCred.title}</p>

            <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-md">
              <img
                src={`${API_URL}/verify/${selectedCred.credential_id}/qr`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-[11px] font-mono text-blue-400 break-all mb-4">
              {selectedCred.credential_id}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`${API_URL}/verify/${selectedCred.credential_id}/qr`}
                download={`${selectedCred.credential_id}_qr.png`}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download QR
              </a>
              <button
                onClick={() => copyVerificationLink(selectedCred.credential_id)}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                {copied ? 'Copied URL' : 'Copy Link'}
              </button>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-4 text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
