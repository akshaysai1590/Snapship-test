import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#060010' }}>
      {/* Gradient blur background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(109, 40, 217, 0.2) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Side gradients */}
      <div className="absolute top-0 left-0 w-[300px] h-full pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, #060010, transparent)' }}
      />
      <div className="absolute top-0 right-0 w-[300px] h-full pointer-events-none z-10"
        style={{ background: 'linear-gradient(to left, #060010, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className={`max-w-4xl mx-auto text-center ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.07)',
              background: 'rgba(255, 255, 255, 0.01)',
              backdropFilter: 'blur(15px)',
            }}
          >
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: '#7c3aed', color: '#fff' }}
            >
              New
            </span>
            <span style={{ color: '#ccc', fontSize: '14px' }}>
              Deploy in seconds ✨
            </span>
          </div>

          {/* Title */}
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-normal mb-8 leading-none"
            style={{
              color: '#fff',
              letterSpacing: '-3px',
              textShadow: '0 0 2px rgba(255, 255, 255, 0.1), 0 0 4px rgba(255, 255, 255, 0.3), 0 0 8px rgba(255, 255, 255, 0.2), 0 0 136px rgba(120, 60, 255, 0.4)',
            }}
          >
            Deploy with
            <br />
            <span style={{ color: '#7c3aed' }}>Snapship</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#ccc' }}
          >
            Your code. Our click. Instant deploy. Drop your ZIP file and watch it go live on Vercel in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="group relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #182fff)',
                  color: '#fff',
                  boxShadow: '0 0 40px rgba(124, 58, 237, 0.2), 0 0 80px rgba(139, 92, 246, 0.1), 0 8px 32px rgba(0, 0, 0, 0.1)',
                  animation: 'glow-pulse 3s ease-in-out infinite alternate',
                }}
              >
                <span className="relative z-10">Go to Dashboard →</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="group relative px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #182fff)',
                    color: '#fff',
                    boxShadow: '0 0 40px rgba(124, 58, 237, 0.2), 0 0 80px rgba(139, 92, 246, 0.1), 0 8px 32px rgba(0, 0, 0, 0.1)',
                    animation: 'glow-pulse 3s ease-in-out infinite alternate',
                  }}
                >
                  <span className="relative z-10">Get Started →</span>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 hover:scale-105"
                  style={{
                    border: '1px solid rgba(124, 58, 237, 0.5)',
                    background: 'rgba(124, 58, 237, 0.1)',
                    color: '#fff',
                  }}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            {[
              { icon: '🚀', title: 'Lightning Fast', desc: 'Deploy in seconds with our streamlined process' },
              { icon: '📦', title: 'Drag & Drop', desc: 'Simply drag your ZIP file and watch it deploy' },
              { icon: '⚡', title: 'Powered by Vercel', desc: 'Built on Vercel&apos;s powerful infrastructure' },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#fff' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#ccc', fontSize: '14px' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
