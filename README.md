<div align="center">
  <img src="public/banner.png" alt="EcoSphere Banner" width="100%" />

  <br />
  <br />

  <h1>🌍 EcoSphere</h1>
  
  <p>
    <strong>Enterprise ESG Intelligence & Carbon Management Platform</strong>
  </p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#3d-interactive-experience">3D Experience</a> •
    <a href="#tech-stack">Tech Stack</a>
  </p>
</div>

---

## ⚡ Overview

**EcoSphere** is a next-generation Environmental, Social, and Governance (ESG) dashboard designed for modern enterprises. It provides real-time carbon tracking, compliance auditing, and gamified sustainability challenges to drive corporate responsibility from the ground up.

Crafted with a premium **glassmorphism aesthetic**, **dark mode first** design, and blazing fast performance, EcoSphere doesn't just track data—it makes sustainability look beautiful.

## ✨ Key Features

- **🌱 Carbon Footprint Tracking**: Log, categorize, and calculate Scope 1, 2, and 3 emissions dynamically.
- **🛡️ Governance & Compliance**: Manage compliance issues, audit logs, and resolution workflows with built-in PDF & CSV reporting.
- **🎮 Gamification & Challenges**: Engage employees with sustainability challenges, badges, and real-time leaderboards.
- **📊 Real-time Analytics**: Beautiful, interactive charts powered by Recharts.
- **📄 Advanced Reporting**: Export massive datasets seamlessly into structured PDFs and CSVs directly from the dashboard.
- **🔒 Enterprise Security**: Role-based access control (RBAC), secure sessions with NextAuth, and fortified API endpoints.

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecosphere.git
   cd ecosphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.local.example` to `.env.local` (or configure your `.env`) and add your database credentials.
   ```bash
   # .env
   DATABASE_URL="postgresql://user:password@localhost:5432/ecosphere"
   AUTH_SECRET="your-super-secret-auth-key"
   ```

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   *Your app will be running at `http://localhost:3000`*

## 🌐 3D Interactive Experience

This repository comes with a custom-built, fully interactive **Three.js 3D Globe** visualization designed specifically for EcoSphere presentations and README banners. 

Because GitHub sanitizes Markdown and prevents running raw WebGL scripts directly in the `README.md`, I've built this as an interactive module inside the app.

**To view the 3D Demo:**
1. Start the dev server (`npm run dev`).
2. Navigate to `http://localhost:3000/3d-demo.html` in your browser.
3. *Tip: You can use screen recording software to capture the spinning glowing globe and replace `public/banner.png` with an animated GIF to make this README truly next-level!*

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (v5)
- **PDF Generation**: jsPDF + autoTable
- **3D Visualization**: Three.js

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/ecosphere/issues).

---

<div align="center">
  <p>Built with 💚 for a sustainable future.</p>
</div>
