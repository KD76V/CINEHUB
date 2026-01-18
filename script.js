// script.js

// =====================
// CONFIGURATION
// =====================
const CONFIG = {
    fallbackPoster: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=800&auto=format&fit=crop',
    fallbackCast: 'https://i.pravatar.cc/150?img=',
    tmdbImageBase: 'https://image.tmdb.org/t/p/w500'
};

// =====================
// MOVIE DATABASE (With Real Images)
// =====================
const moviesDatabase = {
    "dune-2": {
        id: "dune-2",
        title: "Dune: Part Two",
        category: "movie",
        poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nx1S8.jpg",
        rating: 8.8,
        genreTags: ["Sci-Fi", "Adventure", "Epic"],
        year: 2024,
        runtime: "166 min",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
        trailerYoutubeId: "Way9Dexny3w",
        genreChart: {
            labels: ["Sci-Fi", "Adventure", "Drama", "Action", "Thriller"],
            data: [35, 25, 20, 15, 5],
            colors: ['#7c5cfc', '#a855f7', '#ec4899', '#10b981', '#3b82f6']
        },
        cast: [
            { name: "Timothée Chalamet", character: "Paul Atreides", img: "https://image.tmdb.org/t/p/w185/6qRiP1y8i7vLd3QcMtvqLQAiY9W.jpg" },
            { name: "Zendaya", character: "Chani", img: "https://image.tmdb.org/t/p/w185/6HN3p2jL7Zk7XkGhz8u7aOBLFZ2.jpg" },
            { name: "Rebecca Ferguson", character: "Lady Jessica", img: "https://image.tmdb.org/t/p/w185/d2V41lqQYlVhNar4qKJhGUdHhQi.jpg" },
            { name: "Austin Butler", character: "Feyd-Rautha", img: "https://image.tmdb.org/t/p/w185/vwqGdGPer1KcL1qGdQNlMDPuX5b.jpg" }
        ],
        director: "Denis Villeneuve",
        producer: "Mary Parent, Cale Boyter, Patrick McCormick",
        ott: [
            { name: "Netflix", icon: "fas fa-play", color: "#E50914" },
            { name: "Prime Video", icon: "fas fa-play", color: "#00A8E1" },
            { name: "Apple TV+", icon: "fas fa-play", color: "#000000" }
        ],
        reviewCounts: { skip: 120, notBad: 450, goForIt: 2100, cinema: 1500 },
        totalReviews: 4170,
        communityRating: 4.7
    },
    "oppenheimer": {
        id: "oppenheimer",
        title: "Oppenheimer",
        category: "movie",
        poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n8ua.jpg",
        rating: 8.3,
        genreTags: ["Biography", "Drama", "History"],
        year: 2023,
        runtime: "180 min",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        trailerYoutubeId: "uYPbbksJxIg",
        genreChart: {
            labels: ["Biography", "Drama", "History", "Thriller"],
            data: [50, 30, 15, 5],
            colors: ['#7c5cfc', '#a855f7', '#ec4899', '#10b981']
        },
        cast: [
            { name: "Cillian Murphy", character: "J. Robert Oppenheimer", img: "https://image.tmdb.org/t/p/w185/lFfLPuYFgT2PGZXe1p8pJc8yZTN.jpg" },
            { name: "Emily Blunt", character: "Kitty Oppenheimer", img: "https://image.tmdb.org/t/p/w185/5nCSG8v6b5ziz1JcVkQ9XpK8tmu.jpg" },
            { name: "Robert Downey Jr.", character: "Lewis Strauss", img: "https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg" },
            { name: "Matt Damon", character: "Leslie Groves", img: "https://image.tmdb.org/t/p/w185/wN1E2Y6W7E7NQH8aKt20BeK8g9g.jpg" }
        ],
        director: "Christopher Nolan",
        producer: "Emma Thomas, Charles Roven, Christopher Nolan",
        ott: [
            { name: "Prime Video", icon: "fas fa-play", color: "#00A8E1" },
            { name: "Google Play", icon: "fab fa-google-play", color: "#4285F4" }
        ],
        reviewCounts: { skip: 85, notBad: 300, goForIt: 2800, cinema: 3200 },
        totalReviews: 6385,
        communityRating: 4.8
    },
    "spiderman-verse": {
        id: "spiderman-verse",
        title: "Spider-Man: Across the Spider-Verse",
        category: "movie",
        poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        rating: 8.7,
        genreTags: ["Animation", "Action", "Adventure"],
        year: 2023,
        runtime: "140 min",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        trailerYoutubeId: "shW9i6k8cB0",
        genreChart: {
            labels: ["Animation", "Action", "Adventure", "Comedy", "Sci-Fi"],
            data: [40, 25, 20, 10, 5],
            colors: ['#7c5cfc', '#a855f7', '#ec4899', '#10b981', '#3b82f6']
        },
        cast: [
            { name: "Shameik Moore", character: "Miles Morales", img: "https://image.tmdb.org/t/p/w185/7mCw2kPkRZ8hWwG5tOnzxCQ1cxU.jpg" },
            { name: "Hailee Steinfeld", character: "Gwen Stacy", img: "https://image.tmdb.org/t/p/w185/9qDoQZ9AZvyt49C2c0MpA1Qq6pL.jpg" },
            { name: "Oscar Isaac", character: "Miguel O'Hara", img: "https://image.tmdb.org/t/p/w185/b1Ev6S4d1pqC30WBeF2kcd7b4AL.jpg" }
        ],
        director: "Joaquim Dos Santos, Kemp Powers, Justin K. Thompson",
        producer: "Phil Lord, Christopher Miller, Amy Pascal",
        ott: [
            { name: "Netflix", icon: "fas fa-play", color: "#E50914" },
            { name: "Disney+", icon: "fas fa-play", color: "#113CCF" }
        ],
        reviewCounts: { skip: 50, notBad: 200, goForIt: 1800, cinema: 2200 },
        totalReviews: 4250,
        communityRating: 4.6
    }
};

