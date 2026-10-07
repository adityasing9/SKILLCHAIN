import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PlusCircle, Upload, CheckCircle2, AlertCircle, FileText, Lock, Sparkles } from 'lucide-react';

export const IssueCredentialPage: React.FC = () => {
  const [studentId, setStudentId] = useState('STU-2026-001'); // Defaults to demo student Alex Rivera
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [credentialType, setCredentialType] = useState('Certificate');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessData(null);

    const formData = new FormData();
    formData.append('student_identifier', studentId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('credential_type', credentialType);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await api.post('/credentials/issue', formData);
      setSuccessData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to issue credential on blockchain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Issue Academic Credential</h1>
        <p className="text-xs text-slate-400 mt-1">
          Compute document SHA-256 hash and anchor cryptographic proof directly on the EVM smart contract
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successData ? (
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Credential Successfully Issued & Anchored!</h2>
            <p className="text-xs text-slate-400 mt-1">Cryptographic proof is active on the blockchain network</p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left font-mono text-xs space-y-2">
            <div>
              <span className="text-slate-500 block text-[10px]">CREDENTIAL ID</span>
              <span className="text-blue-400 font-bold">{successData.credential_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SHA-256 CERTIFICATE HASH</span>
              <span className="text-slate-300 break-all">{successData.certificate_hash}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">BLOCKCHAIN TRANSACTION HASH</span>
              <span className="text-emerald-400 break-all">{successData.blockchain_transaction_hash}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessData(null);
                setTitle('');
                setDescription('');
                setFile(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white transition-colors"
            >
              Issue Another
            </button>
            <button
              onClick={() => navigate(`/verify/${successData.credential_id}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white transition-colors"
            >
              View Public Proof Card &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 shadow-xl">
          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Student Identifier or Email
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="STU-2026-001 or alex@student.edu"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Demo students are STU-2026-001 (Alex), STU-2026-002 (Sarah), STU-2026-003 (David)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Credential Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Advanced Deep Learning & PyTorch"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Credential Type</label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Certificate">Certificate</option>
                  <option value="Internship">Internship</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Course">Course</option>
                  <option value="Award">Award</option>
                  <option value="Project">Project</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description / Syllabi</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Include key skills covered (e.g. Python, PyTorch, Docker) to trigger automated AI skill extraction"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Certificate PDF (Optional)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                If omitted, an official SkillChain tamper-proof PDF certificate is automatically generated.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Anchoring Proof to EVM Smart Contract...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Issue & Register on Blockchain
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
