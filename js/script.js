document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const dateInput = document.getElementById('date-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const taskError = document.getElementById('task-error');
    const dateError = document.getElementById('date-error');
    const filterButton = document.getElementById('filter-button');
    const filterMenu = document.getElementById('filter-menu');
    const filterOptions = document.querySelectorAll('.filter-option');
    const deleteAllButton = document.getElementById('delete-all-button');

    let todos = [];
    let currentFilter = 'all';

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Filter dropdown toggle
    filterButton.addEventListener('click', function(e) {
        e.stopPropagation();
        filterMenu.classList.toggle('show');
    });

    // Close filter menu when clicking outside
    document.addEventListener('click', function() {
        filterMenu.classList.remove('show');
    });

    filterMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

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

    // Delete all button
    deleteAllButton.addEventListener('click', function() {
        if (todos.length > 0) {
            if (confirm('Are you sure you want to delete all tasks?')) {
                todos = [];
                renderTodos();
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
            taskError.textContent = '⚠ Task cannot be empty';
            isValid = false;
        } else if (taskValue.length < 3) {
            taskError.textContent = '⚠ Task must be at least 3 characters';
            isValid = false;
        }

        // Validate date
        if (!dateInput.value) {
            dateError.textContent = '⚠ Please select a date';
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);

            if (selectedDate < currentDate) {
                dateError.textContent = '⚠ Date cannot be in the past';
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
            todoList.innerHTML = '<tr class="empty-state"><td colspan="4">No task found</td></tr>';
            return;
        }

        todoList.innerHTML = filteredTodos.map(todo => {
            const status = getStatus(todo);
            const statusClass = getStatusClass(status);

            return `
                <tr>
                    <td>
                        <span class="task-text ${todo.completed ? 'completed' : ''}">${escapeHtml(todo.text)}</span>
                    </td>
                    <td>${formatDate(todo.date)}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${status}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-complete" onclick="toggleComplete(${todo.id})">
                                ${todo.completed ? 'Undo' : 'Done'}
                            </button>
                            <button class="btn-action btn-delete" onclick="deleteTodo(${todo.id})">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get status
    function getStatus(todo) {
        if (todo.completed) return 'Completed';
        
        const todoDate = new Date(todo.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        todoDate.setHours(0, 0, 0, 0);

        if (todoDate < today) return 'Overdue';
        return 'Pending';
    }

    // Get status class
    function getStatusClass(status) {
        if (status === 'Completed') return 'status-completed';
        if (status === 'Overdue') return 'status-overdue';
        return 'status-pending';
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
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
                    return todoDate < today && !todo.completed;
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
        if (confirm('Are you sure you want to delete this task?')) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        }
    };

    // Filter options
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            filterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterButton.textContent = 'FILTER: ' + this.textContent.toUpperCase();
            filterMenu.classList.remove('show');
            renderTodos();
        });
    });

    // Initial render
    renderTodos();
});