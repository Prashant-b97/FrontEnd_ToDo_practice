document.getElementById('add-btn').addEventListener('click', function() {
    const newMovie = document.getElementById('new-movie').value;
    if(newMovie.trim() === '') return;

    const li = document.createElement('li');
    li.textContent = newMovie;

    document.getElementById('movie-list').appendChild(li);

    document.getElementById('new-movie').value = '';
});