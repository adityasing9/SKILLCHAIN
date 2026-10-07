import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { SkillItem } from '../types';
import { Sparkles, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export const StudentSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await api.get('/ai/skills');
        setSkills(res.data);
      } catch (err) {
        console.error('Failed to load skills', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Skill Intelligence Profile</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Extracted directly from verified on-chain credentials and parsed resumes with machine learning confidence scores
        </p>
      </div>

      <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-xs text-indigo-200">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">AI-Estimated Statistical Confidence:</span>
          <p className="mt-0.5 text-indigo-300/90 leading-relaxed">
            These percentages indicate the algorithmic confidence derived from verifiable project descriptions, coursework, and internship records. They are not official accredited ratings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {skill.category}
                </span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {skill.confidence_percentage}%
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{skill.skill_name}</h3>
            </div>

            <div className="space-y-2 mt-4">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${skill.confidence_percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Source: {skill.source.replace('_', ' ')}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
