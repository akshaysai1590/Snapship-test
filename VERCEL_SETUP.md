# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] All environment variables use `process.env.*`
- [x] NextAuth configured with production-safe cookies
- [x] NEXTAUTH_URL uses environment variable
- [x] No hardcoded localhost URLs in code
- [x] Build passes successfully (`npm run build`)
- [x] `.env.example` created for reference
- [x] `.gitignore` includes `.env.local`

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### Step 3: Configure Environment Variables
Add these in Vercel Project Settings → Environment Variables:

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-project.vercel.app
VERCEL_TOKEN=your_vercel_api_token
```

### Step 4: Update GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Edit your OAuth App
3. Update Authorization callback URL to:
   ```
   https://your-project.vercel.app/api/auth/callback/github
   ```

### Step 5: Deploy
Click "Deploy" in Vercel dashboard

## 🔧 Environment Variables Explained

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App ID | GitHub Developer Settings |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | GitHub Developer Settings |
| `NEXTAUTH_SECRET` | Session encryption key | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | Your Vercel deployment URL |
| `VERCEL_TOKEN` | Vercel API token | https://vercel.com/account/tokens |

## 🧪 Testing Production Build Locally

```bash
npm run build
npm start
```

Visit http://localhost:3000 to test the production build.

## 📝 Post-Deployment

- [ ] Test GitHub login on production
- [ ] Test file upload and deployment
- [ ] Verify all environment variables are set
- [ ] Check Vercel logs for any errors
