// script.js - Main JavaScript with TMDB API Integration

import { 
    TMDB_API_KEY, 
    TMDB_BASE_URL, 
    TMDB_IMAGE_BASE,
    FALLBACK_POSTER,
    FALLBACK_CAST 
} from './config.js';

// Global State
let currentUser = {
    watchlist: JSON.parse(localStorage.getItem('cineverse_watchlist') || '[]'),
    reviews: JSON.parse(localStorage.getItem('cineverse_reviews') || '{}')
};

// ========== UTILITY FUNCTIONS ==========
function saveUserData() {
    localStorage.setItem('cineverse_watchlist', JSON.stringify(currentUser.watchlist));
    localStorage.setItem('cineverse_reviews', JSON.stringify(currentUser.reviews));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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

// ========== TMDB API FUNCTIONS ==========
async function fetchTrending(type = 'movie') {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/trending/${type}/week?api_key=${TMDB_API_KEY}`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
}

async function searchMedia(query, type = 'multi') {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US`
        );
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error searching:', error);
        return [];
    }
}

async function getMediaDetails(type, id) {
    try {
        // Fetch main details
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
        
        // Format data
        return {
            id: details.id,
            type: type,
            title: details.title || details.name,
            original_title: details.original_title || details.original_name,
            overview: details.overview,
            poster_path: details.poster_path,
            backdrop_path: details.backdrop_path,
            release_date: details.release_date || details.first_air_date,
            vote_average: details.vote_average,
            vote_count: details.vote_count,
            genres: details.genres || [],
            runtime: details.runtime || details.episode_run_time?.[0] || null,
            status: details.status,
            
            // Credits
            cast: credits.cast?.slice(0, 10) || [],
            crew: credits.crew || [],
            
            // Videos
            trailer: videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || null,
            
            // Additional info
            budget: details.budget,
            revenue: details.revenue,
            tagline: details.tagline,
            production_companies: details.production_companies || []
        };
    } catch (error) {
        console.error('Error fetching media details:', error);
        return null;
    }
}

async function getSimilarMedia(type, id) {
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/${type}/${id}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        return data.results?.slice(0, 6) || [];
    } catch (error) {
        console.error('Error fetching similar:', error);
        return [];
    }
}

