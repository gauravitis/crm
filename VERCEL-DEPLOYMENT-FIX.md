# Vercel Deployment Fix Guide

## 🚨 Issue
Getting 404 NOT_FOUND error when deploying React app to Vercel.

## 🔧 Solutions Applied

### 1. Updated Root `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm ci && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://crm-api-xi.vercel.app/api/$1"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Created Frontend-Specific `vercel.json`
Created `frontend/vercel.json` for better SPA routing:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://crm-api-xi.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Added Missing Dependency
Added `@radix-ui/react-progress` to package.json for the new dashboard components.

## 📋 Deployment Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Test Build Locally
```bash
npm run build
npm run preview
```

### Step 3: Deploy to Vercel
```bash
# If using Vercel CLI
vercel --prod

# Or push to GitHub and let Vercel auto-deploy
git add .
git commit -m "fix: Vercel deployment configuration"
git push origin master
```

## 🔍 Common Issues & Solutions

### Issue 1: Build Fails
**Symptoms**: Build process fails during deployment
**Solution**: 
- Check for TypeScript errors
- Ensure all dependencies are installed
- Verify import paths are correct

### Issue 2: 404 on Direct Routes
**Symptoms**: App works on homepage but 404 on `/dashboard`
**Solution**: 
- Ensure `vercel.json` has proper rewrites
- Check that `index.html` exists in build output

### Issue 3: API Calls Fail
**Symptoms**: Frontend loads but API calls return 404
**Solution**:
- Verify API rewrite rules in `vercel.json`
- Check API endpoint URLs
- Ensure CORS is configured on API server

### Issue 4: Environment Variables
**Symptoms**: App builds but features don't work
**Solution**:
- Add environment variables in Vercel dashboard
- Prefix with `VITE_` for Vite apps
- Redeploy after adding variables

## 🚀 Vercel Dashboard Configuration

### Environment Variables to Add:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Build Settings:
- **Framework Preset**: Vite
- **Build Command**: `cd frontend && npm ci && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `cd frontend && npm ci`

## 🔄 Alternative Deployment Method

If the above doesn't work, try deploying only the frontend:

### 1. Create New Vercel Project
- Import only the `frontend` folder
- Set root directory to `frontend`
- Use default Vite settings

### 2. Update API Calls
Update your API base URL in the frontend to point to your existing API:
```typescript
const API_BASE_URL = 'https://crm-api-xi.vercel.app';
```

## 📞 Troubleshooting Commands

### Check Build Output
```bash
cd frontend
npm run build
ls -la dist/  # Should show index.html and assets
```

### Test Locally
```bash
npm run preview
# Visit http://localhost:4173 and test routing
```

### Vercel Logs
```bash
vercel logs [deployment-url]
```

## ✅ Success Indicators

Your deployment is successful when:
- [ ] Homepage loads without errors
- [ ] Direct navigation to `/dashboard` works
- [ ] API calls return data (not 404)
- [ ] All routes are accessible
- [ ] No console errors in browser

## 🆘 If Still Not Working

1. **Check Vercel Function Logs**: Look for build errors
2. **Verify File Structure**: Ensure `index.html` is in the output directory
3. **Test API Separately**: Verify your API is working independently
4. **Contact Support**: Share the specific error messages and deployment logs

---

*This guide should resolve the 404 NOT_FOUND error and get your CRM v2 deployed successfully on Vercel.*