document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const taskCountSpan = document.getElementById('taskCount'); // Get the span

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
        updateTaskCount(); // Update count after rendering
    }

    // New function to update the task count display
    function updateTaskCount() {
        const remainingTasks = tasks.filter(task => !task.completed).length;
        taskCountSpan.textContent = `Tasks: ${remainingTasks}`; // Or show total: tasks.length
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
        editBtn.addEventListener('click', () => enableEditMode(listItem, taskTextSpan, editInput)); // Pass fewer args if buttonsDiv hidden

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
            // Maybe a more subtle feedback instead of alert?
            taskInput.style.animation = 'shake 0.5s ease';
            setTimeout(() => taskInput.style.animation = '', 500);
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false
        };

        tasks.unshift(newTask); // Add to the beginning of the array
        saveTasks();
        renderTasks(); // Will also update count

        taskInput.value = '';
        // taskInput.focus(); // Optional focus
    }

    function toggleComplete(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks(); // Will also update count
    }

    function deleteTask(id) {
        // Optional: Add a confirmation?
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks(); // Will also update count
    }

    function enableEditMode(listItem, taskTextSpan, editInput) {
        // Ensure other items are not in edit mode (simple approach)
        document.querySelectorAll('#taskList li.editing').forEach(li => {
            li.classList.remove('editing');
            li.querySelector('.task-text').style.display = 'inline-block'; // Or block
            li.querySelector('.edit-input').style.display = 'none';
            // Restore buttons if they were hidden by .editing class in CSS
             if (li.querySelector('.task-buttons')) {
                 li.querySelector('.task-buttons').style.display = 'flex'; // or initial
             }
        });


        listItem.classList.add('editing');
        taskTextSpan.style.display = 'none';
        editInput.style.display = 'inline-block';
         // Hide buttons via CSS using the .editing class
         if (listItem.querySelector('.task-buttons')) {
             listItem.querySelector('.task-buttons').style.display = 'none';
         }

        editInput.focus();
        editInput.select();
    }

     function disableEditMode(listItem) {
         listItem.classList.remove('editing');
         listItem.querySelector('.task-text').style.display = 'inline-block'; // Or block
         listItem.querySelector('.edit-input').style.display = 'none';
          // Restore buttons if they were hidden by .editing class in CSS
         if (listItem.querySelector('.task-buttons')) {
              listItem.querySelector('.task-buttons').style.display = 'flex'; // or initial (check mobile logic)
              // Adjust based on mobile where buttons might always be visible except when editing
              if (window.innerWidth <= 650) {
                 listItem.querySelector('.task-buttons').style.opacity = '1';
              } else {
                 listItem.querySelector('.task-buttons').style.opacity = ''; // Let CSS handle hover
              }
         }
     }


    function saveEdit(id, newText) {
        const trimmedText = newText.trim();
        const listItem = taskList.querySelector(`li[data-id="${id}"]`);

        if (trimmedText === "") {
            // Revert without saving
             if(listItem) disableEditMode(listItem);
            return;
        }

        tasks = tasks.map(task =>
            task.id === id ? { ...task, text: trimmedText } : task
        );

        saveTasks();
        renderTasks(); // Easiest way to ensure DOM matches data
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks(); // Will also update count
    }

    // Add simple shake animation CSS (can be in style.css too)
    const styleSheet = document.styleSheets[document.styleSheets.length - 1]; // Get last stylesheet (style.css)
    styleSheet.insertRule(`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
        }
    `, styleSheet.cssRules.length);


    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);

    loadTasks(); // Initial load

});