// =====================
// UTILITY FUNCTIONS
// =====================
function checkImage(url, callback) {
    const img = new Image();
    img.onload = function() {
        callback(true);
    };
    img.onerror = function() {
        callback(false);
    };
    img.src = url;
}

function getSafeImage(url, fallback) {
    return new Promise((resolve) => {
        checkImage(url, (success) => {
            resolve(success ? url : fallback);
        });
    });
}

function createElement(tag, className, content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.innerHTML = content;
    return element;
}

// =====================
// THEME MANAGEMENT
// =====================
function initTheme() {
    const themeBtn = document.getElementById('themeBtn');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark.matches;
    
    // Apply theme
    document.documentElement.className = isDark ? 'dark-mode' : 'light-mode';
    themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Toggle theme
    themeBtn.addEventListener('click', () => {
        const isDarkMode = document.documentElement.classList.contains('dark-mode');
        document.documentElement.className = isDarkMode ? 'light-mode' : 'dark-mode';
        themeBtn.innerHTML = isDarkMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
    });
}

// =====================
// HOMEPAGE FUNCTIONALITY
// =====================
async function displayMovieCards(filter = 'all') {
    const grid = document.getElementById('movie-grid');
    if (!grid) return;
    
    // Clear and show loading
    grid.innerHTML = `
        <div class="loading-cards">
            <div class="card-skeleton"></div>
            <div class="card-skeleton"></div>
            <div class="card-skeleton"></div>
            <div class="card-skeleton"></div>
        </div>
    `;
    
    // Wait a bit for loading effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Clear loading
    grid.innerHTML = '';
    
    // Create cards
    for (const movieId in moviesDatabase) {
        const movie = moviesDatabase[movieId];
        
        if (filter === 'all' || movie.category === filter) {
            // Check if poster exists
            const safePoster = await getSafeImage(movie.poster, CONFIG.fallbackPoster);
            
            const card = createElement('div', 'movie-card');
            card.setAttribute('data-category', movie.category);
            card.setAttribute('data-id', movie.id);
            
            card.innerHTML = `
                <div class="card-image">
                    <img src="${safePoster}" alt="${movie.title}" class="poster-img" loading="lazy">
                    <div class="image-overlay">
                        <span class="category-badge">${movie.category.toUpperCase()}</span>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.rating}</span>
                        </div>
                        <div class="movie-year">${movie.year}</div>
                    </div>
                    <div class="movie-genres">
                        ${movie.genreTags.map(genre => `
                            <span class="genre-tag">${genre}</span>
                        `).join('')}
                    </div>
                    <a href="movie.html?id=${movie.id}" class="detail-link">
                        <i class="fas fa-film"></i>
                        <span>Review & Details</span>
                    </a>
                </div>
            `;
            
            grid.appendChild(card);
            
            // Add entrance animation
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    // Setup filter buttons
    setupFilterButtons();
}

function setupFilterButtons() {
    const tabs = document.querySelectorAll('.tab');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    const buttons = tabs.length ? tabs : filterBtns;
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.classList.contains('highlight')) {
                    btn.classList.add('highlight');
                }
            });
            this.classList.add('active');
            
            // Filter movies
            const filter = this.getAttribute('data-filter');
            displayMovieCards(filter);
        });
    });
}

