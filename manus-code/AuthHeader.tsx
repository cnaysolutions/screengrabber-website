// ============================================
// FILE: client/src/components/AuthHeader.tsx
// Copy this file to your Manus project
// ============================================

import React, { useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Manus OAuth Login URL - this redirects to Manus authentication
const MANUS_LOGIN_URL = '/api/auth/login';

export const AuthHeader: React.FC = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <a
        href={MANUS_LOGIN_URL}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
        data-testid="header-login-btn"
      >
        <User className="w-5 h-5" />
        Sign In
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full hover:bg-orange-100 transition-all"
        data-testid="user-menu-button"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
          {(user.email || user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <span className="text-gray-800 font-medium max-w-[150px] truncate" data-testid="user-email-display">
          {user.email || user.name || 'User'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)} 
          />
          <div 
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden"
            data-testid="user-dropdown"
          >
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b">
              <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
              <p className="text-sm text-gray-600 truncate" data-testid="dropdown-user-email">
                {user.email || 'No email'}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                data-testid="logout-button"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthHeader;
