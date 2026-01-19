// script.js - FINAL WORKING VERSION

// ========== IMPORT CONFIG ==========
import { 
    TMDB_API_KEY, 
    TMDB_BASE_URL, 
    TMDB_IMAGE_BASE,
    FALLBACK_POSTER,
    FALLBACK_CAST 
} from './config.js';

// ========== GLOBAL VARIABLES ==========
let searchTimeout;
let currentSearchType = 'all';
let userWatchlist = JSON.parse(localStorage.getItem('cineverse_watchlist') || '[]');
let userReviews = JSON.parse(localStorage.getItem('cineverse_reviews') || '{}');

// ========== UTILITY FUNCTIONS ==========
function saveUserData() {
    localStorage.setItem('cineverse_watchlist', JSON.stringify(userWatchlist));
    localStorage.setItem('cineverse_reviews', JSON.stringify(userReviews));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== SEARCH FUNCTIONALITY ==========
function setupSearch() {
    const searchInput = document.getElementById('mainSearchInput');
    const searchForm = document.getElementById('searchForm');
    const searchResults = document.getElementById('searchResults');
    const filterBtns = document.querySelectorAll('.search-filters .filter-btn');
    const genreTags = document.querySelectorAll('.genre-tag');
    const searchTags = document.querySelectorAll('.search-tag');
    const categoryCards = document.querySelectorAll('.category-card');

    // Live search as you type
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                if (searchResults) searchResults.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(async () => {
                await performSearch(query, currentSearchType);
            }, 300);
        });
    }

    // Search form submit
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('searchInput')?.value.trim();
            if (query) {
                performSearch(query, currentSearchType);
            }
        });
    }

    // Search filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSearchType = this.dataset.type;
            
            const query = searchInput?.value.trim();
            if (query && query.length >= 2) {
                performSearch(query, currentSearchType);
            }
        });
    });

    // Genre tags search
    genreTags.forEach(tag => {
        tag.addEventListener('click', async function() {
            const genreId = this.dataset.genre;
            searchByGenre(genreId);
        });
    });

    // Popular search tags
    searchTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            const query = this.dataset.search;
            if (searchInput) {
                searchInput.value = query;
                searchInput.focus();
                performSearch(query, currentSearchType);
            }
        });
    });

    // Category cards
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.dataset.type;
            const genre = this.dataset.genre;
            
            // Set active filter
            filterBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === type || btn.dataset.type === 'all') {
                    btn.classList.add('active');
                }
            });
            
            // Search by genre
            if (genre) {
                searchByGenre(genre, type);
            }
        });
    });
}

