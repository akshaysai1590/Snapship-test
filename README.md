# Snapship

Deploy projects to Vercel with drag-and-drop.

## Setup

1. Copy `.env.example` to `.env.local`
2. Add your environment variables
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
VERCEL_TOKEN=your_vercel_token
```

## Deploy to Vercel

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy
