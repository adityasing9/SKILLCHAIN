import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';
import type { Credential } from '../types';
import { QrCode, Download, ExternalLink, Calendar, Building, Check } from 'lucide-react';

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
      } catch {
        const creds = getStoredCredentials();
        const alexCreds = creds.filter(c => c.student_name.includes('Alex') || c.student_identifier === 'STU-2026-001');
        setCredentials(alexCreds);
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
        <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Verified Credentials</h1>
        <p className="text-xs text-[#8b949e]">Cryptographically anchored records issued to your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {credentials.map((cred) => (
          <div key={cred.id} className="bg-[#161b22] rounded-lg border border-[#30363d] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                  {cred.credential_type}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  cred.status === 'REVOKED'
                    ? 'bg-[#d29922]/10 text-[#d29922] border border-[#d29922]/30'
                    : 'bg-[#238636]/10 text-[#3fb950] border border-[#238636]/30'
                }`}>
                  {cred.status}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-white mb-1">{cred.title}</h2>
              <p className="text-xs text-[#8b949e] line-clamp-2 mb-3">{cred.description}</p>

              <div className="space-y-1.5 pt-2.5 border-t border-[#30363d] text-xs text-[#8b949e]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>{cred.institution_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(cred.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="text-[11px] font-mono truncate">
                  Hash: <span className="text-[#58a6ff]">{cred.certificate_hash.slice(0, 18)}...</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#30363d] flex items-center justify-between gap-2">
              <button
                onClick={() => openQrModal(cred)}
                className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#c9d1d9] flex items-center gap-1 transition-colors border border-[#30363d] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#58a6ff]" />
                QR Code
              </button>

              <Link
                to={`/verify/${cred.credential_id}`}
                className="px-2.5 py-1 rounded bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Public Verify
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {showQrModal && selectedCred && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#161b22] rounded-lg border border-[#30363d] max-w-xs w-full p-5 text-center shadow-lg">
            <h3 className="text-sm font-bold text-white mb-1">Verification QR</h3>
            <p className="text-xs text-[#8b949e] mb-3 truncate">{selectedCred.title}</p>

            <div className="bg-white p-2.5 rounded inline-block mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '/verify/' + selectedCred.credential_id)}`}
                alt="QR Code"
                className="w-36 h-36 mx-auto"
              />
            </div>

            <p className="text-[11px] font-mono text-[#58a6ff] mb-3">{selectedCred.credential_id}</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => copyVerificationLink(selectedCred.credential_id)}
                className="py-1.5 px-2 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded cursor-pointer"
              >
                {copied ? 'Copied' : 'Copy URL'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-1.5 px-2 bg-[#21262d] text-[#c9d1d9] text-xs font-medium rounded border border-[#30363d] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
