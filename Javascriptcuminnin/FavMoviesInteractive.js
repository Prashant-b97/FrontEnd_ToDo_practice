document.getElementById('add-btn').addEventListener('click', function() {
    const newMovie = document.getElementById('new-movie').value; // TODO: Get the new movie item's value
    if(newMovie.trim() === '') return; // TODO: Check if the input is empty; if yes, return

    const li = document.createElement('li'); // TODO: Create a new li element
    li.textContent = newMovie; // TODO: Set the text content of the li element to the new movie item's value

    document.getElementById('movie-list').appendChild(li); // TODO: Append the new li element to the movie list

    document.getElementById('new-movie').value = ''; // TODO: Clear the input field
});