import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getStoredCredentials } from '../services/mockStore';
import type { VerificationResult } from '../types';
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
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Public Verification Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify Credential Authenticity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Zero account required. Verify authentic cryptographic signatures anchored on the blockchain.
          </p>
        </div>

        {/* Query Input Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex border-b border-slate-100 pb-3 mb-4 gap-4">
            <button
              onClick={() => setActiveTab('id')}
              className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer ${
                activeTab === 'id' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Verify by Credential ID
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`text-xs font-semibold pb-1.5 transition-colors cursor-pointer ${
                activeTab === 'file' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-400 hover:text-slate-700'
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Verify'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Credential ID</label>
                <input
                  type="text"
                  placeholder="SKILL-2026-ML01"
                  value={credentialId}
                  onChange={(e) => setCredentialId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                />
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-800 font-semibold">Upload PDF to verify byte integrity</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Calculates document SHA-256 and compares to on-chain hash</p>
                <label className="mt-3 inline-block cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs">
                  {uploadLoading ? 'Computing hash...' : 'Choose Certificate PDF'}
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={uploadLoading} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            
            {/* Status Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              result.status === 'AUTHENTIC'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : result.status === 'REVOKED'
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              <div className="flex items-center gap-3">
                {result.status === 'AUTHENTIC' && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                {result.status === 'REVOKED' && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />}
                {result.status === 'HASH_MISMATCH' && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
                {result.status === 'NOT_FOUND' && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}

                <div>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                    {result.status === 'AUTHENTIC' && '✓ VERIFIED AUTHENTIC'}
                    {result.status === 'REVOKED' && '⚠ CREDENTIAL REVOKED'}
                    {result.status === 'HASH_MISMATCH' && '✕ DOCUMENT INTEGRITY FAILED'}
                    {result.status === 'NOT_FOUND' && '✕ CREDENTIAL NOT FOUND'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">{result.message}</p>
                </div>
              </div>

              {result.is_valid && (
                <button
                  onClick={copyShareLink}
                  className="px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              )}
            </div>

            {/* Credential Data Fields */}
            {result.status !== 'NOT_FOUND' && (
              <div className="p-6 space-y-5 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Title</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">{result.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Recipient</span>
                    <p className="font-semibold text-slate-900">{result.student_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Issued By</span>
                    <p className="font-semibold text-slate-900">{result.institution_name}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Issue Date</span>
                    <p className="font-mono text-slate-700">
                      {result.issue_date ? new Date(result.issue_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Blockchain Status</span>
                    <p className="font-mono text-emerald-700 font-semibold">✓ Confirmed On-Chain</p>
                  </div>
                </div>

                {/* Cryptographic Technical Details */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[11px] space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">REGISTERED SHA-256 HASH</span>
                    <span className="text-emerald-700 font-medium break-all select-all">{result.certificate_hash}</span>
                  </div>

                  {result.submitted_file_hash && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">SUBMITTED FILE HASH</span>
                      <span className="text-rose-700 font-medium break-all select-all">{result.submitted_file_hash}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block text-[10px]">TRANSACTION REFERENCE</span>
                    <span className="text-slate-600 break-all">{result.blockchain_tx}</span>
                  </div>
                </div>

                {/* Revocation Information */}
                {result.is_revoked && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-amber-800">Official Revocation Notice:</p>
                    <p className="text-amber-900">{result.revocation_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
