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

  const { data: isAdminData } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const isAdmin = isAuthenticated && isAdminData === true;

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

  // Solid navy background color — always opaque, never transparent
  const navBg = '#0D1B4B';
  const navBgDark = '#091236';
  const navBgHover = '#162060';
  const navBgActive = '#1a2870';
  const navBorder = '#1e2f6b';

  return (
    <nav
      className="sticky top-0 z-50 shadow-lg"
      style={{ backgroundColor: navBg, borderBottom: `1px solid ${navBorder}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity shrink-0"
            style={{ color: '#ffffff' }}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                color: isActive('/') ? '#ffffff' : '#a8b8e8',
                backgroundColor: isActive('/') ? navBgActive : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isActive('/')) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = navBgHover;
                  (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                }
              }}
              onMouseLeave={e => {
                if (!isActive('/')) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#a8b8e8';
                }
              }}
            >
              <Home size={15} />
              Home
            </button>

            {/* Dashboard – authenticated only */}
            {isAuthenticated && (
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive('/dashboard') ? '#ffffff' : '#a8b8e8',
                  backgroundColor: isActive('/dashboard') ? navBgActive : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive('/dashboard')) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = navBgHover;
                    (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive('/dashboard')) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#a8b8e8';
                  }
                }}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </button>
            )}

            {/* Admin Panel – authenticated + admin only */}
            {isAdmin && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                style={{
                  color: isActive('/admin') ? '#ffffff' : '#a8b8e8',
                  backgroundColor: isActive('/admin') ? navBgActive : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive('/admin')) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = navBgHover;
                    (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive('/admin')) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#a8b8e8';
                  }
                }}
              >
                <ShieldCheck size={15} />
                Admin Panel
              </button>
            )}
          </div>

          {/* ── Right Side: Auth Button + Mobile Toggle ── */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            {/* Login / Logout button – always rendered */}
            <button
              onClick={handleAuth}
              disabled={isLoggingIn || isInitializing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 whitespace-nowrap"
              style={
                isAuthenticated
                  ? { backgroundColor: navBgHover, color: '#ffffff', border: `1px solid ${navBorder}` }
                  : { backgroundColor: '#ffffff', color: navBg }
              }
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
              className="md:hidden flex items-center justify-center p-2 rounded-md transition-colors"
              style={{ color: '#a8b8e8' }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = navBgHover;
                (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = '#a8b8e8';
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1 z-50 relative shadow-xl"
          style={{ backgroundColor: navBgDark, borderTop: `1px solid ${navBorder}` }}
        >
          {/* Home – always */}
          <button
            onClick={() => { navigate({ to: '/' }); closeMobile(); }}
            className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors"
            style={{
              color: isActive('/') ? '#ffffff' : '#a8b8e8',
              backgroundColor: isActive('/') ? navBgActive : 'transparent',
            }}
          >
            <Home size={16} />
            Home
          </button>

          {/* Dashboard – authenticated only */}
          {isAuthenticated && (
            <button
              onClick={() => { navigate({ to: '/dashboard' }); closeMobile(); }}
              className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors"
              style={{
                color: isActive('/dashboard') ? '#ffffff' : '#a8b8e8',
                backgroundColor: isActive('/dashboard') ? navBgActive : 'transparent',
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          )}

          {/* Admin Panel – authenticated + admin only */}
          {isAdmin && (
            <button
              onClick={() => { navigate({ to: '/admin' }); closeMobile(); }}
              className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors"
              style={{
                color: isActive('/admin') ? '#ffffff' : '#a8b8e8',
                backgroundColor: isActive('/admin') ? navBgActive : 'transparent',
              }}
            >
              <ShieldCheck size={16} />
              Admin Panel
            </button>
          )}

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${navBorder}`, margin: '8px 0' }} />

          {/* Auth action in mobile menu */}
          <button
            onClick={() => { handleAuth(); closeMobile(); }}
            disabled={isLoggingIn || isInitializing}
            className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-60"
            style={
              isAuthenticated
                ? { color: '#a8b8e8', backgroundColor: 'transparent' }
                : { color: '#ffffff', backgroundColor: navBgHover }
            }
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
