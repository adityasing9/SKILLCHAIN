import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, GraduationCap } from 'lucide-react';

export const InstitutionStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (query = '') => {
    try {
      const res = await api.get(`/institutions/students?search=${encodeURIComponent(query)}`);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Search enrolled students to issue verifiable credentials</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, roll no, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((stud) => (
          <div key={stud.student_id} className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                  {stud.student_identifier}
                </span>
                <span className="text-xs font-mono text-slate-400">Class of {stud.graduation_year}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">{stud.name}</h3>
              <p className="text-xs text-slate-400">{stud.email}</p>
              <p className="text-xs text-slate-500 mt-2">{stud.course}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{stud.total_credentials} credentials issued</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