// =====================
// MOVIE DETAIL PAGE
// =====================
async function displayMovieDetail(movieId) {
    const contentDiv = document.getElementById('movie-detail-content');
    if (!contentDiv) return;
    
    const movie = moviesDatabase[movieId];
    
    if (!movie) {
        contentDiv.innerHTML = `
            <div class="error-state">
                <i class="fas fa-film fa-3x"></i>
                <h2>Movie Not Found</h2>
                <p>This movie doesn't exist in our database yet.</p>
                <a href="index.html" class="detail-link">Explore Other Movies</a>
            </div>
        `;
        return;
    }
    
    // Check images
    const safePoster = await getSafeImage(movie.poster, CONFIG.fallbackPoster);
    const safeCastImages = await Promise.all(
        movie.cast.map(async person => ({
            ...person,
            img: await getSafeImage(person.img, `${CONFIG.fallbackCast}${Math.floor(Math.random() * 70)}`)
        }))
    );
    
    // Build the detail page
    contentDiv.innerHTML = `
        <!-- Header Section -->
        <div class="detail-header">
            <div class="detail-poster">
                <img src="${safePoster}" alt="${movie.title}" loading="eager">
                <div class="poster-overlay">
                    <div class="category-badge">${movie.category.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="detail-info">
                <h1 class="detail-title">${movie.title}</h1>
                
                <div class="detail-meta">
                    <span class="detail-year">${movie.year}</span>
                    <span class="detail-runtime">${movie.runtime}</span>
                    <div class="detail-rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.rating}/10</span>
                    </div>
                </div>
                
                <p class="detail-description">${movie.description}</p>
                
                <div class="detail-actions">
                    <a href="https://www.youtube.com/watch?v=${movie.trailerYoutubeId}" 
                       target="_blank" 
                       class="trailer-btn">
                        <i class="fab fa-youtube"></i>
                        Watch Trailer
                    </a>
                    <button class="watchlist-btn">
                        <i class="fas fa-plus"></i>
                        Add to Watchlist
                    </button>
                </div>
                
                <div class="quick-stats">
                    <div class="stat">
                        <span class="stat-value">${movie.totalReviews.toLocaleString()}</span>
                        <span class="stat-label">Reviews</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${movie.communityRating}</span>
                        <span class="stat-label">Community Score</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Genre Chart Section -->
        <div class="detail-section">
            <h2 class="section-title">
                <i class="fas fa-chart-pie"></i>
                Genre DNA
            </h2>
            <div class="genre-chart-container">
                <canvas id="genreChart"></canvas>
            </div>
        </div>
        
        <!-- Cast Section -->
        <div class="detail-section">
            <h2 class="section-title">
                <i class="fas fa-users"></i>
                The Faces Behind
            </h2>
            <div class="cast-grid">
                ${safeCastImages.map(person => `
                    <div class="cast-card">
                        <img src="${person.img}" 
                             alt="${person.name}" 
                             class="cast-img"
                             loading="lazy"
                             onerror="this.src='${CONFIG.fallbackCast}${Math.floor(Math.random() * 70)}'">
                        <h4>${person.name}</h4>
                        <p class="character">${person.character}</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Crew Section -->
        <div class="detail-section">
            <h2 class="section-title">
                <i class="fas fa-video"></i>
                Creative Team
            </h2>
            <div class="crew-info">
                <div class="crew-item">
                    <strong>Directed by:</strong>
                    <span>${movie.director}</span>
                </div>
                <div class="crew-item">
                    <strong>Produced by:</strong>
                    <span>${movie.producer}</span>
                </div>
            </div>
        </div>
        
        <!-- OTT Section -->
        <div class="detail-section">
            <h2 class="section-title">
                <i class="fas fa-play-circle"></i>
                Where to Watch
            </h2>
            <div class="ott-list">
                ${movie.ott.map(platform => `
                    <div class="ott-item" style="border-left: 4px solid ${platform.color};">
                        <i class="${platform.icon}"></i>
                        <span>${platform.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- REVIEW SECTION -->
        <div class="detail-section review-section">
            <div class="review-header">
                <h2 class="review-title">Community Verdict</h2>
                <div class="review-stats">
                    <span><i class="fas fa-users"></i> ${movie.totalReviews.toLocaleString()} votes</span>
                    <span><i class="fas fa-star"></i> ${movie.communityRating}/5</span>
                </div>
            </div>
            
            <!-- Review Buttons -->
            <div class="review-buttons">
                <button class="review-btn skip" data-vote="skip">
                    <i class="fas fa-times-circle"></i>
                    <span>Skip (${movie.reviewCounts.skip})</span>
                </button>
                <button class="review-btn not-bad" data-vote="notBad">
                    <i class="fas fa-meh"></i>
                    <span>Not Bad (${movie.reviewCounts.notBad})</span>
                </button>
                <button class="review-btn go-for-it" data-vote="goForIt">
                    <i class="fas fa-thumbs-up"></i>
                    <span>GO FOR IT (${movie.reviewCounts.goForIt})</span>
                </button>
                <button class="review-btn cinema" data-vote="cinema">
                    <i class="fas fa-crown"></i>
                    <span>CINEMA! (${movie.reviewCounts.cinema})</span>
                </button>
            </div>
            
            <!-- Review Form -->
            <div class="review-form">
                <h3><i class="fas fa-edit"></i> Write Your Review</h3>
                <div class="star-rating">
                    ${Array(5).fill().map((_, i) => `
                        <i class="far fa-star" data-rating="${i + 1}"></i>
                    `).join('')}
                    <span class="rating-text">Rate this movie</span>
                </div>
                <textarea 
                    placeholder="Share your thoughts about this movie... (What did you like? What could be better?)"
                    maxlength="500"></textarea>
                <div class="form-actions">
                    <button class="submit-review">
                        <i class="fas fa-paper-plane"></i>
                        Submit Review
                    </button>
                    <span class="char-count">0/500 characters</span>
                </div>
            </div>
        </div>
    `;
    
    // Initialize chart
    initGenreChart(movie.genreChart);
    
    // Setup review functionality
    setupReviewFunctionality(movie);
}

// =====================
// GENRE CHART
// =====================
function initGenreChart(chartData) {
    const ctx = document.getElementById('genreChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderWidth: 0,
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'var(--text-primary)',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    },
                    backgroundColor: 'var(--bg-secondary)',
                    titleColor: 'var(--text-primary)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                    borderWidth: 1
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// =====================
// REVIEW FUNCTIONALITY
// =====================
function setupReviewFunctionality(movie) {
    let selectedRating = 0;
    let selectedVote = null;
    
    // Review buttons
    const reviewBtns = document.querySelectorAll('.review-btn');
    const stars = document.querySelectorAll('.star-rating i');
    const textarea = document.querySelector('textarea');
    const charCount = document.querySelector('.char-count');
    const submitBtn = document.querySelector('.submit-review');
    
    // Handle review button clicks
    reviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            reviewBtns.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked button
            this.classList.add('active');
            selectedVote = this.getAttribute('data-vote');
            
            // Update count locally (in a real app, this would go to a server)
            movie.reviewCounts[selectedVote]++;
            const countSpan = this.querySelector('span');
            const match = countSpan.textContent.match(/\((\d+)\)/);
            if (match) {
                const newCount = parseInt(match[1]) + 1;
                countSpan.textContent = countSpan.textContent.replace(/\(\d+\)/, `(${newCount})`);
            }
        });
    });
    
    // Star rating
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRating = rating;
            
            // Update stars
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star';
                    s.style.color = '#fbbf24';
                } else {
                    s.className = 'far fa-star';
                    s.style.color = 'var(--text-muted)';
                }
            });
            
            // Update text
            const ratingText = document.querySelector('.rating-text');
            const texts = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
            ratingText.textContent = texts[rating - 1] || 'Rate this movie';
        });
        
        // Hover effect
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < hoverRating) {
                    s.style.color = '#fbbf24';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach((s, index) => {
                if (index >= selectedRating) {
                    s.style.color = 'var(--text-muted)';
                }
            });
        });
    });
    
    // Character count
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500 characters`;
        
        if (length > 450) {
            charCount.style.color = 'var(--danger)';
        } else if (length > 400) {
            charCount.style.color = 'var(--warning)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
    
    // Submit review
    submitBtn.addEventListener('click', function() {
        if (!selectedVote) {
            alert('Please select your verdict first!');
            return;
        }
        
        if (selectedRating === 0) {
            alert('Please rate the movie with stars!');
            return;
        }
        
        const reviewText = textarea.value.trim();
        if (reviewText.length < 10) {
            alert('Please write a review with at least 10 characters.');
            return;
        }
        
        // In a real app, you would send this to a server
        // For now, just show a success message
        this.innerHTML = '<i class="fas fa-check"></i> Review Submitted!';
        this.style.background = 'var(--success)';
        this.disabled = true;
        
        // Reset form after 2 seconds
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
            this.style.background = '';
            this.disabled = false;
            textarea.value = '';
            charCount.textContent = '0/500 characters';
            
            // Show thank you message
            const thankYou = document.createElement('div');
            thankYou.className = 'success-message';
            thankYou.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Thank you for your review! Your contribution helps the community.</span>
            `;
            document.querySelector('.review-form').appendChild(thankYou);
            
            setTimeout(() => thankYou.remove(), 5000);
        }, 2000);
    });
}

