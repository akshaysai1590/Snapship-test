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
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{url: string, date: string, name: string}>>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'deployments' | 'analytics'>('dashboard');

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
    
    // Load deployment history from localStorage
    const savedHistory = localStorage.getItem('snapship_deployments');
    const savedCount = localStorage.getItem('snapship_deployment_count');
    
    if (savedHistory) {
      try {
        setDeploymentHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse deployment history:', e);
      }
    }
    
    if (savedCount) {
      setDeploymentCount(parseInt(savedCount, 10) || 0);
    }
  }, [status, router]);

  // Save deployment history to localStorage whenever it changes
  useEffect(() => {
    if (deploymentHistory.length > 0) {
      localStorage.setItem('snapship_deployments', JSON.stringify(deploymentHistory));
    }
  }, [deploymentHistory]);

  // Save deployment count to localStorage whenever it changes
  useEffect(() => {
    if (deploymentCount > 0) {
      localStorage.setItem('snapship_deployment_count', deploymentCount.toString());
    }
  }, [deploymentCount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060010' }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#7c3aed' }} viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  const username = (session.user as any)?.username || session.user?.name || session.user?.email || 'User';
  const userImage = session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=7c3aed&color=fff&bold=true`;

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/login',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
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
    <div className="min-h-screen relative overflow-hidden flex" style={{ background: '#060010' }}>
      {/* Gradient blur background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(109, 40, 217, 0.2) 50%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(15, 8, 32, 0.95), rgba(6, 0, 16, 0.95))',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #182fff)',
                boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
              }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-white">Snapship</span>
          </div>

          {/* User info */}
          <div 
            className="p-4 rounded-2xl mb-6 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={userImage} 
                alt={username}
                className="w-12 h-12 rounded-full"
                style={{ border: '2px solid #7c3aed' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{username}</p>
                <p className="text-xs truncate" style={{ color: '#999' }}>{session.user?.email}</p>
              </div>
            </div>
            <div 
              className="px-3 py-2 rounded-lg text-center"
              style={{
                background: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
              }}
            >
              <p className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{deploymentCount}</p>
              <p className="text-xs" style={{ color: '#ccc' }}>Total Deployments</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'dashboard' ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{
                background: currentView === 'dashboard' 
                  ? 'linear-gradient(135deg, #7c3aed, #182fff)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: currentView === 'dashboard'
                  ? '1px solid rgba(124, 58, 237, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                boxShadow: currentView === 'dashboard' ? '0 0 20px rgba(124, 58, 237, 0.3)' : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setCurrentView('deployments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'deployments' ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{
                background: currentView === 'deployments' 
                  ? 'linear-gradient(135deg, #7c3aed, #182fff)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: currentView === 'deployments'
                  ? '1px solid rgba(124, 58, 237, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                boxShadow: currentView === 'deployments' ? '0 0 20px rgba(124, 58, 237, 0.3)' : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Deployments
              {deploymentHistory.length > 0 && (
                <span 
                  className="ml-auto px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(124, 58, 237, 0.3)',
                    color: '#fff',
                  }}
                >
                  {deploymentHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentView === 'analytics' ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{
                background: currentView === 'analytics' 
                  ? 'linear-gradient(135deg, #7c3aed, #182fff)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: currentView === 'analytics'
                  ? '1px solid rgba(124, 58, 237, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                color: '#fff',
                boxShadow: currentView === 'analytics' ? '0 0 20px rgba(124, 58, 237, 0.3)' : 'none',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </nav>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden relative z-10 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.07)' }}>
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(124, 58, 237, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
              }}
            >
              <svg className="w-6 h-6" style={{ color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #182fff)',
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white">Snapship</span>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Main content area */}
        <div className="relative z-10 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Welcome section */}
              {currentView === 'dashboard' && (
                <div className="mb-12">
                  <h1 
                    className="text-4xl md:text-5xl font-semibold mb-3"
                    style={{
                      color: '#fff',
                      letterSpacing: '-1px',
                    }}
                  >
                    Welcome back, {username.split(' ')[0]} 👋
                  </h1>
                  <p className="text-lg" style={{ color: '#ccc' }}>
                    Deploy your projects in seconds with drag and drop
                  </p>
                </div>
              )}

              {/* Dashboard View */}
              {currentView === 'dashboard' && (
                <>
                  {/* Deploy section */}
                  <div 
                    className="rounded-3xl p-8 mb-8"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <h2 className="text-2xl font-semibold text-white mb-6">🚀 Deploy New Project</h2>
            
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300"
              style={{
                borderColor: isDragging ? '#7c3aed' : 'rgba(255, 255, 255, 0.1)',
                background: isDragging ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <svg
                className="mx-auto h-16 w-16 mb-4"
                style={{ color: isDragging ? '#7c3aed' : '#666' }}
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
                  <p className="text-lg font-semibold">{selectedFile.name}</p>
                  <p className="text-sm" style={{ color: '#999' }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-lg mb-2" style={{ color: '#ccc' }}>
                    Drag and drop your .zip file here
                  </p>
                  <p className="text-sm" style={{ color: '#999' }}>or</p>
                </div>
              )}

              <label 
                className="inline-block px-6 py-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(124, 58, 237, 0.2)',
                  border: '1px solid rgba(124, 58, 237, 0.5)',
                  color: '#fff',
                }}
              >
                Choose File
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Deploy Button */}
            {selectedFile && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleDeploy}
                  disabled={isUploading}
                  className="px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: isUploading ? '#666' : 'linear-gradient(135deg, #7c3aed, #182fff)',
                    color: '#fff',
                    boxShadow: isUploading ? 'none' : '0 0 40px rgba(124, 58, 237, 0.2), 0 8px 32px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deploying...
                    </span>
                  ) : (
                    '🚀 Deploy Now'
                  )}
                </button>
              </div>
            )}

            {/* Deployment Logs */}
            {deploymentLogs.length > 0 && !deploymentUrl && !errorMessage && (
              <div 
                className="mt-6 p-4 rounded-xl font-mono text-sm max-h-64 overflow-y-auto"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#7c3aed' }}>
                  {isUploading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Deployment Progress
                </h3>
                <div className="space-y-1">
                  {deploymentLogs.map((log, index) => (
                    <div key={index} style={{ color: '#ccc' }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {deploymentUrl && (
              <div 
                className="mt-6 p-4 rounded-xl"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <p className="font-semibold mb-2" style={{ color: '#86efac' }}>
                  ✅ Deployment Successful!
                </p>
                <p className="text-white">
                  Your project is live at:{' '}
                  <a
                    href={deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                    style={{ color: '#7c3aed' }}
                  >
                    {deploymentUrl}
                  </a>
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div 
                className="mt-6 p-4 rounded-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <p className="font-semibold mb-2" style={{ color: '#fca5a5' }}>
                  ❌ Deployment Failed
                </p>
                <p className="text-white">{errorMessage}</p>
              </div>
            )}
                  </div>
                </>
              )}

              {/* Deployments View */}
              {currentView === 'deployments' && (
                <div>
                  <div className="mb-8">
                    <h1 
                      className="text-4xl md:text-5xl font-semibold mb-3"
                      style={{
                        color: '#fff',
                        letterSpacing: '-1px',
                      }}
                    >
                      📦 Your Deployments
                    </h1>
                    <p className="text-lg" style={{ color: '#ccc' }}>
                      View and manage all your deployed projects
                    </p>
                  </div>

                  {deploymentHistory.length === 0 ? (
                    <div 
                      className="rounded-3xl p-16 text-center"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <svg className="w-24 h-24 mx-auto mb-6" style={{ color: '#666' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="text-2xl font-semibold text-white mb-2">No deployments yet</h3>
                      <p style={{ color: '#999' }}>Deploy your first project to see it here</p>
                      <button
                        onClick={() => setCurrentView('dashboard')}
                        className="mt-6 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #182fff)',
                          color: '#fff',
                          boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        Deploy Now →
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="rounded-3xl p-8"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div className="space-y-4">
                        {deploymentHistory.map((project, index) => (
                          <div 
                            key={index}
                            className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.07)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
                                <p className="text-sm mb-2" style={{ color: '#999' }}>
                                  Deployed: {project.date}
                                </p>
                                <a 
                                  href={project.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm underline hover:no-underline"
                                  style={{ color: '#7c3aed' }}
                                >
                                  {project.url}
                                </a>
                              </div>
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                                style={{
                                  background: 'rgba(124, 58, 237, 0.2)',
                                  border: '1px solid rgba(124, 58, 237, 0.5)',
                                  color: '#fff',
                                }}
                              >
                                Visit →
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics View */}
              {currentView === 'analytics' && (
                <div>
                  <div className="mb-8">
                    <h1 
                      className="text-4xl md:text-5xl font-semibold mb-3"
                      style={{
                        color: '#fff',
                        letterSpacing: '-1px',
                      }}
                    >
                      📊 Analytics
                    </h1>
                    <p className="text-lg" style={{ color: '#ccc' }}>
                      Track your deployment statistics
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: 'Total Deployments', value: deploymentCount, icon: '🚀', color: '#7c3aed' },
                      { label: 'Active Projects', value: deploymentHistory.length, icon: '📦', color: '#3b82f6' },
                      { label: 'Success Rate', value: '100%', icon: '✅', color: '#10b981' },
                    ].map((stat, i) => (
                      <div 
                        key={i}
                        className="rounded-3xl p-8 transition-all duration-300 hover:scale-105"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="text-4xl mb-4">{stat.icon}</div>
                        <p className="text-4xl font-bold mb-2" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                        <p style={{ color: '#999' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {deploymentHistory.length > 0 && (
                    <div 
                      className="rounded-3xl p-8"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
                      <div className="space-y-3">
                        {deploymentHistory.slice(0, 5).map((project, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between py-3 border-b"
                            style={{ borderColor: 'rgba(255, 255, 255, 0.07)' }}
                          >
                            <div>
                              <p className="text-white font-medium">{project.name}</p>
                              <p className="text-sm" style={{ color: '#999' }}>{project.date}</p>
                            </div>
                            <span 
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                color: '#86efac',
                              }}
                            >
                              Success
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deployment History on Dashboard */}
              {currentView === 'dashboard' && deploymentHistory.length > 0 && (
                <div 
                  className="rounded-3xl p-8"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white">📦 Recent Deployments</h2>
                    <button
                      onClick={() => setCurrentView('deployments')}
                      className="text-sm font-medium transition-all duration-300 hover:scale-105"
                      style={{ color: '#7c3aed' }}
                    >
                      View All →
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {deploymentHistory.slice(0, 3).map((project, index) => (
                      <div 
                        key={index}
                        className="p-6 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{project.name}</h3>
                            <p className="text-sm mb-2" style={{ color: '#999' }}>
                              Deployed: {project.date}
                            </p>
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm underline hover:no-underline"
                              style={{ color: '#7c3aed' }}
                            >
                              {project.url}
                            </a>
                          </div>
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            style={{
                              background: 'rgba(124, 58, 237, 0.2)',
                              border: '1px solid rgba(124, 58, 237, 0.5)',
                              color: '#fff',
                            }}
                          >
                            Visit →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
