'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { canAccess, ROLES } from '@/lib/roles';
import {
  LayoutDashboard, Leaf, Users, Trophy, Shield, Award, Gift,
  GitBranch, Target, ClipboardList, Activity, Medal,
  ChevronDown, ChevronRight, X, LogOut, BarChart3
} from 'lucide-react';
import { useState, useMemo } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
  {
    label: 'Environmental', icon: Leaf, roles: ['admin', 'manager'],
    children: [
      { href: '/environmental', label: 'Carbon Transactions' },
      { href: '/environmental/goals', label: 'Sustainability Goals' },
      { href: '/environmental/vendors', label: 'Vendors' },
    ]
  },
  {
    label: 'Social', icon: Users, roles: ['admin', 'manager', 'employee'],
    children: [
      { href: '/social', label: 'CSR Activities' },
      { href: '/social/participations', label: 'Participations' },
    ]
  },
  { href: '/challenges', label: 'Challenges', icon: Target, roles: ['admin', 'manager', 'employee'] },
  { href: '/analytics', label: 'Analytics', icon: Activity, roles: ['admin', 'manager'] },
  {
    label: 'Gamification', icon: Trophy, roles: ['admin', 'manager', 'employee'],
    children: [
      { href: '/gamification/leaderboard', label: 'Leaderboard' },
      { href: '/gamification/badges', label: 'Badges' },
      { href: '/gamification/rewards', label: 'Rewards' },
    ]
  },
  {
    label: 'Governance', icon: Shield, roles: ['admin', 'manager'],
    children: [
      { href: '/governance/policies', label: 'Policies' },
      { href: '/governance/compliance', label: 'Compliance' },
    ]
  },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState({});

  const filteredItems = useMemo(() => {
    if (!user) return [];
    return menuItems.filter(item => {
      const hasAccess = canAccess(user.role, item.roles);
      if (!hasAccess) return false;
      if (item.children) {
        const visibleChildren = item.children.filter(c => canAccess(user.role, c.roles || item.roles));
        return visibleChildren.length > 0;
      }
      return true;
    });
  }, [user]);

  const toggleExpand = (label) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href) => pathname === href;
  const isChildActive = (children) => children?.some(c => pathname === c.href);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-400" />
            <span className="font-bold text-lg">EcoSphere</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-700 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.map((item) => {
            if (item.children) {
              const active = isChildActive(item.children);
              const open = expanded[item.label] || active;
              const Icon = item.icon;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {open && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Link key={child.href} href={child.href} onClick={onClose}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive(child.href) ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
