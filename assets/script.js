// Theme Toggle Functionality
document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

// Function to toggle between dark and light themes
function toggleTheme() {
  // Get the body element
  const body = document.body;
  
  // Determine the current theme
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  
  // Calculate the new theme based on the current theme
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Remove current theme and add new theme to the body
  body.classList.remove(`${currentTheme}-theme`);
  body.classList.add(`${newTheme}-theme`);

  // Save the current theme to localStorage
  localStorage.setItem('theme', newTheme);
}

// Load the theme on page load
function loadTheme() {
  // Retrieve the saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;

  // Apply the saved theme if available, otherwise set the default theme (light)
  if (savedTheme) {
    body.classList.add(`${savedTheme}-theme`);
  } else {
    body.classList.add('light-theme');
  }
}

// Call loadTheme function on page load
loadTheme();

// Toggle Sidebar Collapse/Expand
const toggler = document.querySelector(".btn");
toggler.addEventListener("click", function() {
  // Toggle the collapsed class on the sidebar
  document.querySelector("#sidebar").classList.toggle("collapsed");
});

/* Elements and global variables */
const addTodoBtn = document.getElementById('add-todo-btn');
const todosNav = document.getElementById('todos-nav');
let todoListArray = [];
let todosFilter = 'all';
let filteredTodos = [];

/* LocalStorage functions */

// Save todos to localStorage
const saveTodos = () => {
  // Convert todoListArray to JSON and store in localStorage
  const todoListJson = JSON.stringify(todoListArray);
  localStorage.setItem('todoList', todoListJson);
};

// Get todos from localStorage
const getTodos = () => JSON.parse(localStorage.getItem('todoList')) || [];

// Add a new todo
addTodoBtn.addEventListener('click', (event) => {
  event.preventDefault();

  // Get the todo text and date from inputs
  const todoText = document.getElementById('todo-text').value;
  const todoDate = document.getElementById('todo-date').value;

  // If the text and date are not empty
  if (todoText && todoDate) {
    // Create a new todo object
    const todo = {
      text: todoText,
      date: todoDate,
      state: 'pending',
      id: new Date().getTime(),
    };

    // Add the todo to the array
    todoListArray = [...todoListArray, todo];

    // Save & load the todos
    saveTodos();
    if (todosFilter === 'all') {
      loadTodos();
    } else {
      filterTodos(todosFilter);
    }

    // Reset the form
    document.getElementById('todo-text').value = '';
    document.getElementById('todo-date').value = '';
  }
});

// Load todos
const loadTodos = (filter, filteredTodos) => {
  const todosList = sortTodos(filteredTodos);
  const todoList = document.getElementById('todos-list');
  todoList.innerHTML = '';

  // Display appropriate message if there are no todos
  if (todosList.length === 0) {
    const emptyListString = filter
      ? `No ${filter} todo's!`
      : `No todo's added!`;
    todoList.innerHTML = `<p style="text-align:center;">${emptyListString}</p>`;
  } else {
    // Loop through each todo and display it
    todosList.forEach((todo) => {
      // Create a list item and set its dataset id and class
      const todoItem = document.createElement('li');
      todoItem.dataset.id = todo.id;
      todoItem.classList = todo.state;

      // Create the HTML for the todo and add it to the list item
      const todoElement = createTodoElement(todo);
      todoItem.innerHTML = todoElement;
      todoList.appendChild(todoItem);
    });
  }
};

// Sort todos by date
const sortTodos = (filteredTodos) => {
  const todoList = filteredTodos ? filteredTodos : getTodos();
  todoListArray = getTodos();

  // Sort todos by state and date
  todoList.sort((a, b) => {
    // Compare the states
    if (a.state === b.state) {
      // If the states are the same, compare the dates
      return new Date(a.date) - new Date(b.date);
    } else {
      // If the states are different, completed tasks come last
      return a.state === 'completed' ? 1 : -1;
    }
  });

  return todoList;
};

// Create the todo element
const createTodoElement = (todo) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const overdue =
    dateStringToDate(formatDate(todo.date)) < today && todo.state === 'pending';
  const todoDateClass = overdue ? 'todo-date overdue' : 'todo-date';
  const todoButtonIconClass =
    todo.state === 'pending' ? 'fa-circle' : 'fa-circle-check';

  return `
    <div class="todo">
      <button class="todo-btn"><i class="fa-regular ${todoButtonIconClass}"></i></button>
      <div>
        <p class="todo-text">${todo.text}</p>
        <span class="${todoDateClass}">${formatDate(todo.date)}</span>
      </div>
    </div>
    <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
  `;
};

