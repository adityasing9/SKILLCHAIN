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
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar role={role} />
        <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
