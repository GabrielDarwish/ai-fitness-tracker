# 🔐 Google OAuth Setup Guide

Follow these steps to enable Google authentication in your AI Fitness Tracker app.

## 📋 Prerequisites

- Google Account
- Your app running on `http://localhost:3000`

---

## 🚀 Step-by-Step Setup

### 1. Go to Google Cloud Console

Visit: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Create a New Project (or select existing)

1. Click the project dropdown at the top
2. Click **"New Project"**
3. Name it: `AI Fitness Tracker`
4. Click **"Create"**

### 3. Enable Google+ API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### 4. Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"Create"**

**Fill in the required fields:**
- **App name:** `AI Fitness Tracker`
- **User support email:** Your email
- **Developer contact information:** Your email
- Click **"Save and Continue"**

**Scopes:**
- Click **"Add or Remove Scopes"**
- Select:
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Click **"Update"** → **"Save and Continue"**

**Test users (for development):**
- Click **"Add Users"**
- Add your Google email
- Click **"Save and Continue"**

### 5. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

**Configure:**
- **Name:** `AI Fitness Tracker Web Client`
- **Authorized JavaScript origins:**
  ```
  http://localhost:3000
  ```
- **Authorized redirect URIs:**
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Click **"Create"**

### 6. Copy Your Credentials

You'll see a popup with:
- **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-xxxxx`)

**Keep these safe!**

### 7. Update Your `.env` File

Open your `.env` file in the project root and update:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret-here"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 8. Generate NEXTAUTH_SECRET

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

---

## ✅ Test Your Setup

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000`

3. **Click "Get Started"**

4. **Click "Continue with Google"**

5. **You should see Google's OAuth consent screen**

6. **Sign in and grant permissions**

7. **You'll be redirected to your dashboard!**

---

## 🔧 Troubleshooting

### Error: `redirect_uri_mismatch`
- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`
- No trailing slashes!

### Error: `invalid_client`
- Check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Make sure there are no extra spaces in your `.env` file

### Error: `access_denied`
- Make sure your email is added as a test user in the OAuth consent screen
- Try removing and re-adding your email

### Not redirecting after sign-in
- Clear your browser cookies for `localhost`
- Make sure `NEXTAUTH_URL` is set to `http://localhost:3000`
- Restart your dev server

---

## 🌐 Production Setup (Later)

When deploying to production (e.g., Vercel):

1. **Update Authorized Origins:**
   ```
   https://your-domain.com
   ```

2. **Update Redirect URIs:**
   ```
   https://your-domain.com/api/auth/callback/google
   ```

3. **Update `.env` in Vercel:**
   - Set `NEXTAUTH_URL=https://your-domain.com`
   - Add all other env variables

4. **Publish your OAuth App:**
   - Go back to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (if needed)

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Troubleshooting Guide](https://next-auth.js.org/configuration/providers/oauth#troubleshooting)

---

**Need help?** Check the console logs in your browser and terminal for detailed error messages.

