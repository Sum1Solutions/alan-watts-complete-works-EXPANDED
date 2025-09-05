# Deploying to Cloudflare Pages

## Option 1: Direct GitHub Integration (Recommended)

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to "Workers & Pages" in the sidebar

2. **Create a New Pages Project**
   - Click "Create application"
   - Select "Pages" tab
   - Click "Connect to Git"

3. **Connect Your GitHub Repository**
   - Authorize Cloudflare to access your GitHub account
   - Select the repository: `Sum1Solutions/alan-watts-complete-works-EXPANDED`
   - Click "Begin setup"

4. **Configure Build Settings**
   - **Project name**: alan-watts-complete-works (or your preferred name)
   - **Production branch**: main (or master, depending on your default branch)
   - **Framework preset**: Select "Vite"
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave as default)
   - **Environment variables**: (Add if needed)

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the initial deployment to complete
   - Your site will be available at: `https://[your-project-name].pages.dev`

## Option 2: Manual Deployment via Wrangler CLI

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Build Your Project**
   ```bash
   npm run build
   ```

3. **Deploy to Cloudflare Pages**
   ```bash
   npx wrangler pages deploy dist --project-name=alan-watts-complete-works
   ```

4. **First-time Setup**
   - You'll be prompted to authenticate with your Cloudflare account
   - Follow the browser authentication flow
   - Choose your account and confirm permissions

## Option 3: GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: alan-watts-complete-works
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**To set up GitHub Actions:**
1. Get your Cloudflare API Token:
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Cloudflare Pages:Edit" permissions
   
2. Get your Account ID:
   - Find it in Cloudflare dashboard URL or account settings
   
3. Add secrets to GitHub:
   - Go to repository Settings → Secrets and variables → Actions
   - Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

## Custom Domain Setup (Optional)

After deployment, you can add a custom domain:

1. In Cloudflare Pages dashboard, go to your project
2. Navigate to "Custom domains" tab
3. Click "Set up a custom domain"
4. Enter your domain name
5. Follow the DNS configuration instructions

## Build Optimization for Cloudflare

Your current Vite configuration is already optimized, but you can add these for better performance: