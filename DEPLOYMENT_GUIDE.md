# 🚀 CBBS Deployment Guide

Follow this guide to get your **College Bus Booking System** live on the internet! 

## 1. Prepare Your Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new Cluster (pick the free tier).
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
5. Go to **Clusters** -> **Connect** -> **Connect your application**.
6. Copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/cbbs`
7. Save this string! You'll need it for the backend setup.

---

## 2. Push Your Code to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `cbbs-main`.
2. In your terminal (in the project root), run:
   ```bash
   git init
   git add .
   git commit -m "initial commit for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/cbbs-main.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Deploy Backend (Render)
1. Go to [Render.com](https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository and select the `cbbs-main` repo.
4. Settings:
   - **Name**: `cbbs-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Environment Variables**:
   - `MONGO_URI`: (Paste your MongoDB Atlas string here)
   - `PORT`: `5001`
   - `FRONTEND_URL`: (You'll get this from Vercel in the next step - use `*` for now)
6. Click **Deploy**. Copy the service URL (e.g., `https://cbbs-backend.onrender.com`).

---

## 4. Deploy Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your `cbbs-main` repository.
4. In **Project Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_BASE`: `https://your-backend-url.onrender.com/api`
6. Click **Deploy**.

---

## ✅ Final Check
Once Vercel finishes, visit your website. Everything should be connected! 🎉

> [!TIP]
> **Remember**: If you change the Vercel URL, update the `FRONTEND_URL` in your Render settings for better security.
