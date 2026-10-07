import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { API_URL } from '../services/api';
import type { VerificationResult } from '../types';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, 
  Upload, QrCode, ExternalLink, Hash, Calendar, Building, User, Download, Copy, Check
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { credentialId: routeCredId } = useParams<{ credentialId?: string }>();
  const [credentialId, setCredentialId] = useState(routeCredId || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'id' | 'file'>('id');

  const navigate = useNavigate();

  const fetchVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await api.get(`/verify/${idToVerify.trim()}`);
      setResult(res.data);
    } catch (err: any) {
      setResult({
        status: 'NOT_FOUND',
        is_valid: false,
        is_revoked: false,
        hash_matched: false,
        credential_id: idToVerify,
        blockchain_status: 'NOT_FOUND',
        message: 'Network error or credential does not exist.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeCredId) {
      setCredentialId(routeCredId);
      fetchVerification(routeCredId);
    }
  }, [routeCredId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentialId.trim()) {
      navigate(`/verify/${credentialId.trim()}`);
      fetchVerification(credentialId.trim());
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !credentialId.trim()) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('credential_id', credentialId.trim());
    formData.append('file', file);

    try {
      const res = await api.post('/verify/compare-hash', formData);
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Document verification comparison failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Verification Inspector Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
            PUBLIC TRUST VALIDATION PORTAL
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">EVM Credential Verification</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Zero account required. Verify authentic cryptographic signatures anchored on the Ethereum Virtual Machine blockchain.
          </p>
        </div>

        {/* Query Input Box */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex border-b border-slate-800 pb-3 mb-4 gap-4">
            <button
              onClick={() => setActiveTab('id')}
              className={`text-xs font-medium pb-2 border-b-2 transition-all ${
                activeTab === 'id' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Verify by Credential ID
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`text-xs font-medium pb-2 border-b-2 transition-all ${
                activeTab === 'file' ? 'border-blue-500 text-blue-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Verify File Integrity (Tamper Check)
            </button>
          </div>

          {activeTab === 'id' ? (
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. SKILL-2026-ML01"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Verify Proof'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Credential ID</label>
                <input
                  type="text"
                  placeholder="SKILL-2026-ML01"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white font-mono mb-3"
                />
              </div>
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Upload Certificate PDF to verify SHA-256 match</p>
                <p className="text-[11px] text-slate-500 mt-1">Computes hash in real-time and detects if any letter or grade was altered</p>
                <label className="mt-3 inline-block cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                  {uploadLoading ? 'Calculating Cryptographic Hash...' : 'Choose PDF File'}
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploadLoading} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {result && (
          <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all animate-fadeIn">
            
            {/* Top Status Banner */}
            <div className={`p-6 border-b flex items-center justify-between ${
              result.status === 'AUTHENTIC'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                : result.status === 'REVOKED'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-400'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {result.status === 'AUTHENTIC' && <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />}
                {result.status === 'REVOKED' && <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />}
                {result.status === 'HASH_MISMATCH' && <XCircle className="w-8 h-8 text-rose-400 shrink-0" />}
                {result.status === 'NOT_FOUND' && <XCircle className="w-8 h-8 text-rose-400 shrink-0" />}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                      {result.status === 'AUTHENTIC' && '✓ VERIFIED ON-CHAIN'}
                      {result.status === 'REVOKED' && '⚠ CREDENTIAL REVOKED'}
                      {result.status === 'HASH_MISMATCH' && '✕ DOCUMENT INTEGRITY FAILED'}
                      {result.status === 'NOT_FOUND' && '✕ CREDENTIAL NOT FOUND'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{result.message}</p>
                </div>
              </div>

              {result.is_valid && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={copyShareLink}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Credential Data Fields */}
            {result.status !== 'NOT_FOUND' && (
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-500">CREDENTIAL TITLE</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{result.title}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[11px] font-mono text-slate-500">RECIPIENT (STUDENT)</p>
                      <p className="text-sm font-semibold text-white">{result.student_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[11px] font-mono text-slate-500">ISSUED BY (INSTITUTION)</p>
                      <p className="text-sm font-semibold text-white">{result.institution_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[11px] font-mono text-slate-500">ISSUE DATE</p>
                      <p className="text-sm font-semibold text-white">
                        {result.issue_date ? new Date(result.issue_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[11px] font-mono text-slate-500">BLOCKCHAIN CONFIRMATION</p>
                      <p className="text-sm font-mono text-emerald-400">✓ EVM Confirmed</p>
                    </div>
                  </div>
                </div>

                {/* Technical Cryptographic Details */}
                <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">REGISTERED SHA-256 DIGEST</span>
                    <span className="text-blue-400 break-all select-all">{result.certificate_hash}</span>
                  </div>

                  {result.submitted_file_hash && (
                    <div>
                      <span className="text-slate-500 block text-[10px] mb-0.5">UPLOADED FILE SHA-256 DIGEST</span>
                      <span className="text-rose-400 break-all select-all">{result.submitted_file_hash}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block text-[10px] mb-0.5">BLOCKCHAIN TRANSACTION ANCHOR</span>
                    <span className="text-slate-300 break-all select-all">{result.blockchain_tx}</span>
                  </div>

                  {result.contract_address && (
                    <div>
                      <span className="text-slate-500 block text-[10px] mb-0.5">SMART CONTRACT REGISTRY</span>
                      <span className="text-slate-400 break-all select-all">{result.contract_address}</span>
                    </div>
                  )}
                </div>

                {/* Revocation Details */}
                {result.is_revoked && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-amber-300">Official Revocation Audit Notice:</p>
                    <p className="text-amber-200/90">{result.revocation_reason || 'Revoked by institution authority'}</p>
                    {result.revoked_at && (
                      <p className="text-[10px] text-amber-400/70 font-mono">
                        Revoked on: {new Date(result.revoked_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* QR Code and Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`${API_URL}/verify/${result.credential_id}/qr`}
                      alt="Verification QR"
                      className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">Verification QR</p>
                      <p className="text-[11px] text-slate-400">Scan on mobile to open live proof</p>
                      <a
                        href={`${API_URL}/verify/${result.credential_id}/qr`}
                        download={`${result.credential_id}_qr.png`}
                        className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                      >
                        <Download className="w-3 h-3" />
                        Download QR
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={copyShareLink}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Share Verification
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
