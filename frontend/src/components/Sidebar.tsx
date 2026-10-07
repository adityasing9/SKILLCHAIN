import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Award, Sparkles, FileText, UserCheck, 
  PlusCircle, Users, BarChart3, ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'INSTITUTION' | 'ADMIN';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const studentLinks = [
    { to: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/student/credentials', label: 'My Credentials', icon: Award },
    { to: '/student/skills', label: 'AI Skill Profile', icon: Sparkles },
    { to: '/student/resume', label: 'Resume Intelligence', icon: FileText },
    { to: '/student/recommendations', label: 'Career Roadmaps', icon: BarChart3 },
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Issuer Dashboard', icon: LayoutDashboard },
    { to: '/institution/issue', label: 'Issue Credential', icon: PlusCircle },
    { to: '/institution/credentials', label: 'Issued Credentials', icon: Award },
    { to: '/institution/students', label: 'Student Directory', icon: Users },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Metrics', icon: LayoutDashboard },
    { to: '/admin/institutions', label: 'Accredited Issuers', icon: UserCheck },
    { to: '/admin/activity', label: 'Verification Logs', icon: ShieldCheck },
  ];

  const links = role === 'STUDENT' ? studentLinks : role === 'INSTITUTION' ? institutionLinks : adminLinks;

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2 font-mono">
          {role} CONSOLE
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Hardhat Localhost
        </div>
        <p className="text-slate-400 text-[10px]">EVM ChainID 31337 Online</p>
      </div>
    </aside>
  );
};
