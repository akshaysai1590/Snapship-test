import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deploymentCount, setDeploymentCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'projects' | 'analytics' | 'settings'>('dashboard');
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{url: string, date: string, name: string}>>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f3d4d] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#00ffff] mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!session) {
    return null;
  }

  const username = (session.user as any)?.username || session.user?.name || session.user?.email || 'User';
  const userImage = session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=00ffff&color=0f3d4d&bold=true`;

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to login if signOut fails
      router.push('/login');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith('.zip')) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleDeploy = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setErrorMessage(null);
    setDeploymentUrl(null);
    setDeploymentLogs(['📦 Preparing deployment...', '🔍 Extracting zip file...']);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress
      setTimeout(() => setDeploymentLogs(prev => [...prev, '✅ index.html found in root']), 500);
      setTimeout(() => setDeploymentLogs(prev => [...prev, '📄 Adding files...']), 1000);
      setTimeout(() => setDeploymentLogs(prev => [...prev, '✅ Using VERCEL_TOKEN from environment variables']), 1500);
      setTimeout(() => setDeploymentLogs(prev => [...prev, '🚀 Deploying to Vercel...']), 2000);

      const response = await fetch('/api/deploy', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      // Display actual logs from API if available
      if (data.logs && Array.isArray(data.logs)) {
        setDeploymentLogs(data.logs);
      } else {
        setDeploymentLogs(prev => [...prev, '✅ Deployment successful!']);
      }

      setDeploymentUrl(data.url);
      setDeploymentHistory(prev => [{
        url: data.url,
        date: new Date().toLocaleString(),
        name: selectedFile.name
      }, ...prev]);
      setSelectedFile(null);
      setDeploymentCount(prev => prev + 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during deployment');
      setDeploymentLogs([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f3d4d] py-8 px-4">
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
        }
        @keyframes wave2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(25px) translateY(-15px); }
        }
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff, 0 0 80px #00ffff;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff, 0 0 120px #00ffff;
            transform: scale(1.02);
          }
        }
        @keyframes neonGlow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          41% { opacity: 1; }
          42% { opacity: 0.6; }
          43% { opacity: 1; }
          45% { opacity: 0.7; }
          46% { opacity: 1; }
        }
        .wave-1 { animation: wave1 4s ease-in-out infinite; }
        .wave-2 { animation: wave2 5s ease-in-out infinite; }
        .neon-button {
          animation: neonPulse 2s ease-in-out infinite;
          background: linear-gradient(135deg, #00ffff 0%, #0099ff 100%);
        }
        .neon-glow {
          animation: neonGlow 2s ease-in-out infinite;
        }
        .flicker-text {
          animation: flicker 3s infinite;
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .sidebar-enter {
          animation: slideIn 0.3s ease-out forwards;
        }
        .sidebar-exit {
          animation: slideOut 0.3s ease-out forwards;
        }
      `}</style>

      {/* Logo Button - Top Left */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-50 bg-[#1a2f3a] p-3 rounded-full shadow-2xl border-2 border-[#00ffff] hover:scale-110 transition-transform duration-300"
      >
        <img 
          src="/snapship-logo.jpg" 
          alt="Snapship Logo" 
          className="w-12 h-12 rounded-full"
        />
      </button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar Panel */}
          <div className="fixed top-0 left-0 h-full w-80 bg-[#1a2f3a] shadow-2xl z-50 sidebar-enter border-r-2 border-[#00ffff]">
            <div className="p-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img 
                    src="/snapship-logo.jpg" 
                    alt="Snapship" 
                    className="w-12 h-12 rounded-full border-2 border-[#00ffff]"
                  />
                  <h2 className="text-2xl font-bold text-white">Snapship</h2>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white hover:text-[#00ffff] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="mb-8 p-4 bg-[#0f3d4d] rounded-lg border border-[#2a6b7d]">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={userImage} 
                    alt={username}
                    className="w-12 h-12 rounded-full border-2 border-[#00ffff]"
                  />
                  <div>
                    <p className="text-white font-semibold">{username}</p>
                    <p className="text-[#00ffff] text-sm">{session.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                <button 
                  onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors ${
                    currentView === 'dashboard' ? 'bg-[#0f3d4d] border-l-4 border-[#00ffff]' : 'hover:bg-[#0f3d4d]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </button>

                <button 
                  onClick={() => { setCurrentView('projects'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors ${
                    currentView === 'projects' ? 'bg-[#0f3d4d] border-l-4 border-[#00ffff]' : 'hover:bg-[#0f3d4d]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projects
                </button>

                <button 
                  onClick={() => { setCurrentView('analytics'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors ${
                    currentView === 'analytics' ? 'bg-[#0f3d4d] border-l-4 border-[#00ffff]' : 'hover:bg-[#0f3d4d]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>

                <button 
                  onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors ${
                    currentView === 'settings' ? 'bg-[#0f3d4d] border-l-4 border-[#00ffff]' : 'hover:bg-[#0f3d4d]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </nav>

              {/* Stats */}
              <div className="mt-8 p-4 bg-[#0f3d4d] rounded-lg border border-[#2a6b7d]">
                <p className="text-white text-sm mb-2">Total Deployments</p>
                <p className="text-[#00ffff] text-3xl font-bold">{deploymentCount}</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* User Profile Header */}
        <div className="bg-[#1a2f3a] rounded-2xl p-6 shadow-2xl border border-[#2a6b7d]/30 mb-8">
          <div className="flex items-center justify-between">
            {/* User Avatar & Info */}
            <div className="flex items-center gap-4">
              <img 
                src={userImage} 
                alt={username}
                className="w-16 h-16 rounded-full border-2 border-[#00ffff] shadow-lg"
              />
              <div>
                <h2 className="text-2xl text-white font-bold">👋 {username}</h2>
                <p className="text-[#00ffff] text-sm">{session.user?.email}</p>
              </div>
            </div>

            {/* Stats & Logout */}
            <div className="flex items-center gap-6">
              {/* Deployment Counter */}
              <div className="text-center bg-[#0f3d4d] px-6 py-3 rounded-lg border border-[#2a6b7d]">
                <p className="text-[#00ffff] text-3xl font-bold">{deploymentCount}</p>
                <p className="text-white text-sm">Deployments</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {currentView === 'dashboard' && (
          <>
            <div className="text-center mb-8">
              <p className="text-4xl text-white font-bold flicker-text" style={{ fontFamily: "'Styrene B', sans-serif" }}>
                Your Code. Our Click. Instant Deploy ...
              </p>
            </div>

            {/* Deploy New Project Section */}
            <div className="bg-[#1a2f3a] rounded-2xl p-8 shadow-2xl border border-[#2a6b7d]/30">
          <h2 className="text-2xl text-white font-bold mb-6">🚀 Deploy New Project</h2>
          
          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragging
                ? 'border-[#00ffff] bg-[#00ffff]/10 shadow-lg shadow-[#00ffff]/50'
                : 'border-[#2a6b7d] bg-[#0f3d4d]/50'
            }`}
          >
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {selectedFile ? (
              <div className="text-white mb-4">
                <p className="text-lg font-semibold">Selected: {selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-gray-300 mb-4">
                <p className="text-lg mb-2">Drag and drop your .zip file here</p>
                <p className="text-sm text-gray-400">or</p>
              </div>
            )}

            {/* Choose File Button */}
            <label className="inline-block px-6 py-3 bg-[#1a5566] text-white rounded-lg hover:bg-[#2a6b7d] cursor-pointer transition-all duration-300 shadow-lg">
              Choose File
              <input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Deploy Button - Neon Glow */}
          {selectedFile && (
            <div className="mt-8 text-center">
              <button
                onClick={handleDeploy}
                disabled={isUploading}
                className={`px-12 py-4 text-white rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isUploading ? 'bg-gray-600' : 'neon-button'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deploying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🚀 Deploy Now
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Deployment Logs */}
          {deploymentLogs.length > 0 && !deploymentUrl && !errorMessage && (
            <div className="mt-6 p-4 bg-[#0f3d4d] rounded-lg border border-[#2a6b7d] font-mono text-sm">
              <h3 className="text-[#00ffff] font-semibold mb-3 flex items-center gap-2">
                {isUploading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Deployment Progress
              </h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {deploymentLogs.map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {deploymentUrl && (
            <div className="mt-6 p-4 bg-green-900 bg-opacity-50 border border-green-600 rounded-lg">
              <p className="text-green-400 font-semibold mb-2">✅ Deployment Successful!</p>
              <p className="text-white">
                Your project is live at:{' '}
                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {deploymentUrl}
                </a>
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-6 p-4 bg-red-900 bg-opacity-50 border border-red-600 rounded-lg">
              <p className="text-red-400 font-semibold mb-2">❌ Deployment Failed</p>
              <p className="text-white">{errorMessage}</p>
            </div>
          )}
            </div>
          </>
        )}

        {/* Projects View */}
        {currentView === 'projects' && (
          <div className="bg-[#1a2f3a] rounded-2xl p-8 shadow-2xl border border-[#2a6b7d]/30">
            <h2 className="text-3xl text-white font-bold mb-6">📦 Your Projects</h2>
            
            {deploymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-400 text-lg">No projects deployed yet</p>
                <p className="text-gray-500 text-sm mt-2">Deploy your first project to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deploymentHistory.map((project, index) => (
                  <div key={index} className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d] hover:border-[#00ffff] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">Deployed: {project.date}</p>
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#00ffff] hover:text-[#00cccc] text-sm underline"
                        >
                          {project.url}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#1a5566] hover:bg-[#2a6b7d] text-white rounded-lg transition-colors"
                        >
                          Visit
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="bg-[#1a2f3a] rounded-2xl p-8 shadow-2xl border border-[#2a6b7d]/30">
            <h2 className="text-3xl text-white font-bold mb-6">📊 Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
                <p className="text-gray-400 text-sm mb-2">Total Deployments</p>
                <p className="text-[#00ffff] text-4xl font-bold">{deploymentCount}</p>
              </div>
              <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
                <p className="text-gray-400 text-sm mb-2">Active Projects</p>
                <p className="text-[#00ffff] text-4xl font-bold">{deploymentHistory.length}</p>
              </div>
              <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
                <p className="text-gray-400 text-sm mb-2">Success Rate</p>
                <p className="text-[#00ffff] text-4xl font-bold">100%</p>
              </div>
            </div>

            <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
              <h3 className="text-white font-semibold text-xl mb-4">Recent Activity</h3>
              {deploymentHistory.length === 0 ? (
                <p className="text-gray-400">No activity yet</p>
              ) : (
                <div className="space-y-3">
                  {deploymentHistory.slice(0, 5).map((project, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-[#2a6b7d] last:border-0">
                      <div>
                        <p className="text-white">{project.name}</p>
                        <p className="text-gray-400 text-sm">{project.date}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">Success</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="bg-[#1a2f3a] rounded-2xl p-8 shadow-2xl border border-[#2a6b7d]/30">
            <h2 className="text-3xl text-white font-bold mb-6">⚙️ Settings</h2>
            
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
                <h3 className="text-white font-semibold text-xl mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Username</label>
                    <p className="text-white text-lg">{username}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white text-lg">{session.user?.email}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Account Type</label>
                    <p className="text-white text-lg">GitHub OAuth</p>
                  </div>
                </div>
              </div>

              {/* Deployment Settings */}
              <div className="bg-[#0f3d4d] p-6 rounded-lg border border-[#2a6b7d]">
                <h3 className="text-white font-semibold text-xl mb-4">Deployment Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Auto-deploy on push</p>
                      <p className="text-gray-400 text-sm">Automatically deploy when code is pushed</p>
                    </div>
                    <button className="px-4 py-2 bg-[#1a5566] text-white rounded-lg">Enable</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Build notifications</p>
                      <p className="text-gray-400 text-sm">Get notified about deployment status</p>
                    </div>
                    <button className="px-4 py-2 bg-[#00ffff] text-[#0f3d4d] rounded-lg font-semibold">Enabled</button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-900/20 p-6 rounded-lg border border-red-600">
                <h3 className="text-red-400 font-semibold text-xl mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">Clear deployment history</p>
                      <p className="text-gray-400 text-sm">Remove all deployment records</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all deployment history?')) {
                          setDeploymentHistory([]);
                          setDeploymentCount(0);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Clear History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
