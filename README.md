# Supermarket Price Comparison Platform

This is a modern, responsive, full-stack application built to compare grocery prices across Pakistani supermarkets (Imtiaz, Naheed, Chase Up).

## System Architecture (MVC)
*   **Frontend:** ReactJS + Vite (Raw CSS with Glassmorphism UI)
*   **Backend:** Node.js + Express (RESTful APIs)
*   **Database:** MySQL (3NF Normalized Schema)
*   **Automation:** Node-Cron (Background Worker for Real-Time Price Scraping Simulation)

## How to Run

### 1. Database Setup
Ensure you have MySQL running (a Docker container works best mapping to port `3306`).
```bash
cd backend
node reseed.js
```
This script will construct the `supermarket_db` and insert real authentic Pakistani grocery items.

### 2. Run Backend API
```bash
cd backend
npm install
npm run dev
```

### 3. Run Frontend App
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the Customer Interface.
Visit `http://localhost:5173/admin` to manage the inventory (Default Credentials: `admin` / `admin`).
