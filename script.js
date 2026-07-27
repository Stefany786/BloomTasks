const STORAGE_KEY = 'bloomTasks';
const CATEGORY_KEY = 'bloomCategories';

function loadTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadCategories() {
    let categories = JSON.parse(localStorage.getItem(CATEGORY_KEY));
    if (!categories || categories.length === 0) {
        categories = ['School', 'Home'];
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }
    return categories;
}

function formatISO(date) {
    return date.toISOString().split('T')[0];
}

const taskList = document.getElementById('taskList');
const garden = document.getElementById('garden');
const celebration = document.getElementById('celebration');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const categoryFilters = document.getElementById('categoryFilters');

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('calendarSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const monthLabel = document.getElementById('monthLabel');
const calendarGrid = document.getElementById('calendarGrid');

const todayISO = formatISO(new Date());
let selectedDate = todayISO;
let selectedCategory = 'All';
let viewMonth = new Date();

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
}
menuToggle.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

prevMonthBtn.addEventListener('click', () => {
    viewMonth.setMonth(viewMonth.getMonth() - 1);
    renderCalendar();
});
nextMonthBtn.addEventListener('click', () => {
    viewMonth.setMonth(viewMonth.getMonth() + 1);
    renderCalendar();
});

function renderCalendar() {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    monthLabel.textContent = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const tasks = loadTasks();
    const datesWithTasks = new Set(tasks.map(t => t.date));

    calendarGrid.innerHTML = '';

    for (let i = 0; i < startOffset; i++) {
        const blank = document.createElement('div');
        blank.classList.add('calendar-cell', 'empty');
        calendarGrid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const iso = formatISO(dateObj);

        const cell = document.createElement('button');
        cell.classList.add('calendar-cell');
        cell.textContent = day;
        if (iso === todayISO) cell.classList.add('today');
        if (iso === selectedDate) cell.classList.add('selected');
        if (datesWithTasks.has(iso)) cell.classList.add('has-tasks');

        cell.addEventListener('click', () => {
            selectedDate = iso;
            renderCalendar();
            renderTasks();
            closeSidebar();
        });

        calendarGrid.appendChild(cell);
    }
}

function renderCategoryFilters() {
    const categories = ['All', ...loadCategories()];
    categoryFilters.innerHTML = '';
    categories.forEach(cat => {
        const chip = document.createElement('button');
        chip.classList.add('category-chip');
        if (cat === selectedCategory) chip.classList.add('active');
        chip.textContent = cat;
        chip.addEventListener('click', () => {
            selectedCategory = cat;
            renderCategoryFilters();
            renderTasks();
        });
        categoryFilters.appendChild(chip);
    });
}

const priorityRank = { high: 0, medium: 1, low: 2 };

function renderTasks() {
    let tasks = loadTasks().filter(t => t.date === selectedDate);
    if (selectedCategory !== 'All') {
        tasks = tasks.filter(t => t.category === selectedCategory);
    }
    tasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed - b.completed;
        return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
    });

    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        li.classList.add('priority-' + (task.priority || 'medium'));

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.classList.add('task-checkbox');
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const info = document.createElement('div');
        info.classList.add('task-info');

        const span = document.createElement('span');
        span.classList.add('task-text');
        span.textContent = task.text;
        info.appendChild(span);

        const meta = document.createElement('div');
        meta.classList.add('task-meta');
        if (task.category) {
            const badge = document.createElement('span');
            badge.classList.add('category-badge');
            badge.textContent = task.category;
            meta.appendChild(badge);
        }
        if (task.time) {
            const timeSpan = document.createElement('span');
            timeSpan.classList.add('task-time');
            timeSpan.textContent = task.time;
            meta.appendChild(timeSpan);
        }
        info.appendChild(meta);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(info);
        li.appendChild(deleteBtn);

        li.addEventListener('click', () => {
            window.location.href = `add-task.html?id=${task.id}`;
        });

        taskList.appendChild(li);
    });

    updateGarden(tasks);

    const dateObj = new Date(selectedDate + 'T00:00:00');
    selectedDateLabel.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function toggleTask(id) {
    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    saveTasks(tasks);
    renderCalendar();
    renderTasks();

    if (task.completed) {
        launchConfetti(12);
        checkAllDone();
    }
}

function deleteTask(id) {
    const tasks = loadTasks().filter(t => t.id !== id);
    saveTasks(tasks);
    renderCalendar();
    renderTasks();
}

function updateGarden(tasks) {
    const completedCount = tasks.filter(t => t.completed).length;
    garden.textContent = '🌸'.repeat(completedCount);
}

function checkAllDone() {
    const tasks = loadTasks().filter(t => t.date === selectedDate);
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
        showCelebration();
    }
}

function showCelebration() {
    celebration.classList.add('show');
    launchConfetti(30);
    setTimeout(() => celebration.classList.remove('show'), 2500);
}

function launchConfetti(count) {
    const emojis = ['🌸', '🎀', '💗', '✨'];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('span');
        piece.classList.add('confetti-piece');
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.animationDuration = 2 + Math.random() * 2 + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 4000);
    }
}

renderCalendar();
renderCategoryFilters();
renderTasks();