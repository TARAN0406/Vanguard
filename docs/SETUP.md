# Project Setup Guide

Follow these instructions to run the Vanguard Insider Threat Portal locally on your machine for evaluation.

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## 1. Clone the Repository
Extract the submission zip file or clone the repository from GitHub:
```bash
git clone <your-repo-link>
cd vanguard-root
```

## 2. Start the Backend API
The backend serves the telemetry data and hosts the risk-scoring simulation.
```bash
cd backend
npm install
npm run start
```

The backend will start on `http://localhost:5000`.

## 3. Start the Frontend Application
Open a new terminal window/tab, and run the React frontend:
```bash
cd vanguard-root/frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 4. Evaluate the Application
1. Open your browser and navigate to `http://localhost:5173`.
2. **Login:** Use any placeholder credentials (e.g., `admin` / `password`) to access the dashboard.
3. Explore the **Risk Distribution** charts, view **Honeypot Events**, and dive into a high-risk employee's **Intelligence Portal**.
4. To view the transparent data logging from the consumer's perspective, navigate to `http://localhost:5173/client-portal`.

## Troubleshooting
- **Port Conflicts:** If ports 5000 or 5173 are occupied, the applications will automatically attempt to bind to the next available port. Please check the terminal output for the exact URL.
- **Dark Mode Stuck:** We utilize Tailwind CSS v3.4 `selector` mode. If the theme toggle appears stuck on your machine, try a hard refresh (`Ctrl + Shift + R`) to clear browser cache.