// ========== RENDER FUNCTIONS ==========
function createMediaCard(media, type = 'movie') {
    const posterPath = media.poster_path 
        ? `${TMDB_IMAGE_BASE}/w342${media.poster_path}`
        : FALLBACK_POSTER;
    
    const releaseYear = (media.release_date || media.first_air_date)?.substring(0, 4) || 'N/A';
    const title = media.title || media.name || 'Unknown Title';
    const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.id = media.id;
    card.dataset.type = type;
    
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
                <span class="movie-year">${releaseYear}</span>
                <span>•</span>
                <span class="movie-type">${type === 'movie' ? 'Movie' : 'TV Show'}</span>
            </div>
            <div class="movie-genres">
                ${(media.genre_ids || []).slice(0, 2).map(genreId => {
                    const genreName = getGenreName(genreId, type);
                    return `<span class="genre-tag">${genreName}</span>`;
                }).join('')}
            </div>
        </div>
    `;
    
    // Click anywhere on card to view details
    card.addEventListener('click', () => {
        window.location.href = `movie.html?type=${type}&id=${media.id}`;
    });
    
    return card;
}

function getGenreName(id, type) {
    const movieGenres = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
        9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
        53: 'Thriller', 10752: 'War', 37: 'Western'
    };
    
    const tvGenres = {
        10759: 'Action & Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        10762: 'Kids', 9648: 'Mystery', 10763: 'News', 10764: 'Reality',
        10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk',
        10768: 'War & Politics', 37: 'Western'
    };
    
    return type === 'movie' ? movieGenres[id] || 'Unknown' : tvGenres[id] || 'Unknown';
}

// ========== SEARCH FUNCTION ==========
let searchTimeout;
let currentSearchType = 'all';

async function performSearch(query, type = 'multi') {
    console.log('🔍 Search Function Called!');
    console.log('Searching for:', query, 'Type:', type);
    
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) {
        console.error('❌ searchResults element not found!');
        return;
    }
    
    console.log('✅ Search results element found');
    
    // Show loading
    searchResults.innerHTML = `
        <div class="loading-results">
            <div class="loading-spinner"></div>
            <p>Searching for "${query}"...</p>
        </div>
    `;
    searchResults.style.display = 'block';
    
    try {
        console.log('🌐 Fetching from TMDB API...');
        
        let results = [];
        
        if (type === 'anime') {
            // For anime, search in TV category
            const response = await fetch(
                `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            console.log('📊 Anime search response:', data);
            results = data.results || [];
        } else if (type === 'all') {
            // Search both movies and TV
            const [moviesRes, tvRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`),
                fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`)
            ]);
            
            const moviesData = await moviesRes.json();
            const tvData = await tvRes.json();
            
            // Combine results
            results = [...(moviesData.results || []), ...(tvData.results || [])];
        } else {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            console.log('📊 Search response:', data);
            results = data.results || [];
        }
        
        console.log('🎬 Results found:', results.length);
        
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
        
        // Display results
        let html = '';
        results.slice(0, 10).forEach(item => {
            const posterPath = item.poster_path 
                ? `${TMDB_IMAGE_BASE}/w92${item.poster_path}`
                : FALLBACK_POSTER;
            
            const title = item.title || item.name || 'Unknown';
            const year = (item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A';
            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            const id = item.id;
            
            html += `
                <div class="search-result-item" data-id="${id}" data-type="${itemType}">
                    <img src="${posterPath}" alt="${title}" class="result-poster" 
                         onerror="this.src='${FALLBACK_POSTER}'">
                    <div class="result-info">
                        <div class="result-title">${title}</div>
                        <div class="result-meta">
                            <span>${year}</span>
                            <span>•</span>
                            <span>${itemType === 'movie' ? 'Movie' : 'TV Show'}</span>
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
        
        // Add click events
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const type = this.dataset.type;
                window.location.href = `movie.html?type=${type}&id=${id}`;
            });
        });
        
    } catch (error) {
        console.error('❌ Search error:', error);
        searchResults.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Search Failed</h3>
                <p>Please check your internet connection</p>
                <p style="font-size: 12px; margin-top: 10px; color: #ff6b6b;">
                    ${error.message}
                </p>
            </div>
        `;
    }
}

function setupSearch() {
    const searchInput = document.getElementById('mainSearchInput');
    const searchResults = document.getElementById('searchResults');
    const filterBtns = document.querySelectorAll('.search-filters .filter-btn');
    const genreTags = document.querySelectorAll('.genre-tag');
    const searchTags = document.querySelectorAll('.search-tag');
    const categoryCards = document.querySelectorAll('.category-card');

    if (!searchInput) {
        console.error('❌ mainSearchInput not found!');
        return;
    }

    // Live search as you type
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            if (searchResults) searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(async () => {
            await performSearch(query, currentSearchType);
        }, 500);
    });

    // Search filter buttons
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentSearchType = this.dataset.type;
                
                const query = searchInput.value.trim();
                if (query && query.length >= 2) {
                    performSearch(query, currentSearchType);
                }
            });
        });
    }

    // Genre tags
    if (genreTags.length > 0) {
        genreTags.forEach(tag => {
            tag.addEventListener('click', async function() {
                const genreId = this.dataset.genre;
                searchByGenre(genreId);
            });
        });
    }

    // Popular search tags
    if (searchTags.length > 0) {
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
    }

    // Category cards
    if (categoryCards.length > 0) {
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
        
        // Use the same display function
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try a different genre</p>
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
        
        // Add click events
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', function() {
                const id = this.dataset.id;
                const type = this.dataset.type;
                window.location.href = `movie.html?type=${type}&id=${id}`;
            });
        });
        
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

