document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const taskError = document.getElementById('task-error');
    const dateError = document.getElementById('date-error');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let todos = [];
    let currentFilter = 'all';

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Add button click event
    addButton.addEventListener('click', function() {
        if (validateForm()) {
            addTodo();
        }
    });

    // Enter key to add task
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (validateForm()) {
                addTodo();
            }
        }
    });

    dateInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (validateForm()) {
                addTodo();
            }
        }
    });

    // Validate form
    function validateForm() {
        let isValid = true;
        taskError.textContent = '';
        dateError.textContent = '';

        // Validate task input
        const taskValue = todoInput.value.trim();
        if (taskValue.length === 0) {
            taskError.textContent = 'Task cannot be empty';
            isValid = false;
        } else if (taskValue.length < 3) {
            taskError.textContent = 'Task must be at least 3 characters';
            isValid = false;
        }

        // Validate date
        if (!dateInput.value) {
            dateError.textContent = 'Please select a date';
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            if (selectedDate < currentDate) {
                dateError.textContent = 'Date cannot be in the past';
                isValid = false;
            }
        }

        return isValid;
    }

    // Add todo
    function addTodo() {
        const todo = {
            id: Date.now(),
            text: todoInput.value.trim(),
            date: dateInput.value,
            completed: false
        };

        todos.push(todo);
        todoInput.value = '';
        dateInput.value = '';
        taskError.textContent = '';
        dateError.textContent = '';
        renderTodos();
    }

    // Render todos
    function renderTodos() {
        const filteredTodos = filterTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<li class="empty-state">No tasks found for this filter!</li>';
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => {
            const dateClass = getDateClass(todo.date);
            const dateLabel = getDateLabel(todo.date);

            return `
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                    <div class="todo-date ${dateClass}">${dateLabel}</div>
                    <div class="todo-content">
                        <div class="todo-text">${escapeHtml(todo.text)}</div>
                        <div class="todo-actions">
                            <button class="btn-complete" onclick="toggleComplete(${todo.id})">
                                ${todo.completed ? '↶ Undo' : '✓'}
                            </button>
                            <button class="btn-delete" onclick="deleteTodo(${todo.id})">
                                🗑
                            </button>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get date class
    function getDateClass(dateString) {
        const todoDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        todoDate.setHours(0, 0, 0, 0);

        if (todoDate < today) return 'overdue';
        if (todoDate.getTime() === today.getTime()) return 'today';
        return '';
    }

    // Get date label
    function getDateLabel(dateString) {
        const todoDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        todoDate.setHours(0, 0, 0, 0);

        const diffTime = todoDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `Overdue (${dateString})`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return dateString;
    }

    // Filter todos
    function filterTodos() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch(currentFilter) {
            case 'today':
                return todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    todoDate.setHours(0, 0, 0, 0);
                    return todoDate.getTime() === today.getTime();
                });
            case 'upcoming':
                return todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    todoDate.setHours(0, 0, 0, 0);
                    return todoDate > today;
                });
            case 'overdue':
                return todos.filter(todo => {
                    const todoDate = new Date(todo.date);
                    todoDate.setHours(0, 0, 0, 0);
                    return todoDate < today;
                });
            default:
                return todos;
        }
    }

    // Toggle complete
    window.toggleComplete = function(id) {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            renderTodos();
        }
    };

    // Delete todo
    window.deleteTodo = function(id) {
        todos = todos.filter(t => t.id !== id);
        renderTodos();
    };

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTodos();
        });
    });

    // Initial render
    renderTodos();
});