import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  role: 'STUDENT' | 'INSTITUTION' | 'ADMIN';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#8b949e] font-mono">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col text-[#c9d1d9]">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar role={role} />
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