async function renderMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'movie';
    const id = urlParams.get('id');
    
    if (!id) {
        document.getElementById('movieContent').innerHTML = `
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
    const movieContent = document.getElementById('movieContent');
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
    
    // Fetch movie details
    const movie = await getMediaDetails(type, id);
    
    if (!movie) {
        movieContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-film fa-3x"></i>
                <h2>Movie Not Found</h2>
                <p>This movie doesn't exist in our database.</p>
                <a href="index.html" class="action-btn">Browse Movies</a>
            </div>
        `;
        return;
    }
    
    // Render movie details
    const posterPath = movie.poster_path 
        ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
        : FALLBACK_POSTER;
    
    const releaseYear = movie.release_date?.substring(0, 4) || 'N/A';
    const isInWatchlist = currentUser.watchlist.includes(`${type}-${id}`);
    
    movieContent.innerHTML = `
        <div class="movie-header">
            <div class="movie-poster-large">
                <img src="${posterPath}" alt="${movie.title}" 
                     onerror="this.src='${FALLBACK_POSTER}'">
            </div>
            <div class="movie-details">
                <h1 class="movie-title-large">${movie.title}</h1>
                <div class="movie-meta-large">
                    <span class="movie-year">${releaseYear}</span>
                    ${movie.runtime ? `<span>•</span><span>${movie.runtime} min</span>` : ''}
                    <span>•</span>
                    <div class="movie-rating-large">
                        <i class="fas fa-star"></i>
                        <span>${movie.vote_average.toFixed(1)}/10</span>
                        <span>(${movie.vote_count.toLocaleString()} votes)</span>
                    </div>
                </div>
                
                <div class="movie-actions">
                    ${movie.trailer ? `
                        <a href="https://www.youtube.com/watch?v=${movie.trailer.key}" 
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
                    <p>${movie.overview || 'No overview available.'}</p>
                </div>
                
                ${movie.tagline ? `
                    <div class="movie-tagline">
                        <em>"${movie.tagline}"</em>
                    </div>
                ` : ''}
                
                <div class="genre-section">
                    <h3><i class="fas fa-tags"></i> Genres</h3>
                    <div class="movie-genres">
                        ${movie.genres.map(genre => `
                            <span class="genre-tag">${genre.name}</span>
                        `).join('')}
                    </div>
                </div>
                
                ${movie.production_companies.length > 0 ? `
                    <div class="production-section">
                        <h3><i class="fas fa-building"></i> Production</h3>
                        <p>${movie.production_companies.map(company => company.name).join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
        
        ${movie.cast.length > 0 ? `
            <div class="cast-section">
                <h2><i class="fas fa-users"></i> Cast</h2>
                <div class="cast-grid">
                    ${movie.cast.map(person => {
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
        watchlistBtn.addEventListener('click', () => {
            const mediaId = `${type}-${id}`;
            const index = currentUser.watchlist.indexOf(mediaId);
            
            if (index === -1) {
                currentUser.watchlist.push(mediaId);
                watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
                showNotification('Added to watchlist!', 'success');
            } else {
                currentUser.watchlist.splice(index, 1);
                watchlistBtn.innerHTML = '<i class="fas fa-plus"></i> Add to Watchlist';
                showNotification('Removed from watchlist', 'info');
            }
            saveUserData();
        });
    }
    
    // Load similar movies
    const similarMovies = await getSimilarMedia(type, id);
    const similarGrid = document.getElementById('similarMovies');
    if (similarGrid && similarMovies.length > 0) {
        similarGrid.innerHTML = '';
        similarMovies.forEach(media => {
            const card = createMediaCard(media, type);
            similarGrid.appendChild(card);
        });
    }
    
    // Setup review system
    setupReviewSystem(type, id);
}

function setupReviewSystem(type, id) {
    const mediaId = `${type}-${id}`;
    const userReview = currentUser.reviews[mediaId] || null;
    
    // Verdict buttons
    const verdictButtons = document.querySelectorAll('.verdict-btn');
    verdictButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            verdictButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Save verdict
            if (!currentUser.reviews[mediaId]) {
                currentUser.reviews[mediaId] = {};
            }
            currentUser.reviews[mediaId].verdict = this.dataset.verdict;
            saveUserData();
        });
        
        // Set active if already reviewed
        if (userReview?.verdict === btn.dataset.verdict) {
            btn.classList.add('active');
        }
    });
    
    // Star rating
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            
            // Update stars
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star active';
                } else {
                    s.className = 'far fa-star';
                }
            });
            
            // Save rating
            if (!currentUser.reviews[mediaId]) {
                currentUser.reviews[mediaId] = {};
            }
            currentUser.reviews[mediaId].rating = rating;
            saveUserData();
        });
        
        // Hover effect
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.dataset.rating);
            stars.forEach((s, index) => {
                s.style.color = index < hoverRating ? '#fbbf24' : '';
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach((s, index) => {
                s.style.color = '';
            });
        });
        
        // Set stars if already rated
        if (userReview?.rating) {
            const rating = userReview.rating;
            if (rating >= parseInt(star.dataset.rating)) {
                star.className = 'fas fa-star active';
            }
        }
    });
    
    // Review text
    const reviewText = document.getElementById('reviewText');
    const charCount = document.querySelector('.char-count');
    
    if (userReview?.text) {
        reviewText.value = userReview.text;
        charCount.textContent = `${userReview.text.length}/500 characters`;
    }
    
    reviewText.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500 characters`;
        
        if (length > 450) {
            charCount.style.color = '#ef4444';
        } else if (length > 400) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '';
        }
        
        // Save text
        if (!currentUser.reviews[mediaId]) {
            currentUser.reviews[mediaId] = {};
        }
        currentUser.reviews[mediaId].text = this.value;
        saveUserData();
    });
    
    // Submit button
    const submitBtn = document.getElementById('submitReview');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const verdict = document.querySelector('.verdict-btn.active');
            const rating = document.querySelectorAll('.star-rating .fa-star.active').length;
            const text = reviewText.value.trim();
            
            if (!verdict) {
                showNotification('Please select a verdict!', 'warning');
                return;
            }
            
            if (rating === 0) {
                showNotification('Please rate with stars!', 'warning');
                return;
            }
            
            if (text.length < 10) {
                showNotification('Please write at least 10 characters', 'warning');
                return;
            }
            
            // Save complete review
            currentUser.reviews[mediaId] = {
                verdict: verdict.dataset.verdict,
                rating: rating,
                text: text,
                timestamp: Date.now(),
                submitted: true
            };
            saveUserData();
            
            // Success animation
            this.innerHTML = '<i class="fas fa-check"></i> Review Submitted!';
            this.style.background = '#10b981';
            this.disabled = true;
            
            showNotification('Review submitted successfully!', 'success');
            
            // Reset after 3 seconds
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
                this.style.background = '';
                this.disabled = false;
            }, 3000);
        });
    }
}

// ========== HOMEPAGE FUNCTIONS ==========
async function renderTrending() {
    const trendingGrid = document.getElementById('trendingContent');
    if (!trendingGrid) return;
    
    // Show loading
    trendingGrid.innerHTML = `
        <div class="loading-cards">
            ${Array(6).fill('<div class="card-skeleton"></div>').join('')}
        </div>
    `;
    
    // Fetch trending movies
    const trendingMovies = await fetchTrending('movie');
    
    if (trendingMovies.length === 0) {
        trendingGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-film fa-3x"></i>
                <h3>No trending movies found</h3>
                <p>Try refreshing the page</p>
            </div>
        `;
        return;
    }
    
    // Clear and render
    trendingGrid.innerHTML = '';
    trendingMovies.forEach(movie => {
        const card = createMediaCard(movie, 'movie');
        trendingGrid.appendChild(card);
    });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Search forms
    const searchForms = document.querySelectorAll('form');
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="text"]');
            const query = input.value.trim();
            
            if (query) {
                // In a real implementation, this would go to search.html
                // For now, show notification
                showNotification(`Searching for: ${query}`, 'info');
                // You would redirect to search.html?q=${query}
            }
        });
    });
    
    // Popular search tags
    const searchTags = document.querySelectorAll('.search-tag');
    searchTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            const searchTerm = this.dataset.search;
            const searchInput = document.getElementById('mainSearchInput') || document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = searchTerm;
                searchInput.focus();
            }
        });
    });
    
    // Trending filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.type;
            // In a real implementation, this would filter trending content
            showNotification(`Showing trending ${type}`, 'info');
        });
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CineVerse Initializing...');
    
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
        `;
        document.head.appendChild(style);
    }
    
    // Check which page we're on
    if (window.location.pathname.includes('movie.html')) {
        console.log('📄 Movie Detail Page');
        renderMovieDetails();
    } else {
        console.log('🏠 Homepage');
        
        // Initialize search FIRST
        console.log('🔧 Setting up search...');
        setupSearch();
        
        // Load trending movies
        const trendingGrid = document.getElementById('trendingContent');
        if (trendingGrid) {
            console.log('🔥 Loading trending movies...');
            fetchTrending('movie').then(movies => {
                console.log(`🎬 Found ${movies.length} trending movies`);
                trendingGrid.innerHTML = '';
                movies.slice(0, 6).forEach(movie => {
                    const card = createMediaCard(movie, 'movie');
                    trendingGrid.appendChild(card);
                });
            }).catch(error => {
                console.error('❌ Error loading trending:', error);
                trendingGrid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load trending movies</p>
                    </div>
                `;
            });
        } else {
            console.error('❌ trendingContent element not found!');
        }
        
        // Trending filters
        const trendingFilters = document.querySelectorAll('.trending-filter');
        if (trendingFilters.length > 0) {
            console.log('🔘 Setting up trending filters...');
            trendingFilters.forEach(btn => {
                btn.addEventListener('click', async function() {
                    trendingFilters.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const type = this.dataset.type;
                    const trendingGrid = document.getElementById('trendingContent');
                    
                    try {
                        const movies = await fetchTrending(type);
                        trendingGrid.innerHTML = '';
                        movies.slice(0, 6).forEach(movie => {
                            const card = createMediaCard(movie, type);
                            trendingGrid.appendChild(card);
                        });
                    } catch (error) {
                        console.error('Error loading trending:', error);
                    }
                });
            });
        }
        
        console.log('✅ Homepage initialization complete!');
    }
});

// ========== EXPORTS FOR MODULES ==========
export {
    searchMedia,
    getMediaDetails,
    createMediaCard

};
