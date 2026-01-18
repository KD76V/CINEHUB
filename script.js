// script.js

// =====================
// 1. MOVIE DATABASE (You will expand this!)
// =====================
const moviesDatabase = {
    "dune-2": {
        id: "dune-2",
        title: "Dune: Part Two",
        category: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BODI0YjNhNjUtYzE2MC00ZDI1LWEwM2MtYWY5ZThlZGM5YzBjXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_FMjpg_UX1000_.jpg", // Use actual image URL
        rating: 8.8,
        genreTags: "Sci-Fi, Adventure, Epic",
        year: 2024,
        runtime: "166 min",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
        trailerYoutubeId: "Way9Dexny3w", // Only the ID part
        genreChart: {
            labels: ["Sci-Fi", "Adventure", "Drama", "Action"],
            data: [40, 30, 20, 10]
        },
        cast: [
            { name: "Timothée Chalamet", character: "Paul Atreides", img: "https://image.tmdb.org/t/p/w185/6qRiP1y8i7vLd3QcMtvqLQAiY9W.jpg" },
            { name: "Zendaya", character: "Chani", img: "https://image.tmdb.org/t/p/w185/6HN3p2jL7Zk7XkGhz8u7aOBLFZ2.jpg" },
            { name: "Rebecca Ferguson", character: "Lady Jessica", img: "https://image.tmdb.org/t/p/w185/d2V41lqQYlVhNar4qKJhGUdHhQi.jpg" }
        ],
        director: "Denis Villeneuve",
        producer: "Mary Parent, Cale Boyter",
        ott: ["Netflix", "Amazon Prime Video", "Apple TV+"],
        reviewCounts: { skip: 120, notBad: 450, goForIt: 2100, cinema: 1500 }
    },
    "oppenheimer": {
        id: "oppenheimer",
        title: "Oppenheimer",
        category: "movie",
        poster: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
        rating: 8.3,
        genreTags: "Biography, Drama, History",
        year: 2023,
        runtime: "180 min",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        trailerYoutubeId: "uYPbbksJxIg",
        genreChart: {
            labels: ["Biography", "Drama", "History", "Thriller"],
            data: [50, 30, 15, 5]
        },
        cast: [
            { name: "Cillian Murphy", character: "J. Robert Oppenheimer", img: "https://image.tmdb.org/t/p/w185/lFfLPuYFgT2PGZXe1p8pJc8yZTN.jpg" },
            { name: "Emily Blunt", character: "Kitty Oppenheimer", img: "https://image.tmdb.org/t/p/w185/5nCSG8v6b5ziz1JcVkQ9XpK8tmu.jpg" },
            { name: "Robert Downey Jr.", character: "Lewis Strauss", img: "https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg" }
        ],
        director: "Christopher Nolan",
        producer: "Emma Thomas, Charles Roven, Christopher Nolan",
        ott: ["Amazon Prime Video", "Google Play Movies"],
        reviewCounts: { skip: 85, notBad: 300, goForIt: 2800, cinema: 3200 }
    },
    // ADD MORE MOVIES, SERIES, ANIME HERE following the same format!
};

