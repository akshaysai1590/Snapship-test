import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f3d4d] to-[#1a5566] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <img 
          src="/snapship-logo.jpg" 
          alt="Snapship" 
          className="w-32 h-32 mx-auto mb-8 rounded-full border-4 border-[#00ffff] shadow-2xl"
        />
        <h1 className="text-6xl font-bold text-white mb-6">
          Welcome to Snapship
        </h1>
        <p className="text-2xl text-[#00ffff] mb-8">
          Your Code. Our Click. Instant Deploy.
        </p>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Deploy your projects to Vercel with just a drag and drop. 
          Fast, simple, and powerful deployment made easy.
        </p>
        
        <div className="flex gap-4 justify-center">
          {session ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-4 bg-[#00ffff] hover:bg-[#00cccc] text-[#0f3d4d] rounded-lg font-bold text-lg transition-all duration-300 shadow-lg"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-4 bg-[#00ffff] hover:bg-[#00cccc] text-[#0f3d4d] rounded-lg font-bold text-lg transition-all duration-300 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent border-2 border-[#00ffff] hover:bg-[#00ffff]/10 text-white rounded-lg font-bold text-lg transition-all duration-300"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-[#1a2f3a]/50 p-6 rounded-lg border border-[#2a6b7d]">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Fast Deployment</h3>
            <p className="text-gray-300">Deploy your projects in seconds with our streamlined process</p>
          </div>
          <div className="bg-[#1a2f3a]/50 p-6 rounded-lg border border-[#2a6b7d]">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-white mb-2">Drag & Drop</h3>
            <p className="text-gray-300">Simply drag your ZIP file and watch it deploy automatically</p>
          </div>
          <div className="bg-[#1a2f3a]/50 p-6 rounded-lg border border-[#2a6b7d]">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Powered by Vercel</h3>
            <p className="text-gray-300">Built on top of Vercel&apos;s powerful infrastructure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
