import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Menu, X, ShieldCheck, LayoutDashboard, Home, LogIn, LogOut, Loader2 } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: isAdminData, isLoading: adminLoading, isFetching: adminFetching } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const isAdmin = isAuthenticated && isAdminData === true && !adminLoading && !adminFetching;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy-900 shadow-lg border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity shrink-0"
          >
            <img
              src="/assets/generated/concept-delta-logo.dim_256x256.png"
              alt="Concept Delta"
              className="h-8 w-8 object-contain"
            />
            <span className="hidden sm:block whitespace-nowrap">Concept Delta</span>
          </button>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1 flex-nowrap overflow-visible">
            {/* Home – always visible */}
            <button
              onClick={() => navigate({ to: '/' })}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                isActive('/')
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-200 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Home size={15} />
              Home
            </button>

            {/* Dashboard – authenticated only */}
            {isAuthenticated && (
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive('/dashboard')
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
            )}

            {/* Admin Panel – authenticated + admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive('/admin')
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <ShieldCheck size={15} />
                Admin Panel
              </button>
            )}
          </div>

          {/* ── Right Side: Auth Button + Mobile Toggle ── */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            {/* Login / Logout button – always rendered, shows spinner during init */}
            <button
              onClick={handleAuth}
              disabled={isLoggingIn || isInitializing}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 whitespace-nowrap ${
                isAuthenticated
                  ? 'bg-navy-700 hover:bg-navy-600 text-white border border-navy-500'
                  : 'bg-white hover:bg-navy-100 text-navy-900'
              }`}
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span className="hidden sm:inline">{isLoggingIn ? 'Logging in...' : 'Loading...'}</span>
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut size={14} />
                  <span>Logout</span>
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  <span>Login</span>
                </>
              )}
            </button>

            {/* Mobile hamburger – always visible on small screens */}
            <button
              className="md:hidden flex items-center justify-center text-navy-200 hover:text-white p-2 rounded-md hover:bg-navy-800 transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-3 space-y-1 z-50 relative shadow-xl">
          {/* Home – always */}
          <button
            onClick={() => { navigate({ to: '/' }); closeMobile(); }}
            className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-navy-700 text-white'
                : 'text-navy-200 hover:bg-navy-700 hover:text-white'
            }`}
          >
            <Home size={16} />
            Home
          </button>

          {/* Dashboard – authenticated only */}
          {isAuthenticated && (
            <button
              onClick={() => { navigate({ to: '/dashboard' }); closeMobile(); }}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-200 hover:bg-navy-700 hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          )}

          {/* Admin Panel – authenticated + admin only */}
          {isAdmin && (
            <button
              onClick={() => { navigate({ to: '/admin' }); closeMobile(); }}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-200 hover:bg-navy-700 hover:text-white'
              }`}
            >
              <ShieldCheck size={16} />
              Admin Panel
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-navy-600 my-2" />

          {/* Auth action in mobile menu */}
          <button
            onClick={() => { handleAuth(); closeMobile(); }}
            disabled={isLoggingIn || isInitializing}
            className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-60 ${
              isAuthenticated
                ? 'text-navy-200 hover:bg-navy-700 hover:text-white'
                : 'text-white bg-navy-600 hover:bg-navy-500'
            }`}
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isLoggingIn ? 'Logging in...' : 'Loading...'}
              </>
            ) : isAuthenticated ? (
              <>
                <LogOut size={16} />
                Logout
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
