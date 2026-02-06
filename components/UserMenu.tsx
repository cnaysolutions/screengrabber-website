'use client'

import React, { useState } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UserMenuProps {
  onLoginClick: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({ onLoginClick }) => {
  const { user, loading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
        data-testid="header-login-btn"
      >
        <User className="w-5 h-5" />
        Sign In
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full hover:bg-orange-100 transition-all"
        data-testid="user-menu-button"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <span className="text-gray-800 font-medium max-w-[150px] truncate" data-testid="user-email-display">
          {user.email}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up" data-testid="user-dropdown">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b">
              <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
              <p className="text-sm text-gray-600 truncate" data-testid="dropdown-user-email">{user.email}</p>
              {user.is_pro && (
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  ✨ Pro User
                </span>
              )}
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
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
  )
}

export default UserMenu
