document.addEventListener('DOMContentLoaded', displayTasks);


if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('Notification permission granted');
        }
    });
}

// Get tasks from local storage
function getTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks;
}

// Add task function
function addTask() {
    const taskInput = document.getElementById('taskInput').value;
    const categoryInput = document.getElementById('categoryInput').value;
    const dueDateInput = document.getElementById('dueDateInput').value;

    if (!taskInput) {
        alert('Please enter a task.');
        return;
    }

    const tasks = getTasks();
    const newTask = {
        id: Date.now(),
        task: taskInput,
        category: categoryInput,
        dueDate: dueDateInput,
        completed: false,
    };
    tasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    setTaskReminder(newTask);

    displayTasks();
    resetInputFields();
}

// Set task reminder function
function setTaskReminder(task) {
    // Check if Notification API is supported
    if ('Notification' in window) {
        // Create due date object from task's due date
        const dueDate = new Date(task.dueDate + 'T00:00:00');

        // Get current date and time
        const currentTime = new Date();

        // Check if due date is greater than current date and time
        if (dueDate > currentTime) {
            // Calculate time difference in milliseconds
            const timeDifference = dueDate.getTime() - currentTime.getTime();

            // Set a timeout for the task reminder notification
            setTimeout(() => {
                // Create a new notification
                const notification = new Notification(`Task Reminder: ${task.task}`, {
                    body: `Your task "${task.task}" is due today!`,
                    icon: 'notification-icon.png', // replace with your icon path
                });
            }, timeDifference);
        }
    }
}

// Function to reset input fields
function resetInputFields() {
    // Set task input value to empty string
    document.getElementById('taskInput').value = '';
    // Set category input value to empty string
    document.getElementById('categoryInput').value = '';
    // Set due date input value to empty string
    document.getElementById('dueDateInput').value = '';
}

function displayTasks() {
  const tasks = getTasks();
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach(task => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
          <div class="parent">
              <div class="card">
                  <div class="content-box">
                      <span class="card-title">${task.task}</span>
                      <p class="card-content">${task.category}</p>
                      <span class="see-more" onclick="editTask(${task.id})">Edit / Delete</span>
                  </div>
                  <div class="date-box">
                      <span class="month">${getMonthFromDate(task.dueDate)}</span>
                      <span class="date">${getDayFromDate(task.dueDate)}</span>
                  </div>
              </div>
          </div>
      `;
      if (task.completed) {
          listItem.classList.add('completed');
      }
      taskList.appendChild(listItem);
  });
}

function getMonthFromDate(dateString) {
    // create a new Date object
    const date = new Date(dateString);
    // list of month names
    const monthNames = [
         "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
         "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    // get the month index from the date object
    const monthIndex = date.getMonth();
    // return the corresponding month name
    return monthNames[monthIndex];
}

function getDayFromDate(dateString) {
    // Create new Date object from input string
    const date = new Date(dateString);
     
    // Extract the day from the date
    return date.getDate();
}

// Complete or incomplete task by id
function completeTask(id) {
    // Get tasks from local storage
    const tasks = getTasks();
    // Map through tasks array and toggle completion status
    const updatedTasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });
    // Save updated tasks array to local storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    // Display updated tasks on the page
    displayTasks();
}

// Find task by id, set inputs with existing task details
function editTask(id) {
    const tasks = getTasks(); // Get all tasks
    const taskToEdit = tasks.find(task => task.id === id); // Find the task to edit

    document.getElementById('taskInput').value = taskToEdit.task; // Set task input
    document.getElementById('categoryInput').value = taskToEdit.category; // Set category input
    document.getElementById('dueDateInput').value = taskToEdit.dueDate; // Set due date input

    deleteTask(id); // Delete the task to replace with updated details

    window.scrollTo(0, 0); // Scroll to top of the page
}

// Deletes task with specified id
function deleteTask(id) {
    // Get tasks from local storage
    const tasks = getTasks();
    // Filter out task with specified id
    const updatedTasks = tasks.filter(task => task.id !== id);
    // Save updated tasks to local storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    // Display updated tasks
    displayTasks();
}

// define function to retrieve tasks from local storage
function getTasks() {
    // return parsed JSON array or empty array if there are no tasks
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Add this function to your JavaScript
// Create tasks JSON download link
function downloadTasks() {
    // Get tasks array from getTasks() function
    const tasks = getTasks();

    // Convert tasks array to JSON string with 2 space indentation
    const jsonString = JSON.stringify(tasks, null, 2);

    // Create a Blob from the JSON string with application/json MIME type
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create an object URL from the Blob
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';

    // Append the download link to the body, trigger click, then remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Revoke the object URL to free up memory
    URL.revokeObjectURL(url);
}