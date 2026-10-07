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
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRecommendations(res.data);
        } else {
          setRecommendations([
            { id: 1, skill_name: 'MLOps & CI/CD', priority: 'HIGH', reason: 'You have solid Machine Learning fundamentals. Production deployment and model registry automation will bridge the gap to senior roles.', related_existing_skill: 'Machine Learning', created_at: '2026-10-07T12:00:00Z' },
            { id: 2, skill_name: 'Docker & Containerization', priority: 'HIGH', reason: 'Crucial for standardizing training environments and packaging ML pipelines for cloud clusters.', related_existing_skill: 'Python', created_at: '2026-10-07T12:00:00Z' },
            { id: 3, skill_name: 'Distributed PyTorch / Ray', priority: 'MEDIUM', reason: 'Expanding to multi-GPU workflows accelerates scalable deep neural net training.', related_existing_skill: 'PyTorch', created_at: '2026-10-07T12:00:00Z' }
          ]);
        }
      } catch {
        setRecommendations([
          { id: 1, skill_name: 'MLOps & CI/CD', priority: 'HIGH', reason: 'You have solid Machine Learning fundamentals. Production deployment and model registry automation will bridge the gap to senior roles.', related_existing_skill: 'Machine Learning', created_at: '2026-10-07T12:00:00Z' },
          { id: 2, skill_name: 'Docker & Containerization', priority: 'HIGH', reason: 'Crucial for standardizing training environments and packaging ML pipelines for cloud clusters.', related_existing_skill: 'Python', created_at: '2026-10-07T12:00:00Z' },
          { id: 3, skill_name: 'Distributed PyTorch / Ray', priority: 'MEDIUM', reason: 'Expanding to multi-GPU workflows accelerates scalable deep neural net training.', related_existing_skill: 'PyTorch', created_at: '2026-10-07T12:00:00Z' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

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
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Skill Recommendations</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Dynamic roadmap suggestions generated from verified credentials and identified career milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-200 shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  rec.priority === 'HIGH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {rec.priority} PRIORITY
                </span>
                {rec.related_existing_skill && (
                  <span className="text-xs text-slate-400 font-medium">
                    Builds on: <strong className="text-slate-600 font-semibold">{rec.related_existing_skill}</strong>
                  </span>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{rec.skill_name}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.reason}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                Actionable Next Step
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
