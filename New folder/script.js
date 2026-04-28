        let tasks = [];
        let currentFilter = "all";
        let searchText = "";
        let sortBy = "newest";

        const priorityOrder = { High: 0, Medium: 1, Low: 2 };

        const taskInput   = document.getElementById("taskInput");
        const taskList    = document.getElementById("taskList");
        const prioritySel = document.getElementById("prioritySel");
        const dateInput   = document.getElementById("dateInput");
        const searchInput = document.getElementById("searchInput");
        const sortSel     = document.getElementById("sortSel");
        const darkBtn     = document.getElementById("darkModeBtn");

        document.getElementById("dateLabel").textContent = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

        function saveTasks() {
            localStorage.setItem("tasks_v2", JSON.stringify(tasks));
        }

        function loadTasks() {
            const stored = localStorage.getItem("tasks_v2");
            tasks = stored ? JSON.parse(stored) : [];
        }

        function todayStr() {
            return new Date().toISOString().split("T")[0];
        }

        function isOverdue(task) {
            return task.dueDate && !task.completed && task.dueDate < todayStr();
        }

        function getSorted(arr) {
            return [...arr].sort((a, b) => {
                if (sortBy === "priority") {
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                }
                if (sortBy === "duedate") {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return a.dueDate.localeCompare(b.dueDate);
                }
                if (sortBy === "oldest") return a.id - b.id;
                return b.id - a.id;
            });
        }

        function updateStats() {
            const total = tasks.length;
            const done  = tasks.filter(t => t.completed).length;
            const left  = total - done;
            const pct   = total ? Math.round((done / total) * 100) : 0;

            document.getElementById("statTotal").textContent = total;
            document.getElementById("statDone").textContent  = done;
            document.getElementById("statLeft").textContent  = left;
            document.getElementById("progressFill").style.width = pct + "%";
            document.getElementById("progressPct").textContent  = pct + "%";
        }

        function renderTasks() {
            let filtered = tasks;

            if (currentFilter === "active")    filtered = filtered.filter(t => !t.completed);
            if (currentFilter === "completed") filtered = filtered.filter(t => t.completed);
            if (currentFilter === "overdue")   filtered = filtered.filter(t => isOverdue(t));

            if (searchText) {
                filtered = filtered.filter(t =>
                    t.text.toLowerCase().includes(searchText.toLowerCase())
                );
            }

            filtered = getSorted(filtered);
            updateStats();

            if (filtered.length === 0) {
                taskList.innerHTML = `
                    <div class="empty">
                        <div class="empty-icon">📋</div>
                        No tasks here yet
                    </div>
                `;
                return;
            }

            taskList.innerHTML = "";

            filtered.forEach(task => {
                const overdue = isOverdue(task);

                const li = document.createElement("div");
                li.className = "task-item" + (overdue ? " overdue" : "");

                const check = document.createElement("button");
                check.className = "check-btn" + (task.completed ? " done" : "");
                check.title = task.completed ? "Mark as active" : "Mark as done";
                check.onclick = () => {
                    task.completed = !task.completed;
                    saveTasks();
                    renderTasks();
                };

                const body = document.createElement("div");
                body.className = "task-body";

                const textEl = document.createElement("div");
                textEl.className = "task-text" + (task.completed ? " done" : "");
                textEl.textContent = task.text;
                textEl.title = task.text;
                textEl.onclick = () => {
                    task.completed = !task.completed;
                    saveTasks();
                    renderTasks();
                };

                const meta = document.createElement("div");
                meta.className = "task-meta";

                const badge = document.createElement("span");
                badge.className = "badge badge-" + task.priority.toLowerCase();
                badge.textContent = task.priority;
                meta.appendChild(badge);

                if (task.dueDate) {
                    const dateTag = document.createElement("span");
                    dateTag.className = overdue ? "overdue-tag" : "date-tag";
                    const d = new Date(task.dueDate + "T00:00:00");
                    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    dateTag.textContent = overdue ? "⚠ Overdue · " + formatted : formatted;
                    meta.appendChild(dateTag);
                }

                body.appendChild(textEl);
                body.appendChild(meta);

                const actions = document.createElement("div");
                actions.className = "task-actions";

                const editBtn = document.createElement("button");
                editBtn.className = "icon-btn";
                editBtn.title = "Edit task";
                editBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1.793 1.793-2.647-2.647L12.855.999a.5.5 0 0 1 .707 0l1.94 1.94z"/>
                        <path d="M11.207 3.207 3 11.414V14h2.586l8.207-8.207-2.586-2.586z"/>
                    </svg>
                `;
                editBtn.onclick = () => {
                    const newText = prompt("Edit task:", task.text);
                    if (newText && newText.trim() !== "") {
                        task.text = newText.trim();
                        saveTasks();
                        renderTasks();
                    }
                };

                const delBtn = document.createElement("button");
                delBtn.className = "icon-btn del";
                delBtn.title = "Delete task";
                delBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm4 0A.5.5 0 0 1 10 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5.5l1-1h3l1 1H13.5a1 1 0 0 1 1 1zM4 4v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4z"/>
                    </svg>
                `;
                delBtn.onclick = () => {
                    tasks = tasks.filter(t => t !== task);
                    saveTasks();
                    renderTasks();
                };

                actions.appendChild(editBtn);
                actions.appendChild(delBtn);

                li.appendChild(check);
                li.appendChild(body);
                li.appendChild(actions);
                taskList.appendChild(li);
            });
        }

        document.getElementById("addTaskBtn").onclick = () => {
            const text = taskInput.value.trim();
            if (!text) {
                taskInput.focus();
                return;
            }

            tasks.push({
                id: Date.now(),
                text: text,
                completed: false,
                priority: prioritySel.value,
                dueDate: dateInput.value || null
            });

            taskInput.value = "";
            dateInput.value = "";
            prioritySel.value = "Medium";

            saveTasks();
            renderTasks();
        };

        taskInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("addTaskBtn").click();
            }
        });

        document.getElementById("clearCompletedBtn").onclick = () => {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        };

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = btn.dataset.filter;
                renderTasks();
            };
        });

        sortSel.addEventListener("change", () => {
            sortBy = sortSel.value;
            renderTasks();
        });

        searchInput.addEventListener("input", function() {
            searchText = this.value.trim();
            renderTasks();
        });

        if (localStorage.getItem("darkMode") === "1") {
            document.body.classList.add("dark");
            darkBtn.textContent = "☀️ Light";
        }

        darkBtn.onclick = () => {
            document.body.classList.toggle("dark");
            const isDark = document.body.classList.contains("dark");
            darkBtn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
            localStorage.setItem("darkMode", isDark ? "1" : "0");
        };

        loadTasks();
        renderTasks();