/* Managing todos */

// Check for todo state or delete btn click
document.body.addEventListener('click', (event) => {
  if (event.target.closest('.todo-btn')) {
    const todoItem = event.target.closest('li');
    toggleTodoState(todoItem);
  }

  if (event.target.closest('.delete-btn')) {
    const todoItem = event.target.closest('li');
    deleteTodo(todoItem);
  }
});

// Toggle todo state
const toggleTodoState = (todoItem) => {
  const todo = todoListArray.find(
    (todo) => todo.id === Number(todoItem.dataset.id)
  );

  // Toggle the state
  if (todo.state === 'pending') {
    todo.state = 'completed';
    todoItem.classList = 'completed';
    todoItem.querySelector('.fa-regular').classList =
      'fa-regular fa-circle-check';
  } else if (todo.state === 'completed') {
    todo.state = 'pending';
    todoItem.classList = 'pending';
    todoItem.querySelector('.fa-regular').classList = 'fa-regular fa-circle';
  }

  saveTodos();
};

// Delete todo
const deleteTodo = (todoItem) => {
  let todos = filteredTodos.length > 0 ? filteredTodos : todoListArray;

  // Remove the todo from both the filtered list and the main list
  todos = todos.filter((todo) => todo.id !== Number(todoItem.dataset.id));
  todoListArray = todoListArray.filter(
    (todo) => todo.id !== Number(todoItem.dataset.id)
  );

  saveTodos();
  loadTodos(todosFilter, todos);
};

/* Filter todos */
todosNav.addEventListener('click', (event) => {
  const navButtons = todosNav.querySelectorAll('button');

  // Remove the active class from all buttons
  navButtons.forEach((button) => (button.classList = ''));

  // Add the active class to the clicked button
  const button = event.target.closest('button');
  if (button) {
    button.classList = 'active';
    const filter = button.dataset.filter;
    filterTodos(filter);
  }
});

// Function to filter todos based on different criteria
const filterTodos = (filter) => {
  todosFilter = filter;
  const today = new Date().setHours(0, 0, 0, 0);

  switch (filter) {
    case 'today':
      // Filter todos for today
      filteredTodos = getTodayTodos(today);
      loadTodos(filter, filteredTodos);
      break;

    case 'overdue':
      // Filter overdue todos
      filteredTodos = getOverdueTodos(today);
      loadTodos(filter, filteredTodos);
      break;

    case 'scheduled':
      // Filter scheduled todos
      filteredTodos = getScheduledTodos(today);
      loadTodos(filter, filteredTodos);
      break;

    case 'pending':
      // Filter pending todos
      filteredTodos = getStateTodos('pending');
      loadTodos(filter, filteredTodos);
      break;

    case 'completed':
      // Filter completed todos
      filteredTodos = getStateTodos('completed');
      loadTodos(filter, filteredTodos);
      break;

    case 'all':
    default:
      // Show all todos
      filteredTodos = [];
      loadTodos();
      break;
  }
};

// Function to get todos scheduled for today
const getTodayTodos = (today) => {
  const todayFormatted = formatDate(today);
  const todayTodos = todoListArray.filter(
    (todo) =>
      formatDate(todo.date) === todayFormatted && todo.state === 'pending'
  );

  return todayTodos;
};

// Function to get overdue todos
const getOverdueTodos = (today) => {
  const overdueTodos = todoListArray.filter(
    (todo) =>
      dateStringToDate(formatDate(todo.date)) < today &&
      todo.state === 'pending'
  );

  return overdueTodos;
};

// Function to get scheduled todos
const getScheduledTodos = (today) => {
  const scheduledTodos = todoListArray.filter(
    (todo) =>
      dateStringToDate(formatDate(todo.date)) > today &&
      todo.state === 'pending'
  );

  return scheduledTodos;
};

// Function to get todos based on their state
const getStateTodos = (state) => {
  const stateTodos = todoListArray.filter((todo) => todo.state === state);
  return stateTodos;
};

// Function to convert date string to date object 
const dateStringToDate = (dateString) => {
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

// Function to format todo date to dd/mm/yyyy
const formatDate = (todoDate) => {
  const date = new Date(todoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Load todos on page load
loadTodos();
