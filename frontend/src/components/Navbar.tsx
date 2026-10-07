import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  minimal?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ minimal = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#161b22] border-b border-[#30363d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white font-bold">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white tracking-tight">SkillChain</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">v1.0</span>
            </div>
          </div>
        </Link>

        {/* Navigation Actions */}
        {!minimal && (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/verify"
              className="text-xs font-medium text-[#c9d1d9] hover:text-white px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors flex items-center gap-1.5 border border-[#30363d]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
              Verify Certificate
            </Link>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#30363d]">
                {user.role === 'STUDENT' && (
                  <Link
                    to="/student/dashboard"
                    className="text-xs font-medium text-[#58a6ff] hover:underline"
                  >
                    Student Console
                  </Link>
                )}
                {user.role === 'INSTITUTION' && (
                  <Link
                    to="/institution/dashboard"
                    className="text-xs font-medium text-[#58a6ff] hover:underline"
                  >
                    Issuer Console
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs font-medium text-[#d29922] hover:underline"
                  >
                    Admin Console
                  </Link>
                )}

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] font-mono text-[#8b949e]">{user.role}</p>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-[#8b949e] hover:text-[#f85149] rounded-md hover:bg-[#21262d] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-[#c9d1d9] hover:text-white px-3 py-1.5 rounded-md hover:bg-[#21262d] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] px-3.5 py-1.5 rounded-md transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
