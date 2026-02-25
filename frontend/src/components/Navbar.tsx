import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { Menu, X, Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: isAdminData, isLoading: adminLoading, isFetching: adminFetching } = useIsCallerAdmin();

  // Only show admin link when we have a definitive true result
  const showAdminLink = isAuthenticated && !adminLoading && !adminFetching && isAdminData === true;

  console.log('[Navbar] isAuthenticated:', isAuthenticated, 'adminLoading:', adminLoading, 'adminFetching:', adminFetching, 'isAdminData:', isAdminData, 'showAdminLink:', showAdminLink);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { label: 'My Results', path: '/results', requiresAuth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 group"
          >
            <img
              src="/assets/generated/concept-delta-logo.dim_256x256.png"
              alt="Concept Delta"
              className="h-9 w-9 object-contain"
            />
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-navy-200 transition-colors">
              Concept Delta
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks
              .filter((link) => !link.requiresAuth || isAuthenticated)
              .map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate({ to: link.path })}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-navy-700 text-white'
                      : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}

            {showAdminLink && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-300 hover:bg-navy-800 hover:text-amber-200'
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {!isInitializing && (
              <button
                onClick={handleAuth}
                disabled={isLoggingIn}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isAuthenticated
                    ? 'bg-navy-700 text-navy-200 hover:bg-navy-600 hover:text-white border border-navy-600'
                    : 'bg-white text-navy-900 hover:bg-navy-100'
                }`}
              >
                {isLoggingIn ? 'Logging in…' : isAuthenticated ? 'Logout' : 'Login'}
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-navy-200 hover:text-white p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 px-4 py-3 space-y-1">
          {navLinks
            .filter((link) => !link.requiresAuth || isAuthenticated)
            .map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate({ to: link.path });
                  setMobileOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-navy-700 text-white'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}

          {showAdminLink && (
            <button
              onClick={() => {
                navigate({ to: '/admin' });
                setMobileOpen(false);
              }}
              className={`w-full text-left flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-300 hover:bg-navy-800 hover:text-amber-200'
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </button>
          )}

          <div className="pt-2 border-t border-navy-700">
            {!isInitializing && (
              <button
                onClick={() => {
                  handleAuth();
                  setMobileOpen(false);
                }}
                disabled={isLoggingIn}
                className={`w-full px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 ${
                  isAuthenticated
                    ? 'bg-navy-700 text-navy-200 hover:bg-navy-600 border border-navy-600'
                    : 'bg-white text-navy-900 hover:bg-navy-100'
                }`}
              >
                {isLoggingIn ? 'Logging in…' : isAuthenticated ? 'Logout' : 'Login'}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
