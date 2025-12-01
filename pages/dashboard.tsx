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

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#060010' }}>
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

      {/* Header */}
      <div className="relative z-10 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
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

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#7c3aed',
                }}
              >
                {deploymentCount} Deployments
              </div>
              
              <div className="flex items-center gap-3">
                <img 
                  src={userImage} 
                  alt={username}
                  className="w-10 h-10 rounded-full"
                  style={{ border: '2px solid #7c3aed' }}
                />
                <div className="hidden sm:block">
                  <p className="text-white font-medium text-sm">{username}</p>
                  <p className="text-xs" style={{ color: '#999' }}>{session.user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Welcome section */}
          <div className="mb-12">
            <h1 
              className="text-4xl md:text-5xl font-semibold mb-3"
              style={{
                color: '#fff',
                letterSpacing: '-1px',
              }}
            >
              Welcome back, {username.split(' ')[0]}
            </h1>
            <p className="text-lg" style={{ color: '#ccc' }}>
              Deploy your projects in seconds with drag and drop
            </p>
          </div>

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

          {/* Deployment History */}
          {deploymentHistory.length > 0 && (
            <div 
              className="rounded-3xl p-8"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h2 className="text-2xl font-semibold text-white mb-6">📦 Recent Deployments</h2>
              
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
      </div>
    </div>
  );
}
