document.getElementById('add-btn').addEventListener('click', function() {
    const newTodo = document.getElementById('new-todo').value;
    if (newTodo.trim() === '') return;
    const li = document.createElement('li');
    li.textContent = newTodo;
    const value = parseInt(newTodo, 10);
    const listId = value % 2 === 0 ? 'todo-list-2' : 'todo-list';
    document.getElementById(listId).appendChild(li);
    
    document.getElementById('new-todo').value = '';
});