// =====================
// 2. HOMEPAGE FUNCTIONALITY
// =====================
document.addEventListener('DOMContentLoaded', function() {
    const movieGrid = document.getElementById('movie-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // Check if we are on the homepage or movie detail page
    if (movieGrid) {
        // We are on index.html (homepage)
        displayMovieCards('all');
        setupFilterButtons();
    } else if (document.getElementById('movie-detail-content')) {
        // We are on movie.html (detail page)
        displayMovieDetail(movieId);
    }
});

function displayMovieCards(filter) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = ''; // Clear current cards

    for (const movieId in moviesDatabase) {
        const movie = moviesDatabase[movieId];
        // Apply filter
        if (filter === 'all' || movie.category === filter) {
            const card = document.createElement('div');
            card.className = `movie-card`; // Remove active class from filter logic
            card.setAttribute('data-category', movie.category);
            card.setAttribute('data-id', movie.id);

            card.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title} Poster" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-rating"><i class="fas fa-star"></i> ${movie.rating}</p>
                    <p class="movie-genre">${movie.genreTags}</p>
                    <a href="movie.html?id=${movie.id}" class="detail-btn">View Details & Review</a>
                </div>
            `;
            grid.appendChild(card);
        }
    }
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Filter movies
            const filter = this.getAttribute('data-filter');
            displayMovieCards(filter);
        });
    });
}

// =====================
// 3. MOVIE DETAIL PAGE FUNCTIONALITY
// =====================
function displayMovieDetail(movieId) {
    const contentDiv = document.getElementById('movie-detail-content');
    const movie = moviesDatabase[movieId];

    if (!movie) {
        contentDiv.innerHTML = `<h2>Movie not found!</h2><a href="index.html">Go back home</a>`;
        return;
    }

    // Build the HTML for the movie detail page
    contentDiv.innerHTML = `
        <div class="detail-header">
            <div class="detail-poster">
                <img src="${movie.poster}" alt="${movie.title}">
            </div>
            <div class="detail-info">
                <h1 class="detail-title">${movie.title}</h1>
                <p class="detail-meta">${movie.year} • ${movie.runtime} • <i class="fas fa-star"></i> ${movie.rating}/10</p>
                <p>${movie.description}</p>
                <a href="https://www.youtube.com/watch?v=${movie.trailerYoutubeId}" target="_blank" class="trailer-btn">
                    <i class="fab fa-youtube"></i> Watch Trailer
                </a>
            </div>
        </div>

        <!-- Genre Pie Chart Section -->
        <div class="detail-section">
            <h2 class="section-title">Genre Breakdown</h2>
            <div class="genre-chart-container">
                <canvas id="genreChart"></canvas>
            </div>
        </div>

        <!-- Cast Section -->
        <div class="detail-section">
            <h2 class="section-title">Cast</h2>
            <div class="cast-grid">
                ${movie.cast.map(person => `
                    <div class="cast-card">
                        <img src="${person.img}" alt="${person.name}" class="cast-img">
                        <h4>${person.name}</h4>
                        <p>${person.character}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Crew Section -->
        <div class="detail-section">
            <h2 class="section-title">Crew</h2>
            <ul class="crew-list">
                <li><strong>Director:</strong> ${movie.director}</li>
                <li><strong>Producer:</strong> ${movie.producer}</li>
            </ul>
        </div>

        <!-- OTT Section -->
        <div class="detail-section">
            <h2 class="section-title">Where to Watch</h2>
            <ul class="ott-list">
                ${movie.ott.map(platform => `<li>${platform}</li>`).join('')}
            </ul>
        </div>

        <!-- REVIEW SECTION -->
        <div class="detail-section review-section">
            <h2 class="section-title">What's Your Verdict?</h2>
            <p>${Object.values(movie.reviewCounts).reduce((a, b) => a + b, 0)} people have voted.</p>
            <div class="review-buttons">
                <button class="review-btn skip" data-vote="skip">🚫 Skip (${movie.reviewCounts.skip})</button>
                <button class="review-btn not-bad" data-vote="notBad">😐 Not Bad (${movie.reviewCounts.notBad})</button>
                <button class="review-btn go-for-it" data-vote="goForIt">👍 GO FOR IT (${movie.reviewCounts.goForIt})</button>
                <button class="review-btn cinema" data-vote="cinema">🎭 CINEMA! (${movie.reviewCounts.cinema})</button>
            </div>
        </div>
    `;

    // =====================
    // 4. CREATE PIE CHART
    // =====================
    const ctx = document.getElementById('genreChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: movie.genreChart.labels,
            datasets: [{
                data: movie.genreChart.data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                borderWidth: 2,
                borderColor: '#1a1f29'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#e0e0e0' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });

    // =====================
    // 5. REVIEW BUTTON HANDLING
    // =====================
    const reviewButtons = document.querySelectorAll('.review-btn');
    reviewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const voteType = this.getAttribute('data-vote');
            // In a real app, you would send this to a server.
            // For now, we'll just update the UI locally.
            movie.reviewCounts[voteType]++; // Increase count
            this.textContent = this.textContent.replace(/\(\d+\)/, `(${movie.reviewCounts[voteType]})`);

            // Simple visual feedback
            alert(`You voted: "${this.textContent.split(' ')[0]}". Thanks! (Note: This resets on refresh without a backend)`);
        });
    });
}