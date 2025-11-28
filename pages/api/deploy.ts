import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  url?: string;
  error?: string;
};

type VercelFile = {
  file: string;
  data: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
    });

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

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
        console.log('📄 Adding file:', fileName, isTextFile ? '(text)' : '(binary)');
      }
    });

    console.log(`📦 Total files to deploy: ${vercelFiles.length}`);

    // Deploy to Vercel
    const vercelToken = process.env.VERCEL_TOKEN;
    
    if (!vercelToken) {
      console.error('❌ VERCEL_TOKEN not configured');
      return res.status(500).json({ error: 'Vercel token not configured' });
    }

    const projectName = `snapship-${Date.now().toString(36)}`;
    
    const deploymentPayload = {
      name: projectName,
      files: vercelFiles,
      projectSettings: {
        framework: null,
      },
    };

    console.log('🚀 Deploying to Vercel...');

    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
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
    console.log('✅ Deployment successful:', deploymentUrl);

    // Clean up uploaded file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      url: deploymentUrl,
    });
  } catch (error) {
    console.error('❌ Deployment error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Deployment failed',
    });
  }
}
