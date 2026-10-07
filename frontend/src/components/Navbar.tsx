import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  minimal?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ minimal = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-theme-primary flex items-center justify-center text-white shadow-xs transition-colors">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SkillChain</span>
        </Link>

        {/* Navigation Actions */}
        {!minimal && (
          <nav className="flex items-center gap-2 sm:gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              About
            </Link>
            <Link
              to="/verify"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              Verify Proof
            </Link>

            {/* Theme Picker */}
            <ThemeSelector />

            {user ? (
              <div className="flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
                {user.role === 'STUDENT' && (
                  <Link
                    to="/student/dashboard"
                    className="text-xs sm:text-sm font-semibold text-theme-primary hover:opacity-80"
                  >
                    Student Portal
                  </Link>
                )}
                {user.role === 'INSTITUTION' && (
                  <Link
                    to="/institution/dashboard"
                    className="text-xs sm:text-sm font-semibold text-theme-primary hover:opacity-80"
                  >
                    Issuer Portal
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Admin Console
                  </Link>
                )}

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{user.role}</p>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold text-white bg-theme-primary hover:bg-theme-hover px-3 sm:px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
