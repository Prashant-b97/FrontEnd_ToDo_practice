var counter = 0;

document.getElementById('add-btn').addEventListener('click', function() {
    const newTodo = document.getElementById('new-todo').value;
    if (newTodo.trim() === '') return;
    const li = document.createElement('li');
    li.textContent = newTodo;
    if (counter % 2 == 0){
        document.getElementById('todo-list').appendChild(li);
    } else {
        document.getElementById('todo-list-2').appendChild(li);
    }
    // TODO: Add the item to the first list on odd values, and to the second on even values.
    
    document.getElementById('new-todo').value = '';
    
    counter++;
});