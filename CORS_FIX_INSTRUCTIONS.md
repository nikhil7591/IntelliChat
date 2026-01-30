# CORS & Deployment Fix Instructions

## Problem
Frontend on Vercel cannot access Backend on Render due to CORS policy blocking.

## Root Cause
Backend CORS configuration doesn't have the Vercel frontend URL in allowed origins.

## Solution Applied

### 1. Updated Frontend API URL
**File:** `frontend/.env.production`
```
REACT_APP_API_URL=https://intellichat-1.onrender.com
```
Changed from `intellichat-backend` to `intellichat-1` (your actual Render app name)

### 2. Improved Backend CORS Configuration
**File:** `backend/index.js`

Now uses a dynamic CORS handler that:
- Accepts requests from allowed origins
- Allows requests with no origin (mobile apps)
- Logs rejected origins for debugging
- Handles Vercel auto-preview URLs

## CRITICAL: Set Backend Environment Variables

You MUST set this in your Render dashboard:

**Go to:** https://dashboard.render.com → Select your backend service → Environment

Add or update:
```
FRONTEND_URL=https://intelli-chat-lilac.vercel.app
```

⚠️ **IMPORTANT:** Use your exact Vercel frontend URL (the one in the error message)

## Steps to Deploy

### 1. Backend (Render)

Go to Render Dashboard → Your backend service → Settings → Environment

Set/Update these variables:
```
NODE_ENV=production
FRONTEND_URL=https://intelli-chat-lilac.vercel.app
PORT=8000
MONGO_URI=mongodb+srv://...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-secret
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
DEMO_EMAIL=demo@intellichat.com
DEMO_OTP=123456
```

Then redeploy:
- Click "Deploy" button or push new code
- Wait for deployment to complete

### 2. Frontend (Vercel)

Push your code:
```bash
git add .
git commit -m "Fix CORS and API URL for production"
git push origin main
```

Vercel will auto-deploy. The `.env.production` file will be used automatically.

## Testing After Deployment

1. **Open your Vercel app:** `https://intelli-chat-lilac.vercel.app`
2. **Open browser console** (F12 → Console)
3. **Try to login:**
   - Click "Continue with Email"
   - Enter any email
   - You should see the OTP request succeed
   - Check Network tab to verify request goes to correct backend

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Frontend API URL | https://intellichat-backend.onrender.com | https://intellichat-1.onrender.com |
| Backend CORS | Static origin list | Dynamic origin checker |
| CORS Error Logging | None | Logs rejected origins |
| FRONTEND_URL handling | From .env | From Render environment variables |

## Common Issues & Fixes

### Issue: Still getting CORS error after changes
**Solution:**
1. Check you set `FRONTEND_URL` in Render environment
2. Verify you used the exact Vercel domain (no trailing slash)
3. Redeploy both frontend and backend
4. Clear browser cache (Ctrl+Shift+Delete)
5. Wait 1-2 minutes for Render redeploy to complete

### Issue: 502 Bad Gateway
**Solution:**
1. Check backend is running on Render dashboard
2. Check MongoDB connection string is correct
3. Check all required env vars are set
4. Click "Logs" in Render to see errors

### Issue: Still "Network Error"
**Solution:**
1. Check the actual error in browser Network tab
2. Look at backend logs in Render dashboard
3. Verify FRONTEND_URL matches exactly what's in address bar

## Files Changed

```
frontend/
├── .env.production         ✅ Updated API URL
└── src/services/url.service.js  (already has withCredentials: true)

backend/
└── index.js               ✅ Improved CORS configuration
```

## Deployment Checklist

- [ ] Update FRONTEND_URL in Render environment to your Vercel domain
- [ ] Push frontend code changes
- [ ] Redeploy backend on Render (or push new code)
- [ ] Wait for both deployments to complete
- [ ] Test login on production URL
- [ ] Check browser Network tab shows 200 status
- [ ] Check browser Console has no CORS errors

---

**Status:** Ready to Deploy ✅
