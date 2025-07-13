// Global variables
let todos = [];
let products = [
    { id: 1, name: "Smartphone", category: "electronics", price: 599, rating: 4.5, description: "Latest model with advanced features" },
    { id: 2, name: "Laptop", category: "electronics", price: 999, rating: 4.7, description: "High-performance laptop for professionals" },
    { id: 3, name: "T-Shirt", category: "clothing", price: 25, rating: 4.2, description: "Comfortable cotton t-shirt" },
    { id: 4, name: "Jeans", category: "clothing", price: 60, rating: 4.0, description: "Classic blue jeans" },
    { id: 5, name: "JavaScript Book", category: "books", price: 40, rating: 4.8, description: "Complete guide to JavaScript" },
    { id: 6, name: "Python Book", category: "books", price: 35, rating: 4.6, description: "Learn Python programming" },
    { id: 7, name: "Coffee Maker", category: "home", price: 120, rating: 4.3, description: "Automatic coffee brewing machine" },
    { id: 8, name: "Desk Lamp", category: "home", price: 45, rating: 4.1, description: "LED desk lamp with adjustable brightness" }
];
let filteredProducts = [...products];

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Initialize page-specific content
    if (pageId === 'todo') {
        loadTodos();
    } else if (pageId === 'products') {
        displayProducts();
    }
}

// Portfolio functionality
function handleContactSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    // Remove alert and show message inside the page
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = 'Thank you for your message! I will get back to you soon.';
    
    // Optionally fade the message out after a few seconds
    setTimeout(() => {
        messageEl.textContent = '';
    }, 4000); // 4 seconds

    event.target.reset();
}

// Todo App functionality
let filteredTodos = [];
let currentFilter = { category: '', priority: '', status: 'all', search: '' };

function loadTodos() {
    const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    todos = savedTodos;
    filteredTodos = [...todos];
    renderTodos();
    updateStats();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const category = document.getElementById('categorySelect').value;
    const priority = document.getElementById('prioritySelect').value;
    const dueDate = document.getElementById('dueDateInput').value;
    const text = input.value.trim();
    
    if (text === '') {
        showTodoMessage('Please enter a task!', 'red');
        return;
    }

    
    const todo = {
        id: Date.now(),
        text: text,
        category: category,
        priority: priority,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    todos.push(todo);
    saveTodos();
    applyFilters();
    renderTodos();
    updateStats();
    
    // Clear form
    input.value = '';
    document.getElementById('dueDateInput').value = '';
    document.getElementById('categorySelect').value = 'personal';
    document.getElementById('prioritySelect').value = 'low';
}

function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        applyFilters();
        renderTodos();
        updateStats();
    }
}

function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        saveTodos();
        applyFilters();
        renderTodos();
        updateStats();
    }
}

function editTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const editInput = todoItem.querySelector('.edit-input');
    
    if (todoItem.classList.contains('editing')) {
        // Save edit
        const newText = editInput.value.trim();
        if (newText !== '') {
            const todo = todos.find(todo => todo.id === id);
            todo.text = newText;
            saveTodos();
            applyFilters();
            renderTodos();
            updateStats();
        }
    } else {
        // Start editing
        todoItem.classList.add('editing');
        editInput.value = todoText.textContent;
        editInput.focus();
    }
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function getDaysUntilDue(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    
    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add a new task above or adjust your filters</p>
            </div>
        `;
        return;
    }
    
    todoList.innerHTML = filteredTodos.map(todo => {
        const daysUntilDue = getDaysUntilDue(todo.dueDate);
        const overdue = isOverdue(todo.dueDate);
        
        let dueDateText = '';
        if (todo.dueDate) {
            if (overdue) {
                dueDateText = `<span class="todo-due-date overdue">Overdue (${formatDate(todo.dueDate)})</span>`;
            } else if (daysUntilDue === 0) {
                dueDateText = `<span class="todo-due-date">Due Today</span>`;
            } else if (daysUntilDue === 1) {
                dueDateText = `<span class="todo-due-date">Due Tomorrow</span>`;
            } else if (daysUntilDue > 0) {
                dueDateText = `<span class="todo-due-date">Due in ${daysUntilDue} days</span>`;
            }
        }
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${todo.priority}-priority ${overdue && !todo.completed ? 'overdue' : ''}" data-id="${todo.id}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <input type="text" class="edit-input" onkeypress="if(event.key==='Enter') editTodo(${todo.id})" onblur="editTodo(${todo.id})">
                    <div class="todo-meta">
                        <span class="todo-category">${todo.category}</span>
                        <span class="todo-priority ${todo.priority}">${todo.priority} priority</span>
                        ${dueDateText}
                        <span class="todo-created">Created: ${formatDate(todo.createdAt)}</span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = todos.filter(todo => !todo.completed).length;
    const overdue = todos.filter(todo => !todo.completed && isOverdue(todo.dueDate)).length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('overdueTasks').textContent = overdue;
}

function searchTodos() {
    currentFilter.search = document.getElementById('searchInput').value.toLowerCase();
    applyFilters();
    renderTodos();
}
function showTodoMessage(message, color = rgb(51, 161, 216)) {
    const msg = document.getElementById('todoMessage');
    msg.textContent = message;
    msg.style.color = color;

    setTimeout(() => {
        msg.textContent = '';
    }, 3000);
}
function filterTodos() {
    currentFilter.category = document.getElementById('filterCategory').value;
    currentFilter.priority = document.getElementById('filterPriority').value;
    currentFilter.status = document.getElementById('filterStatus').value;
    applyFilters();
    renderTodos();
}

function applyFilters() {
    filteredTodos = todos.filter(todo => {
        // Search filter
        if (currentFilter.search && !todo.text.toLowerCase().includes(currentFilter.search)) {
            return false;
        }
        
        // Category filter
        if (currentFilter.category && todo.category !== currentFilter.category) {
            return false;
        }
        
        // Priority filter
        if (currentFilter.priority && todo.priority !== currentFilter.priority) {
            return false;
        }
        
        // Status filter
        if (currentFilter.status === 'completed' && !todo.completed) {
            return false;
        }
        if (currentFilter.status === 'pending' && todo.completed) {
            return false;
        }
        if (currentFilter.status === 'overdue' && (todo.completed || !isOverdue(todo.dueDate))) {
            return false;
        }
        
        return true;
    });
    
    // Sort by priority and due date
    filteredTodos.sort((a, b) => {
        // First sort by completion status
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then by priority
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by due date
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // Finally by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function markAllComplete() {
        todos.forEach(todo => {
            if (!todo.completed) {
                todo.completed = true;
                todo.completedAt = new Date().toISOString();
            }
        });
        saveTodos();
        applyFilters();
        renderTodos();
        updateStats();
        showTodoMessage('All tasks marked as complete!');
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    applyFilters();
    renderTodos();
    updateStats();
    showTodoMessage('Cleared completed tasks.', 'green');
}

function showCustomConfirm(message, onYes) {
    const confirmBox = document.getElementById('customConfirmBox');
    const messageEl = document.getElementById('customConfirmMessage');
    const yesBtn = document.getElementById('customConfirmYes');
    const noBtn = document.getElementById('customConfirmNo');

    messageEl.textContent = message;
    confirmBox.style.display = 'flex';

    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.replaceWith(newYesBtn);
    noBtn.replaceWith(newNoBtn);

    newYesBtn.addEventListener('click', () => {
        confirmBox.style.display = 'none';
        onYes();
    });

    newNoBtn.addEventListener('click', () => {
        confirmBox.style.display = 'none';
    });
}


function clearAll() {
    showCustomConfirm("Are you sure you want to delete all tasks?", () => {
        todos = [];
        filteredTodos = [];
        saveTodos();
        renderTodos();
        updateStats();
        showTodoMessage('All tasks cleared.', 'red');
    });
}



// Product listing functionality
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price}</div>
            <div class="product-category">${product.category}</div>
            <div class="product-rating">★ ${product.rating}/5</div>
        </div>
    `).join('');
}

function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = parseFloat(document.getElementById('priceFilter').value) || Infinity;
    
    filteredProducts = products.filter(product => {
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesPrice = product.price <= priceFilter;
        return matchesCategory && matchesPrice;
    });
    
    displayProducts();
}

function sortProducts() {
    const sortBy = document.getElementById('sortFilter').value;
    
    filteredProducts.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'price') {
            return a.price - b.price;
        } else if (sortBy === 'rating') {
            return b.rating - a.rating;
        }
        return 0;
    });
    
    displayProducts();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key support for todo input
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // Initialize products display
    displayProducts();
});