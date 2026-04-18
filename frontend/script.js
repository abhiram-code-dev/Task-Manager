const API_URL = "";

// ── TOAST NOTIFICATIONS ──────────────────────────────────────────
function showToast(msg, type = "default") {
    const container = document.getElementById("toastContainer");
    if (!container) { alert(msg); return; }
    const toast = document.createElement("div");
    toast.className = "toast " + (type === "error" ? "error-toast" : type === "success" ? "success-toast" : "");
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(16px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function showError(msg) {
    showToast(msg, "error");
    const errEl = document.getElementById("error-message");
    if (errEl) {
        errEl.innerText = msg;
        setTimeout(() => errEl.innerText = "", 3000);
    }
}

// ── AUTH GUARD ───────────────────────────────────────────────────
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token && window.location.pathname.includes("dashboard")) {
        window.location.href = "index.html";
    }
}

let globalTasks = [];

document.addEventListener("DOMContentLoaded", () => {
    // Password toggle
    const pwInput  = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassword");
    if (pwInput && toggleBtn) {
        pwInput.addEventListener("input", () => {
            toggleBtn.style.display = pwInput.value.length > 0 ? "flex" : "none";
        });
        toggleBtn.addEventListener("click", () => {
            pwInput.type = pwInput.type === "password" ? "text" : "password";
        });
    }

    // Min date for due date inputs
    const today = new Date().toISOString().split("T")[0];
    ["add-dueDate", "edit-dueDate"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute("min", today);
    });

    // Username and Date in header
    const headerUser = document.getElementById("header-username");
    const dateEl     = document.getElementById("dashboard-date");
    if (headerUser) {
        const uname = localStorage.getItem("username");
        headerUser.textContent = uname ? "👤 " + uname : "";
    }
    if (dateEl) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
});

checkAuth();
if (window.location.pathname.includes("dashboard")) {
    loadDashboard();
}

// ── AUTH ─────────────────────────────────────────────────────────
async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (!username || !password) return showError("Please enter all fields");

    const res = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        window.location.href = "dashboard.html";
    } else {
        showError(data.message || "Login failed");
    }
}

async function signup() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (!username || !password) return showError("Please enter all fields");

    const res = await fetch(API_URL + "/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", username);
        window.location.href = "dashboard.html";
    } else {
        showError(data.message || "Signup failed");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}

// ── DASHBOARD ────────────────────────────────────────────────────
async function loadDashboard() {
    await loadStats();
    await applyFilters();
}

async function loadStats() {
    const res = await fetch(API_URL + "/tasks/stats", { headers: getHeaders() });
    if (res.ok) {
        const s = await res.json();
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        set("stat-total",      s.total);
        set("stat-pending",    s.pending);
        set("stat-inprogress", s.inProgress);
        set("stat-completed",  s.completed);
    }
}

