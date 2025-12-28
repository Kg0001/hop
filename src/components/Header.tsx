"use client";

import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-vitBlue text-white shadow-md">
      <div className="container-narrow px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hop On</h1>
            <p className="text-sm opacity-90">VIT Cab Sharing</p>
          </div>
          {isLoggedIn && (
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-white/20 border border-white/30 rounded-full hover:bg-white/30 transition-colors duration-200"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
