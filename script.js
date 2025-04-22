document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    let tasks = [];

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const listItem = createTaskElement(task);
            taskList.appendChild(listItem);
        });
    }

    function createTaskElement(task) {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-id', task.id);
        if (task.completed) {
            listItem.classList.add('completed');
        }

        const taskTextSpan = document.createElement('span');
        taskTextSpan.className = 'task-text';
        taskTextSpan.textContent = task.text;
        taskTextSpan.addEventListener('click', () => toggleComplete(task.id));

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = task.text;
        editInput.style.display = 'none';
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit(task.id, editInput.value);
            }
        });
        editInput.addEventListener('blur', () => {
             saveEdit(task.id, editInput.value);
        });


        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'task-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        editBtn.title = "Edit Task";
        editBtn.addEventListener('click', () => enableEditMode(listItem, taskTextSpan, editInput, buttonsDiv));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.title = "Delete Task";
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);

        listItem.appendChild(taskTextSpan);
        listItem.appendChild(editInput);
        listItem.appendChild(buttonsDiv);

        return listItem;
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Please enter a task!");
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();

        taskInput.value = '';
        taskInput.focus();
    }

    function toggleComplete(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function enableEditMode(listItem, taskTextSpan, editInput, buttonsDiv) {
        listItem.classList.add('editing');
        taskTextSpan.style.display = 'none';
        buttonsDiv.style.display = 'none';
        editInput.style.display = 'inline-block';
        editInput.focus();
        editInput.select();
    }

    function saveEdit(id, newText) {
        const trimmedText = newText.trim();
        const listItem = taskList.querySelector(`li[data-id="${id}"]`);

        if (trimmedText === "") {
            alert("Task text cannot be empty. Reverting.");
             if(listItem) {
                 listItem.classList.remove('editing');
                 listItem.querySelector('.task-text').style.display = 'inline-block';
                 listItem.querySelector('.task-buttons').style.display = 'flex';
                 listItem.querySelector('.edit-input').style.display = 'none';
             }
            return;
        }

        tasks = tasks.map(task =>
            task.id === id ? { ...task, text: trimmedText } : task
        );

        saveTasks();
        renderTasks();
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);

    loadTasks();

});