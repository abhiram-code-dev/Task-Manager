# 📝 Task Manager (Zero-Config)

Welcome to the **Task Manager Application**! This is a simple, modern tool to help you manage your daily tasks with ease. It features a complete Express backend and a clean Vanilla JS frontend.

---

## ✨ Features

- **🔐 Secure Access:** JWT-based login and signup.
- **📊 Interactive Dashboard:** See your task statistics at a glance.
- **🛠️ Task Management:** Create, Edit, Delete, and Update tasks easily.
- **💾 Auto-Database:** No database installation required! (Includes an automatic In-Memory fallback).

---

## 🚀 Fast Start Guide (For your friend)

Follow these steps to get the app running on your computer in minutes:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Setup
Open your terminal in the project folder and run:
```powershell
npm run install-all
```
*This installs all the dependencies for both the frontend and backend.*

### 3. Start the Application
Run the following command:
```powershell
npm run dev
```

### 4. Open in Browser
Once the terminal says **"Mock Database Connected ✅"**, open:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 💡 Important Notes

- **Database:** This project is configured to use an **In-Memory Database** by default. This means you don't need to install anything, but **data will be cleared** when you stop the server.
- **Production Use:** To save data permanently, you can update the `MONGO_URI` in `backend/.env` with your own MongoDB Atlas connection string.
- **Project Structure:**
  - `/backend`: Core server logic, routes, and database configuration.
  - `/frontend`: HTML, CSS, and JS files served by the backend.

---

## 🎨 Future Enhancements
- [ ] Task due-date reminders.
- [ ] Drag-and-drop task sorting.
- [ ] Dark mode toggle.
- [ ] Multi-user collaboration.

Enjoy managing your tasks! 🎉