import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { SkillRecommendation } from '../types';
import { Compass, TrendingUp, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

export const StudentRecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/ai/recommendations');
        setRecommendations(res.data);
      } catch (err) {
        console.error('Failed to load recommendations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
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
          <Compass className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Skill Recommendations</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic roadmap suggestions generated from verified credentials and identified career milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-[#0f172a] p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  rec.priority === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                {rec.related_existing_skill && (
                  <span className="text-[11px] font-mono text-slate-500">
                    Builds on: {rec.related_existing_skill}
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-white mb-2">{rec.skill_name}</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{rec.reason}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Lightbulb className="w-4 h-4" />
                Actionable Next Step
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
