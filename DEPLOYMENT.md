# Deployment Guide - Job Journey Log

## Netlify Deployment

### Prerequisites
- GitHub repository with your code
- Netlify account (free)
- Supabase project configured

### Step 1: Prepare Your Environment Variables

Before deploying, make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended)

1. **Go to [Netlify](https://netlify.com)** and sign in
2. **Click "Add new site"** → "Import an existing project"
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or latest LTS)
5. **Add environment variables**:
   - Go to Site settings → Environment variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. **Deploy!** Click "Deploy site"

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Step 3: Configure Environment Variables

After deployment, add your environment variables in Netlify:

1. Go to your site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### Step 4: Test Your Deployment

1. Visit your Netlify URL
2. Test the sign-up/sign-in functionality
3. Verify that data is being saved to Supabase
4. Test all features (add/edit placements, export, etc.)

### Build Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

### Troubleshooting

#### Common Issues:

1. **Environment Variables Not Working**
   - Make sure they're set in Netlify dashboard
   - Redeploy after adding variables

2. **404 Errors on Refresh**
   - The `netlify.toml` file handles this with redirects

3. **Build Failures**
   - Check Node.js version (use 18+)
   - Ensure all dependencies are in `package.json`

4. **Supabase Connection Issues**
   - Verify your Supabase URL and key
   - Check Supabase RLS policies
   - Ensure your Supabase project is active

### Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Add your custom domain
3. Configure DNS settings as instructed

### Continuous Deployment

Your site will automatically redeploy when you push to your main branch on GitHub.

### Performance Tips

- The app is optimized for production with Vite
- Images and assets are automatically optimized
- Dark/light mode preferences are saved locally
- Export functionality works client-side

---

**Your app is now live! 🚀**

Remember to:
- Test all features thoroughly
- Monitor your Supabase usage
- Keep your environment variables secure
- Update your README with the live URL 