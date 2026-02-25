import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsCallerAdmin, useClaimAdmin } from '../hooks/useQueries';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsCallerAdmin();
  const claimAdminMutation = useClaimAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
        // After successful login, attempt to claim admin.
        // If no admin exists yet, this principal becomes the admin.
        // If admin already exists and this is the same principal, it's a no-op.
        // If admin already exists and this is a different principal, the error is silently caught.
        try {
          await claimAdminMutation.mutateAsync();
        } catch {
          // Another principal is already admin — this is expected for non-admin users.
        }
      } catch (error: any) {
        if (error?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <img
              src="/assets/generated/concept-delta-logo.dim_256x256.png"
              alt="Concept Delta Logo"
              className="h-9 w-9 object-contain"
            />
            <span className="text-white font-bold text-xl tracking-tight">
              Concept Delta
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-navy-100 hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="text-navy-100 hover:text-white transition-colors text-sm font-medium"
              >
                Dashboard
              </button>
            )}
            {isAuthenticated && isAdmin === true && (
              <button
                onClick={() => navigate({ to: '/admin' })}
                className="text-navy-100 hover:text-white transition-colors text-sm font-medium"
              >
                Admin Panel
              </button>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant="outline"
              size="sm"
              className="border-white/30 text-white bg-white/10 hover:bg-white hover:text-navy transition-all font-medium"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : isAuthenticated ? (
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </span>
              )}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-dark border-t border-white/10 px-4 py-3 space-y-2">
          <button
            onClick={() => { navigate({ to: '/' }); setMenuOpen(false); }}
            className="block w-full text-left text-navy-100 hover:text-white py-2 text-sm font-medium"
          >
            Home
          </button>
          {isAuthenticated && (
            <button
              onClick={() => { navigate({ to: '/dashboard' }); setMenuOpen(false); }}
              className="block w-full text-left text-navy-100 hover:text-white py-2 text-sm font-medium"
            >
              Dashboard
            </button>
          )}
          {isAuthenticated && isAdmin === true && (
            <button
              onClick={() => { navigate({ to: '/admin' }); setMenuOpen(false); }}
              className="block w-full text-left text-navy-100 hover:text-white py-2 text-sm font-medium"
            >
              Admin Panel
            </button>
          )}
          <Button
            onClick={() => { handleAuth(); setMenuOpen(false); }}
            disabled={isLoggingIn}
            className="w-full bg-white text-navy hover:bg-navy-100 font-medium"
          >
            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      )}
    </nav>
  );
}
