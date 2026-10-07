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
        if (Array.isArray(res.data)) {
          setCredentials(res.data);
          return;
        }
        throw new Error('Not an array');
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
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verified Credentials</h1>
        <p className="text-sm text-slate-500 mt-1">Cryptographically anchored records issued to your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {credentials.map((cred) => (
          <div key={cred.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-200 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  {cred.credential_type}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  cred.status === 'REVOKED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {cred.status}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 mb-1.5">{cred.title}</h2>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{cred.description}</p>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{cred.institution_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(cred.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="text-[11px] font-mono truncate text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                  Hash: <span className="text-emerald-700 font-semibold">{cred.certificate_hash.slice(0, 20)}...</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => openQrModal(cred)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                QR Code
              </button>

              <Link
                to={`/verify/${cred.credential_id}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 text-center shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Verification QR Code</h3>
            <p className="text-xs text-slate-500 mb-4 truncate">{selectedCred.title}</p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + '/verify/' + selectedCred.credential_id)}`}
                alt="QR Code"
                className="w-40 h-40 mx-auto rounded-lg"
              />
            </div>

            <p className="text-xs font-mono text-emerald-700 font-semibold mb-4 bg-emerald-50 py-1 px-3 rounded-full inline-block">{selectedCred.credential_id}</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyVerificationLink(selectedCred.credential_id)}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
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
