# GitHub OAuth Configuration Guide - CRITICAL FIX NEEDED

## ⚠️ URGENT: Your GitHub OAuth App is NOT configured correctly

**Error:** "no access token provided" - This means GitHub is rejecting the authentication.

## Fix Steps (DO THIS NOW):

### 1. Delete Your Current GitHub OAuth App

The current app with Client ID `Ov23li4BR7lIdhNSv14t` is not working properly.

1. Go to: https://github.com/settings/developers
2. Click on "OAuth Apps"
3. Find your Snapship app
4. Click "Delete" and confirm

### 2. Create a NEW GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in these EXACT values:

**Application name:**
```
Snapship Local Dev
```

**Homepage URL:**
```
http://localhost:3000
```

**Application description:** (optional)
```
Snapship deployment platform
```

**Authorization callback URL (CRITICAL):**
```
http://localhost:3000/api/auth/callback/github
```

⚠️ **This MUST be EXACTLY:** `http://localhost:3000/api/auth/callback/github`

### 3. Update Your .env.local File

After creating the new OAuth app, GitHub will show you:
- **Client ID** (starts with "Ov23...")
- **Client Secret** (click "Generate a new client secret")

Copy these values and update your `.env.local` file:

```env
GITHUB_CLIENT_ID=your_new_client_id_here
GITHUB_CLIENT_SECRET=your_new_client_secret_here
NEXTAUTH_SECRET=aGPlt1fqsGtwzSfFyClUQLkjlUQnO2JMNcL0c2lsyfw
NEXTAUTH_URL=http://localhost:3000
VERCEL_TOKEN=M0VwqgDBLkLFlXnnbBIijvN9
```

### 4. Common Issues

❌ **Wrong callback URL formats:**
- `http://localhost:3000/api/auth/callback` (missing `/github`)
- `http://localhost:3000/dashboard` (wrong endpoint)
- `http://localhost:3000/` (missing path)

✅ **Correct format:**
- `http://localhost:3000/api/auth/callback/github`

### 5. After Creating New OAuth App

1. Update `.env.local` with the new Client ID and Client Secret
2. Stop the dev server (Ctrl+C in terminal)
3. Clear the build cache:
   ```bash
   Remove-Item -Recurse -Force .next
   ```
4. Restart the dev server:
   ```bash
   npm run dev
   ```
5. Clear your browser cookies for localhost:3000
6. Try logging in again

### 6. Testing the Fix

1. Click "Login with GitHub"
2. You should be redirected to GitHub's authorization page
3. After authorizing, you should be redirected to `/dashboard`
4. If you see the login page again, check browser console for errors

### 7. Debug Mode

The authentication now has debug mode enabled in development. Check your terminal for detailed NextAuth logs when you attempt to login.
