import React, { useState } from 'react';
import api from '../services/api';
import type { ResumeAnalysisResult } from '../types';
import { 
  FileText, Upload, Sparkles, AlertCircle, CheckCircle2, 
  ArrowRight, Briefcase, FolderGit2, AlertTriangle, Layers 
} from 'lucide-react';

export const StudentResumePage: React.FC = () => {
  const [targetCareer, setTargetCareer] = useState('Machine Learning Engineer');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('target_career', targetCareer);
    formData.append('file', file);

    try {
      const res = await api.post('/ai/resume-analysis', formData);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Resume analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Resume & Gap Intelligence</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Upload your resume PDF to extract skills, experience, and evaluate readiness against benchmark career profiles
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Form Section */}
      <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
        <form onSubmit={handleUploadAndAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Career Benchmark</label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="Blockchain Developer">Blockchain Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Resume File (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing NLP & Extracting Skill Vector...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Resume Intelligence
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* AI Executive Summary */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-mono uppercase text-indigo-400 block mb-1">AI EXECUTIVE SUMMARY</span>
            <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
          </div>

          {/* Detected Skills vs Skill Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Detected Skills */}
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Detected Competencies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.detected_skills.map((s: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <span className="text-white font-medium">{s.skill_name}</span>
                    <span className="text-[11px] font-mono text-indigo-400">{s.confidence_percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Identified Skill Gaps ({targetCareer})</h3>
              </div>
              <div className="space-y-3">
                {result.skill_gaps.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="font-semibold text-amber-300">{gap.target_skill}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{gap.recommended_action}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Detected Experiences & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Experience Milestones</h3>
              </div>
              <div className="space-y-3">
                {result.experience.map((exp: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <p className="font-semibold text-white">{exp.role}</p>
                    <p className="text-[11px] font-mono text-slate-500">{exp.duration}</p>
                    <p className="text-slate-400 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <FolderGit2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Verified Projects</h3>
              </div>
              <div className="space-y-3">
                {result.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <p className="font-semibold text-white">{proj.title}</p>
                    <p className="text-[11px] font-mono text-purple-400">{proj.tech_stack}</p>
                    <p className="text-slate-400 mt-1">{proj.highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