async function addTask() {
    const title       = document.getElementById("title").value.trim();
    const description = document.getElementById("desc").value.trim();
    const priority    = document.getElementById("add-priority").value;
    const dueDate     = document.getElementById("add-dueDate").value;

    if (!title || !description) return showError("Please fill out title and description");

    const body = { title, description, priority, status: "pending" };
    if (dueDate) body.dueDate = dueDate;

    const res = await fetch(API_URL + "/tasks/add", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    if (res.ok) {
        document.getElementById("title").value = "";
        document.getElementById("desc").value  = "";
        document.getElementById("add-dueDate").value = "";
        showToast("Task added!", "success");
        loadDashboard();
    } else {
        showError("Failed to add task.");
    }
}

async function applyFilters() {
    const search   = document.getElementById("filter-search").value;
    const status   = document.getElementById("filter-status").value;
    const priority = document.getElementById("filter-priority").value;
    const dueDate  = document.getElementById("filter-dueDate").value;

    const query = new URLSearchParams();
    if (search)   query.append("search",   search);
    if (status)   query.append("status",   status);
    if (priority) query.append("priority", priority);
    if (dueDate)  query.append("dueDate",  dueDate);

    const res = await fetch(API_URL + "/tasks?" + query.toString(), { headers: getHeaders() });
    if (res.status === 401 || res.status === 400) { logout(); return; }

    const tasks = await res.json();
    globalTasks = tasks;
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const grid = document.getElementById("taskList");
    grid.innerHTML = "";

    if (tasks.length === 0) {
        grid.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">📭</span>
            <p>No tasks found. Add one above!</p>
          </div>`;
        return;
    }

    tasks.forEach(task => {
        const isCompleted = task.status === "completed";
        const dueDateStr  = task.dueDate
            ? "📅 " + new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "No due date";

        let actionBtns = "";
        if (task.status === "pending") {
            actionBtns += `<button class="btn-progress" onclick="updateTaskStatus('${task._id}', 'in-progress')">▶ Start</button>`;
        }
        if (task.status !== "completed") {
            actionBtns += `<button class="btn-complete" onclick="updateTaskStatus('${task._id}', 'completed')">✓ Done</button>`;
        }

        grid.innerHTML += `
        <div class="task-card priority-${task.priority}-card ${isCompleted ? "completed" : ""}">
          <div class="badges">
            <span class="badge priority-${task.priority}">${task.priority}</span>
            <span class="badge status-${task.status}">${task.status.replace("-", " ")}</span>
          </div>
          <div class="task-title">${task.title}</div>
          <div class="task-desc">${task.description}</div>
          <div class="task-due">${dueDateStr}</div>
          <div class="task-actions">
            <button class="btn-edit" onclick="openEditModal('${task._id}')">✏ Edit</button>
            ${actionBtns}
            <button class="btn-history" onclick="showHistory('${task._id}')">📜 Log</button>
            <button class="btn-delete"  onclick="deleteTask('${task._id}')">🗑 Delete</button>
          </div>
        </div>`;
    });
}

async function updateTaskStatus(id, newStatus) {
    const res = await fetch(API_URL + "/tasks/" + id, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
        showToast("Status updated", "success");
        loadDashboard();
    } else {
        showError("Failed to update status");
    }
}

async function deleteTask(id) {
    const res = await fetch(API_URL + "/tasks/" + id, {
        method: "DELETE",
        headers: getHeaders()
    });
    if (res.ok) {
        showToast("Task deleted");
        loadDashboard();
    } else {
        showError("Failed to delete task");
    }
}

// ── MODALS ───────────────────────────────────────────────────────
function showHistory(id) {
    const task = globalTasks.find(t => t._id === id);
    if (!task) return;
    document.getElementById("modal-task-title").innerText = "History: " + task.title;
    const list = document.getElementById("modal-history-list");
    list.innerHTML = "";
    task.history.slice().reverse().forEach(log => {
        const dateStr = new Date(log.date).toLocaleString();
        list.innerHTML += `<li>${log.action} <span>${dateStr}</span></li>`;
    });
    document.getElementById("historyModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("historyModal").style.display = "none";
}

function openEditModal(id) {
    const task = globalTasks.find(t => t._id === id);
    if (!task) return;
    document.getElementById("edit-id").value       = task._id;
    document.getElementById("edit-title").value    = task.title;
    document.getElementById("edit-desc").value     = task.description;
    document.getElementById("edit-priority").value = task.priority;
    document.getElementById("edit-dueDate").value  = task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0] : "";
    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

async function submitEditTask() {
    const id          = document.getElementById("edit-id").value;
    const title       = document.getElementById("edit-title").value.trim();
    const description = document.getElementById("edit-desc").value.trim();
    const priority    = document.getElementById("edit-priority").value;
    const dueDate     = document.getElementById("edit-dueDate").value;

    if (!title || !description) return showError("Please fill out title and description");

    const body = { title, description, priority };
    if (dueDate) body.dueDate = dueDate;

    const res = await fetch(API_URL + "/tasks/" + id, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    if (res.ok) {
        closeEditModal();
        showToast("Task updated", "success");
        loadDashboard();
    } else {
        showError("Failed to edit task");
    }
}