// =====================
// INITIALIZATION
// =====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    
    // Check which page we're on
    if (document.getElementById('movie-grid')) {
        // Homepage
        displayMovieCards('all');
    } else if (document.getElementById('movie-detail-content')) {
        // Detail page
        if (movieId) {
            displayMovieDetail(movieId);
        } else {
            document.getElementById('movie-detail-content').innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <h2>No Movie Selected</h2>
                    <p>Please select a movie from the homepage.</p>
                    <a href="index.html" class="detail-link">Browse Movies</a>
                </div>
            `;
        }
    }
    
    // Add some CSS for success messages
    const style = document.createElement('style');
    style.textContent = `
        .success-message {
            background: var(--success);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: fadeIn 0.3s ease;
        }
        
        .error-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-secondary);
        }
        
        .error-state i {
            color: var(--accent);
            margin-bottom: 1rem;
        }
        
        .error-state h2 {
            margin: 1rem 0;
            color: var(--text-primary);
        }
        
        .watchlist-btn {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border);
            padding: 0.8rem 1.5rem;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            transition: var(--transition);
        }
        
        .watchlist-btn:hover {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }
        
        .quick-stats {
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            display: block;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--text-muted);
        }
        
        .star-rating {
            margin: 1rem 0;
            display: flex;
            gap: 0.3rem;
            align-items: center;
        }
        
        .star-rating i {
            cursor: pointer;
            font-size: 1.5rem;
            transition: color 0.2s;
        }
        
        .rating-text {
            margin-left: 1rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
});
