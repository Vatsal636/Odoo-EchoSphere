'use client';

import { Menu, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/lib/auth';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center justify-between lg:ml-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        <span className="text-sm text-gray-500">Welcome back, <span className="font-semibold text-gray-800">{user?.name?.split(' ')[0] || 'User'}</span></span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {user?.totalXp || 0} XP
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
