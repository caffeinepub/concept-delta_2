import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import Navbar from '../components/Navbar';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Button } from '@/components/ui/button';
import { SiTelegram, SiYoutube } from 'react-icons/si';
import { BookOpen, Target, Trophy, Zap } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile !== null) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, navigate]);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {showProfileSetup && (
        <ProfileSetupModal onComplete={() => navigate({ to: '/dashboard' })} />
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-dark to-navy-deeper">
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/generated/hero-bg.dim_1440x600.png')" }}
        />
        {/* Geometric decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              100% Free · No Registration Fee
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              Free MHT-CET
              <span className="block text-sky-300">Mock Tests</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-3 font-medium">
              Created by COEPians – COEP Technological University,
              one of the top engineering colleges in Maharashtra
            </p>

            <p className="text-white/60 text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
              Practice smarter with expertly crafted mock tests designed to mirror the actual MHT-CET exam.
              Track your progress, identify weak areas, and boost your score — all for free.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                onClick={handleCTA}
                disabled={isLoggingIn}
                className="bg-white text-navy hover:bg-sky-50 font-bold text-lg px-8 py-4 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  '🚀 Start Practicing Now'
                )}
              </Button>

              <a
                href="https://t.me/Conceptdelta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1a8bbf] text-white font-semibold text-base px-6 py-4 h-auto rounded-xl transition-all"
              >
                <SiTelegram className="h-5 w-5" />
                Join Telegram
              </a>

              <a
                href="https://youtube.com/@conceptdelta2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#FF0000] hover:bg-[#cc0000] text-white font-semibold text-base px-6 py-4 h-auto rounded-xl transition-all"
              >
                <SiYoutube className="h-5 w-5" />
                YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">Why Concept Delta?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to crack MHT-CET, built by students who've been there.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen className="h-7 w-7 text-navy" />,
                title: 'Expert-Crafted Questions',
                desc: 'Questions designed by COEP students who understand the exam pattern inside out.',
              },
              {
                icon: <Target className="h-7 w-7 text-navy" />,
                title: 'Timed Mock Tests',
                desc: 'Simulate real exam conditions with auto-submit timers and instant scoring.',
              },
              {
                icon: <Trophy className="h-7 w-7 text-navy" />,
                title: 'Track Your Progress',
                desc: 'See your scores, identify weak topics, and improve with every attempt.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-navy text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white/70 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/concept-delta-logo.dim_256x256.png"
              alt="Concept Delta"
              className="h-6 w-6 object-contain opacity-80"
            />
            <span className="text-sm font-medium text-white/80">Concept Delta</span>
          </div>
          <p className="text-xs text-center">
            © {new Date().getFullYear()} Concept Delta. All rights reserved.
          </p>
          <p className="text-xs text-center">
            Built with{' '}
            <span className="text-red-400">♥</span>{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'concept-delta')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-300 hover:text-sky-200 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
