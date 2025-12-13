# IntelliChat Deployment - Troubleshooting Guide

## Issue: OTP Not Sending & Continuous Loading

### Root Causes Identified:

1. **Email service not configured on Render**
2. **Token not being sent with Bearer prefix**
3. **Protected route can't verify authentication**

---

## Solutions

### 1️⃣ Check Render Environment Variables

**Go to Render Dashboard → Your Service → Environment**

Verify these variables are set:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-specific-password (NOT your Gmail password)
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-32-char-secret-key
FRONTEND_URL=https://your-frontend-domain.com
PORT=10000
```

### 2️⃣ Verify Gmail Configuration

**On your Gmail account:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" → "Windows Computer"
5. Generate password (16 characters)
6. Copy to Render as `EMAIL_PASS`

**Important:** Use the app-specific password, NOT your actual Gmail password

### 3️⃣ Test Email Sending

After deploying, test with curl:

```bash
curl -X POST https://intellichat-1.onrender.com/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test@gmail.com"}'
```

Check:
- ✅ Email arrives within 30 seconds
- ✅ Response shows `status: "success"`
- ✅ Check spam folder if not in inbox

### 4️⃣ Check Backend Logs on Render

**Render Dashboard → Your Service → Logs**

Look for:
- ❌ "Gmail SMTP connection failed" → Fix email config
- ✅ "Gmail SMTP configured" → Email is working
- ❌ "Failed to send OTP" → Check EMAIL_PASS
- ✅ "OTP sent successfully" → Working!

### 5️⃣ Verify Token Authentication

After verifying OTP:

```bash
# Get token from OTP verification response
# Then test check-auth endpoint

curl -X GET https://intellichat-1.onrender.com/api/auth/check-auth \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response: `status: 200` with user data

### 6️⃣ Frontend Debugging

Open browser DevTools → Network tab:

1. **Send OTP Request**
   - Check request body: `{"email": "test@example.com"}`
   - Check response status: `200` (success) or `400` (error)
   - Look for error message in response

2. **Verify OTP Request**
   - Check request body: `{"email": "test@example.com", "otp": "123456"}`
   - Check response includes `token` field
   - Token should be saved in `localStorage.auth_token`

3. **Check Auth Request**
   - Check Authorization header: `Bearer <token>`
   - Should return `status: 200` with user data
   - If `401`: Token is invalid or expired

---

## Common Issues & Fixes

### Issue: "Gmail SMTP connection failed"

**Solution:**
1. Check EMAIL_USER is set correctly
2. Check EMAIL_PASS is the app-specific password (has spaces)
3. Regenerate app password from Gmail account
4. Update Render environment variables
5. Redeploy backend

### Issue: "Invalid OTP" error

**Possible causes:**
- User entered wrong code
- OTP expired (valid for 5 minutes only)
- Database not saving OTP

**Solutions:**
- Make sure user copies code exactly from email
- Check MongoDB is connected
- Check emailOtp field exists in User model

### Issue: 401 error on check-auth

**Possible causes:**
- Token not in localStorage
- Token is invalid
- JWT_SECRET doesn't match
- Token header not "Bearer <token>"

**Solutions:**
- Check localStorage.auth_token exists after login
- Check JWT_SECRET is same on backend and Render
- Check Authorization header format: `Bearer <token>`
- Clear browser localStorage and retry

### Issue: "Continuous loading" after OTP verify

**Possible causes:**
- check-auth endpoint returning 401
- Protected route can't verify user
- Token missing or invalid

**Solutions:**
1. Open DevTools → Application → Local Storage
2. Check `auth_token` exists and has value
3. Copy token and test with curl (see above)
4. Check Render backend logs for errors
5. Redeploy if environment variables were updated

### Issue: "CORS error" on API calls

**Solution:**
- Check FRONTEND_URL in Render matches your frontend domain
- Should be: `https://your-frontend-domain.com` (no `/api`)
- Redeploy backend after updating

---

## Deployment Checklist

Before deploying, verify:

- [ ] MongoDB URI is correct and accessible
- [ ] Gmail app password is generated and correct
- [ ] EMAIL_USER and EMAIL_PASS are set on Render
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] FRONTEND_URL matches your frontend domain
- [ ] Backend compiles without errors (`npm run build`)
- [ ] All environment variables are set on Render
- [ ] Backend is redeployed after env changes

---

## Step-by-Step Test Flow

### 1. Test Email Service
```
1. Go to frontend login page
2. Enter your email
3. Click "Send OTP"
4. Check email inbox (wait 30 seconds max)
5. Should receive email with 6-digit code
```

**If not working:**
- Check Render logs for email errors
- Verify EMAIL_USER and EMAIL_PASS
- Try regenerating Gmail app password

### 2. Test OTP Verification
```
1. Copy 6-digit code from email
2. Paste into OTP input boxes
3. Click "Verify OTP"
4. Should show "OTP verified successfully"
```

**If 401 error:**
- Check backend logs for JWT errors
- Verify JWT_SECRET is set
- Check token is in localStorage

### 3. Test Protected Routes
```
1. After OTP verified, user should see profile setup
2. Complete profile creation
3. Should redirect to home page
4. If stuck on loading, protected route is failing
```

**If stuck:**
- Open DevTools → Network
- Check check-auth request
- Verify Authorization header has token

---

## Important Notes

### Gmail Security
- ✅ Use App Password (16 characters with spaces)
- ❌ Don't use actual Gmail password
- ✅ More secure than "Less secure apps"
- ✅ Can be revoked without changing Gmail password

### Token Management
- ✅ Token stored in localStorage on frontend
- ✅ Token sent with every request via Authorization header
- ✅ Token valid for (check JWT config)
- ❌ Don't hardcode tokens
- ❌ Don't commit .env file

### Production Security
- ✅ Use HTTPS (Render provides free SSL)
- ✅ Use strong JWT_SECRET
- ✅ Whitelist MongoDB IP
- ✅ Monitor error logs
- ✅ Keep dependencies updated

---

## Useful Commands

### Test Backend is Running
```bash
curl https://intellichat-1.onrender.com/api/auth/check-auth
# Should get 401 (expected - no token) or 400 (bad request)
# NOT 500 or connection error
```

### Check Email Config
```bash
# Check logs on Render for "Gmail SMTP"
# Should see: "Gmail SMTP configured and ready to send emails"
```

### Debug Frontend API Calls
```javascript
// In browser console
localStorage.auth_token // Should show token
axiosInstance.defaults.baseURL // Should show your API URL
```

---

## Contact Support

If issues persist:
1. Check all environment variables on Render
2. Check backend logs for errors
3. Test with curl commands above
4. Verify email account has app password set
5. Try redeploying backend

---

**Last Updated:** December 13, 2025  
**Status:** Troubleshooting Guide for Deployment Issues
