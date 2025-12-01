import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Login() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }

    // Check for error in URL
    if (router.query.error) {
      setError('Authentication failed. Please check your GitHub OAuth configuration.');
    }
  }, [status, router.query.error, router]);

  const handleGitHubSignIn = async () => {
    try {
      setError(null);
      const result = await signIn('github', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
      if (result?.error) {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f3d4d]">
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(-15px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .wave-1 { animation: wave1 4s ease-in-out infinite; }
        .wave-2 { animation: wave2 5s ease-in-out infinite; }
        .logo-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute bottom-0 w-full wave-1" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#1a5566"
            fillOpacity="0.3"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        <svg className="absolute bottom-0 w-full wave-2" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#2a6b7d"
            fillOpacity="0.5"
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#1a2f3a] rounded-2xl shadow-2xl p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/snapship-logo.jpg" 
                alt="Snapship Logo" 
                className="w-32 h-32 logo-float"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Snapship
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#0f3d4d] text-white rounded-lg font-semibold hover:bg-[#1a5566] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            {status === 'loading' ? 'Loading...' : 'Login with GitHub'}
          </button>
        </div>
      </div>
    </div>
  );
}
