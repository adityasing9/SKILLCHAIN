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
    <aside className="w-56 bg-[#161b22] border-r border-[#30363d] min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold text-[#8b949e] px-2.5 py-1 mb-1 font-mono uppercase tracking-wider">
          {role}
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#21262d] text-white border-l-2 border-[#1f6feb]'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]/50'
                }`
              }
            >
              <Icon className="w-4 h-4 text-[#8b949e]" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-2.5 bg-[#0d1117] rounded-md border border-[#30363d] text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 text-[#3fb950] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]"></span>
          EVM Registry Online
        </div>
        <p className="text-[#8b949e] text-[10px]">ChainID: 31337</p>
      </div>
    </aside>
  );
};
