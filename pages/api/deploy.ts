import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Validate VERCEL_TOKEN at module load time
if (!process.env.VERCEL_TOKEN) {
  console.error('❌ CRITICAL: VERCEL_TOKEN environment variable is not set');
  console.error('Please add VERCEL_TOKEN to your .env.local file or Vercel dashboard');
}

export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  url?: string;
  error?: string;
  logs?: string[];
};

type VercelFile = {
  file: string;
  data: string;
};

/**
 * Validates and retrieves the VERCEL_TOKEN from environment variables
 * @throws Error if token is not configured
 */
function getVercelToken(): string {
  const token = process.env.VERCEL_TOKEN;
  
  if (!token || token.trim() === '') {
    throw new Error(
      'VERCEL_TOKEN is not configured. Please add it to your .env.local file or Vercel dashboard. ' +
      'Get your token from: https://vercel.com/account/tokens'
    );
  }
  
  return token.trim();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const logs: string[] = [];
    
    // Use /tmp directory which is writable in Vercel serverless functions
    const uploadDir = '/tmp';
    
    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract and validate zip file
    console.log('📦 Extracting zip file:', file.originalFilename);
    const zip = new AdmZip(file.filepath);
    const zipEntries = zip.getEntries();

    // Check for index.html in root
    const hasIndexHtml = zipEntries.some(
      (entry) => !entry.isDirectory && entry.entryName === 'index.html'
    );

    if (!hasIndexHtml) {
      console.error('❌ index.html not found in root of zip file');
      return res.status(400).json({ error: 'index.html not found in root of zip file' });
    }

    logs.push('✅ index.html found in root');
    console.log('✅ index.html found in root');

    // Prepare files for Vercel deployment
    const vercelFiles: VercelFile[] = [];

    zipEntries.forEach((entry) => {
      if (!entry.isDirectory) {
        const fileName = entry.entryName;
        const fileBuffer = entry.getData();
        
        // Check if file is text-based or binary
        const textExtensions = ['.html', '.css', '.js', '.json', '.txt', '.md', '.svg', '.xml'];
        const isTextFile = textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
        
        let fileContent: string;
        if (isTextFile) {
          // Send text files as UTF-8 strings
          fileContent = fileBuffer.toString('utf-8');
        } else {
          // Send binary files as base64
          fileContent = fileBuffer.toString('base64');
        }
        
        vercelFiles.push({
          file: fileName,
          data: fileContent,
        });
        const logMessage = `📄 Adding file: ${fileName} ${isTextFile ? '(text)' : '(binary)'}`;
        logs.push(logMessage);
        console.log(logMessage);
      }
    });

    const filesLog = `📦 Total files to deploy: ${vercelFiles.length}`;
    logs.push(filesLog);
    console.log(filesLog);

    // Deploy to Vercel - Explicitly use VERCEL_TOKEN from environment
    let vercelToken: string;
    try {
      vercelToken = getVercelToken();
      logs.push('✅ Using VERCEL_TOKEN from environment variables');
      console.log('✅ Using VERCEL_TOKEN from environment variables');
    } catch (error) {
      console.error('❌ VERCEL_TOKEN validation failed:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Vercel token not configured' 
      });
    }

    const projectName = `snapship-${Date.now().toString(36)}`;
    
    const deploymentPayload = {
      name: projectName,
      files: vercelFiles,
      public: true,
      projectSettings: {
        framework: null,
      },
    };

    logs.push('🚀 Deploying to Vercel...');
    console.log('🚀 Deploying to Vercel...');
    console.log('📡 Using Vercel API endpoint: https://api.vercel.com/v13/deployments');

    // Make authenticated request to Vercel API using manually provided token
    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        // Explicitly use VERCEL_TOKEN from environment variables (not system-injected)
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deploymentPayload),
    });

    const vercelData = await vercelResponse.json();

    if (!vercelResponse.ok) {
      console.error('❌ Vercel deployment failed:', vercelData);
      return res.status(500).json({
        error: vercelData.error?.message || 'Vercel deployment failed',
      });
    }

    const deploymentUrl = `https://${vercelData.url}`;
    logs.push('✅ Deployment successful!');
    console.log('✅ Deployment successful:', deploymentUrl);

    // Clean up uploaded file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      url: deploymentUrl,
      logs,
    });
  } catch (error) {
    console.error('❌ Deployment error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Deployment failed',
    });
  }
}
