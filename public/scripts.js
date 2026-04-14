const API_URL = ""; 

// Utility: Show Error Message
function showError(msg) {
    const errEl = document.getElementById("error-message");
    if (errEl) {
        errEl.innerText = msg;
        setTimeout(() => errEl.innerText = "", 3000);
    } else {
        alert(msg);
    }
}

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token && window.location.pathname.includes("dashboard")) {
        window.location.href = "index.html";
    }
}

// Global variable to keep tasks loaded in memory for modal viewing
let globalTasks = [];

document.addEventListener("DOMContentLoaded", () => {
    const pwInput = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassword");
    
    if(pwInput && toggleBtn) {
        toggleBtn.style.display = "none";
        
        pwInput.addEventListener("input", function() {
            if (pwInput.value.length > 0) toggleBtn.style.display = "block";
            else toggleBtn.style.display = "none";
        });
        
        toggleBtn.addEventListener("click", function() {
            const type = pwInput.getAttribute("type") === "password" ? "text" : "password";
            pwInput.setAttribute("type", type);
        });
    }

    // Set minimum date for task due dates to today
    const today = new Date().toISOString().split('T')[0];
    const addDueDate = document.getElementById("add-dueDate");
    const editDueDate = document.getElementById("edit-dueDate");
    
    if (addDueDate) addDueDate.setAttribute("min", today);
    if (editDueDate) editDueDate.setAttribute("min", today);
});

checkAuth();
if (window.location.pathname.includes("dashboard")) {
    loadDashboard();
}

async function login() {
    const username = document.getElementById("username").value;
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
        window.location.href = "dashboard.html";
    } else {
        showError(data.message || "Login failed");
    }
}

async function signup() {
    const username = document.getElementById("username").value;
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
        alert("Account Created!");
        window.location.href = "dashboard.html";
    } else {
        showError(data.message || "Signup failed");
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}

async function loadDashboard() {
    await loadStats();
    await applyFilters(); // Loads tasks with initial blank filters
}

async function loadStats() {
    const res = await fetch(API_URL + "/tasks/stats", { headers: getHeaders() });
    if(res.ok) {
        const stats = await res.json();
        const statBoxes = document.querySelectorAll(".stat-box h3");
        if(statBoxes.length >= 4) {
            statBoxes[0].innerText = stats.total;
            statBoxes[1].innerText = stats.pending;
            statBoxes[2].innerText = stats.inProgress;
            statBoxes[3].innerText = stats.completed;
        }
    }
}

async function addTask() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("desc").value;
    const priority = document.getElementById("add-priority").value;
    const dueDate = document.getElementById("add-dueDate").value;

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
        document.getElementById("desc").value = "";
        document.getElementById("add-dueDate").value = "";
        loadDashboard();
    } else {
        showError("Failed to add task.");
    }
}

// Appends filters onto internal loading
async function applyFilters() {
    const search = document.getElementById("filter-search").value;
    const status = document.getElementById("filter-status").value;
    const priority = document.getElementById("filter-priority").value;
    const dueDate = document.getElementById("filter-dueDate").value;

    let query = new URLSearchParams();
    if (search) query.append("search", search);
    if (status) query.append("status", status);
    if (priority) query.append("priority", priority);
    if (dueDate) query.append("dueDate", dueDate);

    const res = await fetch(API_URL + "/tasks?" + query.toString(), {
        headers: getHeaders()
    });

    if (res.status === 401 || res.status === 400) {
        logout(); 
        return;
    }

    const tasks = await res.json();
    globalTasks = tasks; // Save memory for modals
    
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const grid = document.getElementById("taskList");
    grid.innerHTML = "";

    if (tasks.length === 0) {
        grid.innerHTML = "<p style='text-align:center; color:#666; grid-column: 1 / -1;'>No tasks match your filters.</p>";
        return;
    }

    tasks.forEach(task => {
        const isCompleted = task.status === "completed";
        const dueDateObj = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

        let actionBtns = "";
        if (task.status === "pending") {
            actionBtns += `<button class="btn-progress" onclick="updateTaskStatus('${task._id}', 'in-progress')">Start</button>`;
        }
        if (task.status !== "completed") {
            actionBtns += `<button class="btn-complete" onclick="updateTaskStatus('${task._id}', 'completed')">Complete</button>`;
        }

        grid.innerHTML += `
        <div class="task-card ${isCompleted ? 'completed' : ''}">
            <div class="badges">
                <span class="badge priority-${task.priority}">${task.priority}</span>
                <span class="badge status-${task.status}">${task.status.replace("-", " ")}</span>
            </div>
            <div class="task-info">
                <strong>${task.title}</strong>
                <p>${task.description}</p>
                <p style="font-size:11px; color:#888;">Due: ${dueDateObj}</p>
            </div>
            <button class="btn-edit" onclick="openEditModal('${task._id}')">Edit Task</button>
            <div class="task-actions" style="margin-top: 0;">
                ${actionBtns}
                <button class="btn-history" onclick="showHistory('${task._id}')">History</button>
                <button class="btn-delete" onclick="deleteTask('${task._id}')">Delete</button>
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
        loadDashboard(); // Refresh tasks and stats
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
        loadDashboard();
    } else {
        showError("Failed to delete task");
    }
}

// Modal Logic
function showHistory(id) {
    const task = globalTasks.find(t => t._id === id);
    if(!task) return;

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

    document.getElementById("edit-id").value = task._id;
    document.getElementById("edit-title").value = task.title;
    document.getElementById("edit-desc").value = task.description;
    document.getElementById("edit-priority").value = task.priority;
    
    if (task.dueDate) {
        document.getElementById("edit-dueDate").value = new Date(task.dueDate).toISOString().split('T')[0];
    } else {
        document.getElementById("edit-dueDate").value = "";
    }

    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
}

async function submitEditTask() {
    const id = document.getElementById("edit-id").value;
    const title = document.getElementById("edit-title").value;
    const description = document.getElementById("edit-desc").value;
    const priority = document.getElementById("edit-priority").value;
    const dueDate = document.getElementById("edit-dueDate").value;

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
        loadDashboard();
    } else {
        showError("Failed to edit task");
    }
}