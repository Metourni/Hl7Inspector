# Deployment Guide for HL7 Explorer

## Option 1: Deploy to Vercel (Recommended - Easiest for Next.js)

### Method A: Using Vercel Web Interface (No CLI needed)

1. **Push your code to GitHub/GitLab/Bitbucket:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HL7 Explorer"
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign up/login

3. **Click "New Project"**

4. **Import your Git repository**

5. **Vercel will auto-detect Next.js** - just click "Deploy"

6. **Your app will be live in ~2 minutes!**

### Method B: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts** - it will ask you to login and configure the project

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

---

## Option 2: Deploy to Netlify

1. **Push your code to a Git repository**

2. **Go to [netlify.com](https://netlify.com)** and sign up/login

3. **Click "Add new site" → "Import an existing project"**

4. **Connect your Git repository**

5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

6. **Click "Deploy site"**

---

## Option 3: Deploy to AWS Amplify

1. **Push your code to a Git repository**

2. **Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)**

3. **Click "New app" → "Host web app"**

4. **Connect your Git repository**

5. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `.next`

6. **Save and deploy**

---

## Option 4: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   railway init
   railway up
   ```

---

## Pre-Deployment Checklist

- ✅ Build passes: `npm run build`
- ✅ No TypeScript errors
- ✅ All dependencies are in `package.json`
- ✅ Environment variables (if any) are configured
- ✅ Git repository is set up (for most platforms)

---

## Quick Start (Recommended: Vercel Web Interface)

The fastest way to deploy:

1. Initialize git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a new repo on GitHub, then:
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your GitHub repository

4. Click Deploy - that's it!

Your app will be live at: `https://your-project-name.vercel.app`

---

## Environment Variables

If you need to add environment variables later:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment Variables
- **AWS Amplify**: App Settings → Environment Variables

---

## Custom Domain

After deployment, you can add a custom domain:
- **Vercel**: Project Settings → Domains
- **Netlify**: Domain Settings → Add custom domain
- **AWS Amplify**: App Settings → Domain Management

