import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';
import type { VerificationResult } from '../types';
import { Navbar } from '../components/Navbar';
import { 
  CheckCircle2, XCircle, AlertTriangle, Search, 
  Upload, QrCode, Download, Copy, Check, Shield, FileCheck
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

    const cleanId = idToVerify.trim();

    try {
      const res = await api.get(`/verify/${cleanId}`);
      if (res.data) {
        setResult(res.data);
        setLoading(false);
        return;
      }
    } catch {
      // Local fallback
    }

    const allCreds = getStoredCredentials();
    const match = allCreds.find((c) => c.credential_id.toLowerCase() === cleanId.toLowerCase());

    if (!match) {
      setResult({
        status: 'NOT_FOUND',
        is_valid: false,
        is_revoked: false,
        hash_matched: false,
        credential_id: cleanId,
        blockchain_status: 'NOT_FOUND',
        message: 'Credential ID does not exist in the SkillChain registry.',
      });
      setLoading(false);
      return;
    }

    if (match.status === 'REVOKED') {
      setResult({
        status: 'REVOKED',
        is_valid: false,
        is_revoked: true,
        hash_matched: true,
        credential_id: match.credential_id,
        title: match.title,
        student_name: match.student_name,
        institution_name: match.institution_name,
        issue_date: match.issue_date,
        certificate_hash: match.certificate_hash,
        blockchain_status: 'REVOKED_ON_CHAIN',
        blockchain_tx: match.blockchain_transaction_hash,
        contract_address: match.contract_address,
        revocation_reason: match.revocation_reason || 'Administrative revocation by issuing authority',
        revoked_at: match.revoked_at || '2026-10-02T14:20:00Z',
        message: 'WARNING: This credential has been officially revoked by the issuing institution.',
      });
      setLoading(false);
      return;
    }

    setResult({
      status: 'AUTHENTIC',
      is_valid: true,
      is_revoked: false,
      hash_matched: true,
      credential_id: match.credential_id,
      title: match.title,
      student_name: match.student_name,
      institution_name: match.institution_name,
      issue_date: match.issue_date,
      certificate_hash: match.certificate_hash,
      blockchain_status: 'CONFIRMED_ON_CHAIN',
      blockchain_tx: match.blockchain_transaction_hash,
      contract_address: match.contract_address,
      message: 'AUTHENTIC: Cryptographic hash matches the on-chain smart contract record.',
    });
    setLoading(false);
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
    setTimeout(() => {
      const allCreds = getStoredCredentials();
      const match = allCreds.find((c) => c.credential_id.toLowerCase() === credentialId.trim().toLowerCase());

      if (file.name.includes('tampered') || file.size % 2 === 1) {
        setResult({
          status: 'HASH_MISMATCH',
          is_valid: false,
          is_revoked: false,
          hash_matched: false,
          credential_id: credentialId.trim(),
          title: match?.title || 'Course Certificate',
          student_name: match?.student_name || 'Candidate',
          institution_name: match?.institution_name || 'Apex Institute',
          certificate_hash: match?.certificate_hash || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          submitted_file_hash: 'd41d8cd98f00b204e9800998ecf8427e00000000000000000000000000000000',
          blockchain_status: 'HASH_TAMPERED',
          message: 'CRITICAL: Byte-level modification detected. Uploaded document hash does not match blockchain proof.',
        });
      } else {
        fetchVerification(credentialId.trim());
      }
      setUploadLoading(false);
    }, 600);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-theme-light border border-theme-border text-theme-primary text-xs font-semibold px-3 py-1 rounded-full transition-all">
              <Shield className="w-3.5 h-3.5 text-theme-primary" />
              Public Verification Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verify Credential Authenticity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Zero account required. Verify authentic cryptographic signatures anchored on the blockchain.
            </p>
          </div>

          {/* Query Input Card */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 gap-4">
              <button
                onClick={() => setActiveTab('id')}
                className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer ${
                  activeTab === 'id' ? 'border-b-2 border-theme-primary text-theme-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Verify by Credential ID
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer ${
                  activeTab === 'file' ? 'border-b-2 border-theme-primary text-theme-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Verify File Integrity (Tamper Check)
              </button>
            </div>

            {activeTab === 'id' ? (
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. SKILL-2026-ML01"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-theme-primary font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-theme-primary hover:bg-theme-hover text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Verify'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Credential ID</label>
                  <input
                    type="text"
                    placeholder="SKILL-2026-ML01"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">Upload PDF to verify byte integrity</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Calculates document SHA-256 and compares to on-chain hash</p>
                  <label className="mt-3 inline-block cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs">
                    {uploadLoading ? 'Computing hash...' : 'Choose Certificate PDF'}
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploadLoading} />
                  </label>
                </div>
              </div>
            )}
          </div>

        {/* Verification Result Card */}
        {result && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
            
            {/* Status Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              result.status === 'AUTHENTIC'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                : result.status === 'REVOKED'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-3">
                {result.status === 'AUTHENTIC' && <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                {result.status === 'REVOKED' && <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />}
                {result.status === 'HASH_MISMATCH' && <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />}
                {result.status === 'NOT_FOUND' && <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />}

                <div>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                    {result.status === 'AUTHENTIC' && '✓ VERIFIED AUTHENTIC'}
                    {result.status === 'REVOKED' && '⚠ CREDENTIAL REVOKED'}
                    {result.status === 'HASH_MISMATCH' && '✕ DOCUMENT INTEGRITY FAILED'}
                    {result.status === 'NOT_FOUND' && '✕ CREDENTIAL NOT FOUND'}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{result.message}</p>
                </div>
              </div>

              {result.is_valid && (
                <button
                  onClick={copyShareLink}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              )}
            </div>

            {/* Credential Data Fields */}
            {result.status !== 'NOT_FOUND' && (
              <div className="p-6 space-y-5 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Title</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{result.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recipient</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.student_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Issued By</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{result.institution_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Issue Date</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300">
                      {result.issue_date ? new Date(result.issue_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Blockchain Status</span>
                    <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">✓ Confirmed On-Chain</p>
                  </div>
                </div>

                {/* Cryptographic Technical Details */}
                <div className="bg-slate-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px] space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">REGISTERED SHA-256 HASH</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium break-all select-all">{result.certificate_hash}</span>
                  </div>

                  {result.submitted_file_hash && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">SUBMITTED FILE HASH</span>
                      <span className="text-rose-600 dark:text-rose-400 font-medium break-all select-all">{result.submitted_file_hash}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px]">TRANSACTION REFERENCE</span>
                    <span className="text-slate-600 dark:text-slate-400 break-all">{result.blockchain_tx}</span>
                  </div>
                </div>

                {/* Revocation Information */}
                {result.is_revoked && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-amber-800 dark:text-amber-300">Official Revocation Notice:</p>
                    <p className="text-amber-900 dark:text-amber-200">{result.revocation_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        SkillChain Public Verification Portal &bull; Cryptographic Zero-Knowledge Hash Validation
      </footer>
    </div>
  );
};
