# 🚀 Full-Stack Deployment Guide (Free Tier)

This guide will walk you through deploying your **EduVerse Agentic AI** project for free using **Neon Console**, **Render**, and **Vercel**.

---

## 1. 🗄️ Database Setup (Neon Console)
Neon provides a serverless PostgreSQL database that is perfect for Render.

1.  Go to [Neon.tech](https://neon.tech/) and create a free project.
2.  In your Project Dashboard, go to **Connection Details**.
3.  Select **SQLAlchemy** or **URI** from the dropdown.
4.  Copy the **Connection String**.
    *   It should look like: `postgresql://alex:[PASSWORD]@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb`
5.  **Note**: The backend now automatically handles SSL and connection pooling for Neon.

---

## 2. ⚙️ Backend Deployment (Render)
Render will host your FastAPI backend.

1.  Go to [Render.com](https://render.com/) and create a **Web Service**.
2.  Connect your GitHub repository: `AI-based-learning-Project`.
3.  Set the following configuration:
    *   **Root Directory**: `eduverse/backend`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4.  Go to **Environment Variables** and add:
    *   `DATABASE_URL`: (The Supabase Connection String you copied)
    *   `GEMINI_API_KEY`: (Your Gemini API Key)
    *   `FRONTEND_URL`: (Wait until you deploy the frontend, then update this)

---

## 3. 🎨 Frontend Deployment (Vercel)
Vercel is the best way to deploy Vite/React apps.

1.  Go to [Vercel.com](https://vercel.com/) and import your GitHub repository.
2.  **Edit Settings**:
    *   **Root Directory**: `eduverse/frontend`
    *   **Framework Preset**: `Vite`
3.  Add **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api` (Copy this from your Render Dashboard)
4.  Click **Deploy**.

---

## 4. 🛠️ Initialize the Database
Once your backend is running on Render, you need to create the tables in Supabase.

1.  Open your terminal locally.
2.  Make sure you are in the `eduverse/backend` folder.
3.  Temporarily set your database URL in your terminal (Windows PowerShell):
    ```powershell
    $env:DATABASE_URL="your_supabase_connection_string"
    python init_db.py
    ```
4.  This will create all the tables (`students`, `chats`, `modules`, etc.) in your Supabase project.

---

## 🏁 Final Step (CORS Update)
Once your Vercel frontend is live (e.g., `https://eduverse-user.vercel.app`):
1.  Go back to your **Render Dashboard**.
2.  Update the `FRONTEND_URL` environment variable with your actual Vercel URL.
3.  This ensures the backend allows your live website to talk to it.

**You are now fully deployed! 🚀**
