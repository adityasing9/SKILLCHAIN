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
    { to: '/student/credentials', label: 'Credentials', icon: Award },
    { to: '/student/skills', label: 'Skills Profile', icon: Sparkles },
    { to: '/student/resume', label: 'Resume Analysis', icon: FileText },
    { to: '/student/recommendations', label: 'Recommendations', icon: BarChart3 },
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/institution/issue', label: 'Issue Credential', icon: PlusCircle },
    { to: '/institution/credentials', label: 'Issued Records', icon: Award },
    { to: '/institution/students', label: 'Student Directory', icon: Users },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/institutions', label: 'Accredited Issuers', icon: UserCheck },
    { to: '/admin/activity', label: 'Audit Trail', icon: ShieldCheck },
  ];

  const links = role === 'STUDENT' ? studentLinks : role === 'INSTITUTION' ? institutionLinks : adminLinks;

  return (
    <aside className="w-60 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-1.5">
        <div className="px-3 py-1 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            {role} Portal
          </span>
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon className="w-4 h-4 text-slate-500" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          EVM Registry Live
        </div>
        <p className="text-slate-400 text-[11px] font-mono">Hardhat Local &bull; 31337</p>
      </div>
    </aside>
  );
};
