const STORAGE_KEY = 'bloomTasks';
const CATEGORY_KEY = 'bloomCategories';

const form = document.getElementById('taskForm');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const detailsInput = document.getElementById('detailsInput');
const taskNameInput = document.getElementById('taskName');
const pageTitle = document.getElementById('pageTitle');
const submitBtn = document.getElementById('submitBtn');

const params = new URLSearchParams(window.location.search);
const editId = params.get('id') ? Number(params.get('id')) : null;

function loadCategories() {
    let categories = JSON.parse(localStorage.getItem(CATEGORY_KEY));
    if (!categories || categories.length === 0) {
        categories = ['School', 'Home'];
        localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
    }
    return categories;
}

function saveCategories(categories) {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function renderCategoryOptions(selected) {
    const categories = loadCategories();
    categorySelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === selected) option.selected = true;
        categorySelect.appendChild(option);
    });
}

addCategoryBtn.addEventListener('click', () => {
    const name = newCategoryInput.value.trim();
    if (name === '') return;
    const categories = loadCategories();
    if (!categories.includes(name)) {
        categories.push(name);
        saveCategories(categories);
    }
    renderCategoryOptions(name);
    newCategoryInput.value = '';
});

function loadTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

function init() {
    renderCategoryOptions();
    dateInput.value = todayISO();

    if (editId) {
        const task = loadTasks().find(t => t.id === editId);
        if (task) {
            pageTitle.textContent = 'Edit Task';
            submitBtn.textContent = 'Save Changes 🌸';
            taskNameInput.value = task.text;
            dateInput.value = task.date;
            timeInput.value = task.time || '';
            prioritySelect.value = task.priority || 'medium';
            renderCategoryOptions(task.category);
            detailsInput.value = task.details || '';
        }
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskNameInput.value.trim();
    if (text === '') return;

    const tasks = loadTasks();

    if (editId) {
        const task = tasks.find(t => t.id === editId);
        task.text = text;
        task.date = dateInput.value;
        task.time = timeInput.value;
        task.priority = prioritySelect.value;
        task.category = categorySelect.value;
        task.details = detailsInput.value.trim();
    } else {
        tasks.push({
            id: Date.now(),
            text: text,
            date: dateInput.value,
            time: timeInput.value,
            priority: prioritySelect.value,
            category: categorySelect.value,
            details: detailsInput.value.trim(),
            completed: false
        });
    }

    saveTasks(tasks);
    window.location.href = 'index.html';
});

init();