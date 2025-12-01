# ⚠️ Your GitHub OAuth App is Still Using OLD Credentials

## The Problem
Your `.env.local` still has the old credentials:
- GITHUB_CLIENT_ID=Ov23li4BR7lIdhNSv14t
- GITHUB_CLIENT_SECRET=02c41eeb3461292d783b828d600a6cd499e12027

These credentials are NOT working, which is why you're getting "authentication failed".

## Solution: Update Your Credentials

### Option 1: Did you create a NEW OAuth app?

If YES, go to https://github.com/settings/developers and:

1. Click on your NEW Snapship app
2. Copy the **Client ID** (should be different from Ov23li4BR7lIdhNSv14t)
3. If you don't see the Client Secret:
   - Click "Generate a new client secret"
   - Copy it immediately (you won't see it again!)
4. Update `.env.local` with the NEW values

### Option 2: Fix your EXISTING OAuth app

If you're using the existing app (Ov23li4BR7lIdhNSv14t):

1. Go to: https://github.com/settings/developers
2. Click on your Snapship OAuth app
3. **CRITICAL:** Check the "Authorization callback URL"
4. It MUST be EXACTLY: `http://localhost:3000/api/auth/callback/github`
5. If it's different, update it and click "Update application"
6. Generate a NEW client secret:
   - Scroll down to "Client secrets"
   - Click "Generate a new client secret"
   - Copy the new secret
7. Update `.env.local` with the NEW secret (keep the same Client ID)

### After Updating .env.local:

1. Save the file
2. Stop the server (Ctrl+C in terminal)
3. Run: `npm run dev`
4. Clear browser cookies for localhost:3000
5. Try logging in again

## How to Check if Callback URL is Correct

Your GitHub OAuth app callback URL should be:
```
http://localhost:3000/api/auth/callback/github
```

Common WRONG values:
- ❌ http://localhost:3000
- ❌ http://localhost:3000/api/auth/callback
- ❌ http://localhost:3000/dashboard
- ❌ https://localhost:3000/api/auth/callback/github (https instead of http)

## Still Not Working?

Check the terminal where `npm run dev` is running. Look for errors like:
- "no access token provided"
- "invalid_client"
- "redirect_uri_mismatch"

These errors tell you exactly what's wrong with your GitHub OAuth configuration.