async function performSearch(query, type = 'multi') {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    searchResults.innerHTML = `
        <div class="loading-results">
            <div class="loading-spinner"></div>
            <p>Searching for "${query}"...</p>
        </div>
    `;
    searchResults.style.display = 'block';
    
    try {
        let results = [];
        
        if (type === 'anime') {
            // For anime, search in TV category
            const response = await fetch(
                `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            results = data.results || [];
        } else {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            results = data.results || [];
        }
        
        displaySearchResults(results, query);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Search failed. Please try again.</p>
            </div>
        `;
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results for "${query}"</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    results.slice(0, 10).forEach(item => {
        const posterPath = item.poster_path 
            ? `${TMDB_IMAGE_BASE}/w92${item.poster_path}`
            : FALLBACK_POSTER;
        
        const title = item.title || item.name || 'Unknown';
        const year = (item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A';
        const type = item.media_type || (item.title ? 'movie' : 'tv');
        const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        const id = item.id;
        
        html += `
            <div class="search-result-item" data-id="${id}" data-type="${type}">
                <img src="${posterPath}" alt="${title}" class="result-poster" 
                     onerror="this.src='${FALLBACK_POSTER}'">
                <div class="result-info">
                    <div class="result-title">${title}</div>
                    <div class="result-meta">
                        <span>${year}</span>
                        <span>•</span>
                        <span>${type === 'movie' ? 'Movie' : 'TV Show'}</span>
                        <span>•</span>
                        <span class="result-rating">
                            <i class="fas fa-star"></i>
                            ${rating}
                        </span>
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    // Add click events to result items
    const resultItems = searchResults.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.addEventListener('click', function() {
            const id = this.dataset.id;
            const type = this.dataset.type;
            window.location.href = `movie.html?type=${type}&id=${id}`;
        });
    });
}

async function searchByGenre(genreId, type = 'movie') {
    const searchInput = document.getElementById('mainSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    searchResults.innerHTML = `
        <div class="loading-results">
            <div class="loading-spinner"></div>
            <p>Loading ${type} by genre...</p>
        </div>
    `;
    searchResults.style.display = 'block';
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
        );
        const data = await response.json();
        const results = data.results || [];
        
        displaySearchResults(results, `${type} genre`);
    } catch (error) {
        console.error('Genre search error:', error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load genre. Please try again.</p>
            </div>
        `;
    }
}

// ========== TRENDING MOVIES ==========
async function loadTrendingMovies() {
    const trendingGrid = document.getElementById('trendingContent');
    if (!trendingGrid) return;
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        const movies = data.results.slice(0, 6);
        
        trendingGrid.innerHTML = '';
        movies.forEach(movie => {
            const card = createMovieCard(movie, 'movie');
            trendingGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading trending:', error);
        trendingGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load trending movies</p>
            </div>
        `;
    }
}

function createMovieCard(movie, type) {
    const posterPath = movie.poster_path 
        ? `${TMDB_IMAGE_BASE}/w342${movie.poster_path}`
        : FALLBACK_POSTER;
    
    const title = movie.title || movie.name || 'Unknown';
    const year = (movie.release_date || movie.first_air_date)?.substring(0, 4) || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${posterPath}" alt="${title}" loading="lazy"
                 onerror="this.src='${FALLBACK_POSTER}'">
            <div class="movie-rating">
                <i class="fas fa-star"></i>
                <span>${rating}</span>
            </div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
                <span>•</span>
                <span class="movie-type">${type === 'movie' ? 'Movie' : 'TV Show'}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `movie.html?type=${type}&id=${movie.id}`;
    });
    
    return card;
}

// ========== MOVIE DETAILS ==========
async function renderMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'movie';
    const id = urlParams.get('id');
    
    const movieContent = document.getElementById('movieContent');
    if (!movieContent) return;
    
    if (!id) {
        movieContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h2>No Movie Selected</h2>
                <p>Please select a movie from the homepage.</p>
                <a href="index.html" class="action-btn">Browse Movies</a>
            </div>
        `;
        return;
    }
    
    // Show loading
    movieContent.innerHTML = `
        <div class="loading-detail">
            <div class="poster-skeleton"></div>
            <div class="info-skeleton">
                <div class="line"></div>
                <div class="line short"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line short"></div>
            </div>
        </div>
    `;
    
    try {
        // Fetch movie details
        const detailsUrl = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
        const creditsUrl = `${TMDB_BASE_URL}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`;
        const videosUrl = `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`;
        
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
            fetch(detailsUrl),
            fetch(creditsUrl),
            fetch(videosUrl)
        ]);
        
        const [details, credits, videos] = await Promise.all([
            detailsRes.json(),
            creditsRes.json(),
            videosRes.json()
        ]);
        
        // Render movie details
        const posterPath = details.poster_path 
            ? `${TMDB_IMAGE_BASE}/w500${details.poster_path}`
            : FALLBACK_POSTER;
        
        const releaseYear = details.release_date?.substring(0, 4) || details.first_air_date?.substring(0, 4) || 'N/A';
        const title = details.title || details.name || 'Unknown';
        const isInWatchlist = userWatchlist.includes(`${type}-${id}`);
        const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        
        movieContent.innerHTML = `
            <div class="movie-header">
                <div class="movie-poster-large">
                    <img src="${posterPath}" alt="${title}" 
                         onerror="this.src='${FALLBACK_POSTER}'">
                </div>
                <div class="movie-details">
                    <h1 class="movie-title-large">${title}</h1>
                    
                    <div class="movie-meta-large">
                        <span class="movie-year">${releaseYear}</span>
                        <span>•</span>
                        <span>${details.runtime || details.episode_run_time?.[0] || 'N/A'} min</span>
                        <span>•</span>
                        <div class="movie-rating-large">
                            <i class="fas fa-star"></i>
                            <span>${details.vote_average?.toFixed(1) || 'N/A'}/10</span>
                        </div>
                    </div>
                    
                    <div class="movie-actions">
                        ${trailer ? `
                            <a href="https://www.youtube.com/watch?v=${trailer.key}" 
                               target="_blank" 
                               class="action-btn trailer-btn">
                                <i class="fab fa-youtube"></i>
                                Watch Trailer
                            </a>
                        ` : ''}
                        <button class="action-btn watchlist-btn" id="watchlistBtn">
                            <i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i>
                            ${isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                    </div>
                    
                    <div class="movie-overview">
                        <h3><i class="fas fa-align-left"></i> Overview</h3>
                        <p>${details.overview || 'No overview available.'}</p>
                    </div>
                    
                    ${details.tagline ? `
                        <div class="movie-tagline">
                            <em>"${details.tagline}"</em>
                        </div>
                    ` : ''}
                    
                    <div class="genre-section">
                        <h3><i class="fas fa-tags"></i> Genres</h3>
                        <div class="movie-genres">
                            ${(details.genres || []).map(genre => `
                                <span class="genre-tag">${genre.name}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            ${credits.cast?.length > 0 ? `
                <div class="cast-section">
                    <h2><i class="fas fa-users"></i> Cast</h2>
                    <div class="cast-grid">
                        ${credits.cast.slice(0, 8).map(person => {
                            const profilePath = person.profile_path
                                ? `${TMDB_IMAGE_BASE}/w185${person.profile_path}`
                                : `${FALLBACK_CAST}${Math.floor(Math.random() * 70)}`;
                            
                            return `
                                <div class="cast-card">
                                    <img src="${profilePath}" 
                                         alt="${person.name}"
                                         onerror="this.src='${FALLBACK_CAST}${Math.floor(Math.random() * 70)}'">
                                    <h4 class="cast-name">${person.name}</h4>
                                    <p class="cast-character">${person.character}</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        // Setup watchlist button
        const watchlistBtn = document.getElementById('watchlistBtn');
        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', function() {
                const mediaId = `${type}-${id}`;
                const index = userWatchlist.indexOf(mediaId);
                
                if (index === -1) {
                    userWatchlist.push(mediaId);
                    this.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
                    showNotification('Added to watchlist!', 'success');
                } else {
                    userWatchlist.splice(index, 1);
                    this.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
                    showNotification('Removed from watchlist', 'info');
                }
                saveUserData();
            });
        }
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        movieContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-film fa-3x"></i>
                <h2>Movie Not Found</h2>
                <p>This movie doesn't exist in our database.</p>
                <a href="index.html" class="action-btn">Browse Movies</a>
            </div>
        `;
    }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid var(--border);
                border-top-color: var(--accent);
                border-radius: 50%;
                margin: 0 auto 1rem;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .error-state {
                text-align: center;
                padding: 2rem;
                color: var(--text-secondary);
            }
            .error-state i {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: var(--danger);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Check which page we're on
    if (window.location.pathname.includes('movie.html')) {
        renderMovieDetails();
    } else {
        // Homepage - Initialize everything
        setupSearch();
        loadTrendingMovies();
        
        // Add trending filter functionality
        const trendingFilters = document.querySelectorAll('.trending-filter');
        trendingFilters.forEach(btn => {
            btn.addEventListener('click', async function() {
                trendingFilters.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const type = this.dataset.type;
                const trendingGrid = document.getElementById('trendingContent');
                
                try {
                    const response = await fetch(
                        `${TMDB_BASE_URL}/trending/${type}/week?api_key=${TMDB_API_KEY}`
                    );
                    const data = await response.json();
                    const items = data.results.slice(0, 6);
                    
                    trendingGrid.innerHTML = '';
                    items.forEach(item => {
                        const card = createMovieCard(item, type);
                        trendingGrid.appendChild(card);
                    });
                } catch (error) {
                    console.error('Error loading trending:', error);
                }
            });
        });
    }
});
