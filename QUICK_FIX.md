# 🚨 QUICK FIX - GitHub OAuth Not Working

## The Problem
Error: "no access token provided" - Your GitHub OAuth app is misconfigured.

## The Solution (5 minutes)

### Step 1: Create New GitHub OAuth App
Go to: https://github.com/settings/developers → "New OAuth App"

**Fill in:**
- Application name: `Snapship Local Dev`
- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Click "Register application"

### Step 2: Get Credentials
After creating the app:
1. Copy the **Client ID**
2. Click "Generate a new client secret"
3. Copy the **Client secret** (you won't see it again!)

### Step 3: Update .env.local
Open `.env.local` and replace the first two lines:

```env
GITHUB_CLIENT_ID=paste_your_new_client_id_here
GITHUB_CLIENT_SECRET=paste_your_new_client_secret_here
```

Keep the other lines as they are.

### Step 4: Restart Server
In your terminal:
1. Press `Ctrl+C` to stop the server
2. Run: `npm run dev`
3. Wait for "Ready in..."

### Step 5: Test Login
1. Go to http://localhost:3000
2. Click "Login with GitHub"
3. Authorize the app
4. You should land on the dashboard! ✅

---

**Still not working?** Check GITHUB_OAUTH_SETUP.md for detailed troubleshooting.
