# 📝 Task Manager Application

Welcome to the Task Manager Application! This is a very simple tool to help you keep track of your daily tasks and to-do lists. 

Anyone can use it to stay organized!

---

## ✨ What can you do with this app?

- **Log In:** Safely enter your account.
- **Add Tasks:** Write down new things you need to do.
- **View Tasks:** See all your tasks in one neat list.
- **Edit Tasks:** Change the details of a task if you made a mistake or things change.
- **Delete Tasks:** Remove a task once you are done with it!

---

## 🛠️ What do you need to run it?

To run this app on your computer, you just need a few basic programs installed:

1. **Node.js** (This helps the app run)
2. **MongoDB** (This saves your tasks so they don't disappear)

---

## 🚀 How to Start the App

Follow these easy steps to get the app running on your computer:

### 1. Download the App
Download the project folder and open it on your computer. Let's say you put it in `D:\task_manager`.

### 2. Open Your Command Prompt (Terminal)
Open your terminal or command prompt and go to the folder where you saved the app:
```bash
cd D:\task_manager
```

### 3. Install the Helper Files
Type this command and press Enter. It downloads all the little extra tools the app needs to work:
```bash
npm install express mongoose cors body-parser bcryptjs jsonwebtoken
```

### 4. Start the Database (MongoDB)
Open an extra terminal window and type this to start the database (so your tasks can be saved):
```bash
mongod
```
*Keep this window open in the background!*

### 5. Start the App
Go back to your first terminal window and type this to start the app:
```bash
node server.js
```
You should see a message saying "Server running on port 5000" if it worked perfectly.

---

## 🌐 How to Use the App

Once everything is running, open your favorite web browser (like Chrome, Edge, Safari, or Firefox) and type in this address:

**[http://localhost:5000/login.html](http://localhost:5000/login.html)**

From there, you can log in, see your dashboard, and start adding and managing all your tasks! 

---

## 💡 Future Plans
We are always looking to make this app better. In the future, we plan to add things like:
- A way to create a new user account (Sign Up)
- Stronger security and logins
- Task due dates and priorities (High, Medium, Low)
- A "Completed" button so you can check things off your list
- A fresh, modern new look for the screens

Enjoy managing your tasks! 🎉