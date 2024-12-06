$(document).ready(function () {
    const API_KEY = '7b2485ce89eb09a2e33243b3bdadd04b';
    const BASE_URL = 'https://api.themoviedb.org/3';
    

    loadPopularMovies();

    function loadPopularMovies() {
        $.ajax({
            url: `${BASE_URL}/movie/popular`,
            data: { api_key: API_KEY },
            success: function (response) {
                displayResults(response.results);
            },
            error: function (err) {
                console.error('Error fetching popular movies:', err);
            }
        });
    }

    $('#search-bar').on('keypress', function (e) {
        if (e.which === 13) {
            const query = $('#search-bar').val().trim();
            if (query === '') {
                alert('Please enter a search term!');
                return;
            }
            searchMovies(query);
        }
    });

    $('#search-button').on('click', function () {
        const query = $('#search-bar').val().trim();
        if (query === '') {
            alert('Please enter a search term!');
                return;
        }
        searchMovies(query);
    });

    function searchMovies(query) {
        $.ajax({
            url: `${BASE_URL}/search/movie`,
            data: { api_key: API_KEY, query: query },
            success: function (response) {
                displayResults(response.results);
            },
            error: function (err) {
                console.error('Error fetching search results:', err);
            }
        });
    }

    function displayResults(results) {
        const resultsSection = $('#results-section');
        resultsSection.empty();
        if (results.length === 0) {
            resultsSection.append('<p>No results found.</p>');
            return;
        }
        results.forEach(result => {
            const poster = result.poster_path
                ? `https://image.tmdb.org/t/p/w200${result.poster_path}`
                : 'assets/no-image-available.png';
            const item = `<div class="result-item" data-id="${result.id}">
                <img src="${poster}" alt="${result.title}">
                <h5>${result.title}</h5>
                <p>Release Date: ${result.release_date || 'N/A'}</p>
                <button class="btn btn-info btn-sm">View Details</button>
                <div class="movie-details" style="display: none;"></div>
            </div>`;
            resultsSection.append(item);
        });

        $('.result-item button').on('click', function () {
            const parentElement = $(this).closest('.result-item');
            const movieId = parentElement.data('id');
            toggleDetails(movieId, parentElement);
        });
    }

    function toggleDetails(movieId, parentElement) {
        const detailsContainer = parentElement.find('.movie-details');
        if (detailsContainer.is(':visible')) {
            detailsContainer.slideUp();
            return;
        }
        $.ajax({
            url: `${BASE_URL}/movie/${movieId}`,
            data: { api_key: API_KEY, append_to_response: 'credits,reviews' },
            success: function (response) {
                displayDetails(response, detailsContainer);
                detailsContainer.slideDown();
            },
            error: function (err) {
                console.error('Error fetching movie details:', err);
            }
        });
    }

    function displayDetails(movie, detailsContainer) {
        const cast = movie.credits.cast.slice(0, 5).map(actor => `
            <button class="btn btn-link p-0" onclick="viewActorDetails(${actor.id})">${actor.name}</button>
        `).join(', ');

        const details = `
            <h6>${movie.title}</h6>
            <p>${movie.overview || 'No overview available.'}</p>
            <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
            <p><strong>Rating:</strong> ${movie.vote_average || 'N/A'}/10</p>
            <p><strong>Cast:</strong> ${cast || 'No cast information available.'}</p>
        `;

        detailsContainer.html(details);
    }

    window.viewActorDetails = function (actorId) {
        localStorage.setItem('actorId', actorId);
        window.location.href = 'actor.html';
    };
});
