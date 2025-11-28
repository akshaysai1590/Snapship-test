# Snapship Deployment Guide

## Prerequisites

1. A Vercel account
2. A GitHub OAuth App
3. A Vercel API token

## Environment Variables

Set these environment variables in your Vercel project settings:

### GitHub OAuth
- `GITHUB_CLIENT_ID` - Your GitHub OAuth App Client ID
- `GITHUB_CLIENT_SECRET` - Your GitHub OAuth App Client Secret

### NextAuth
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production URL (e.g., `https://snapship.vercel.app`)

### Vercel Deployment
- `VERCEL_TOKEN` - Your Vercel API token from https://vercel.com/account/tokens

## GitHub OAuth App Setup

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set the Authorization callback URL to: `https://your-domain.vercel.app/api/auth/callback/github`
4. Copy the Client ID and Client Secret

## Deploying to Vercel

### Option 1: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your environment variables
3. Run `npm install`
4. Run `npm run dev`

## Important Notes

- Make sure to update your GitHub OAuth App callback URL when deploying to production
- The `NEXTAUTH_URL` should match your production domain
- Keep your secrets secure and never commit `.env.local` to git
