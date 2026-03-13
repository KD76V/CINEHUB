// script.js - COMPLETE WORKING VERSION

import { 
    TMDB_API_KEY, 
    TMDB_BASE_URL, 
    TMDB_IMAGE_BASE,
    FALLBACK_POSTER,
    FALLBACK_CAST 
} from './config.js';

// ========== QUOTES DATABASE ==========
const loadingQuotes = [
    { text: "Movies are dreams that you never forget.", author: "CineVerse" },
    { text: "The cinema is a window into our dreams.", author: "CineVerse" },
    { text: "A good film is when the price of the ticket is forgotten.", author: "CineVerse" },
    { text: "Movies touch our hearts and awaken our vision.", author: "CineVerse" },
    { text: "The best movies are the ones that make you feel something.", author: "CineVerse" }
];

// ========== POPULAR MOVIE MESSAGES ==========
const movieMessages = {
    "Fight Club": {
        title: "Hope you don't break any rules",
        message: "Fight Club rules: 1. You do not talk about Fight Club. 2. You DO NOT talk about Fight Club."
    },
    "Inception": {
        title: "Is it a dream?",
        message: "Don't forget to spin your top after watching this masterpiece."
    },
    "The Matrix": {
        title: "Welcome to the desert of the real",
        message: "Take the red pill and see how deep the rabbit hole goes."
    }
};

// ========== GLOBAL STATE ==========
let currentUser = {
    watchlist: JSON.parse(localStorage.getItem('cineverse_watchlist') || '[]'),
    reviews: JSON.parse(localStorage.getItem('cineverse_reviews') || '{}')
};

let searchTimeout;
let currentSearchType = 'all';

// ========== UTILITY FUNCTIONS ==========
function saveUserData() {
    localStorage.setItem('cineverse_watchlist', JSON.stringify(currentUser.watchlist));
    localStorage.setItem('cineverse_reviews', JSON.stringify(currentUser.reviews));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white; padding: 1rem 1.5rem; border-radius: 12px; z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ========== BACK TO TOP ==========
function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ========== LOADING QUOTE ==========
function showLoadingQuote() {
    const loadingQuote = document.getElementById('loadingQuote');
    const quoteText = document.getElementById('quoteText');
    if (!loadingQuote || !quoteText) return;
    const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
    quoteText.textContent = `"${randomQuote.text}"`;
    loadingQuote.classList.add('show');
    setTimeout(hideLoadingQuote, 2000);
}

function hideLoadingQuote() {
    const loadingQuote = document.getElementById('loadingQuote');
    if (loadingQuote) loadingQuote.classList.remove('show');
}

// ========== TMDB API FUNCTIONS ==========
async function fetchTrending(type = 'movie') {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/${type}/week?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching trending:', error);
        return [];
    }
}

async function getMediaDetails(type, id) {
    try {
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`),
            fetch(`${TMDB_BASE_URL}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
            fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`)
        ]);
        
        const [details, credits, videos] = await Promise.all([
            detailsRes.json(), creditsRes.json(), videosRes.json()
        ]);
        
        return {
            id: details.id,
            type: type,
            title: details.title || details.name,
            overview: details.overview,
            poster_path: details.poster_path,
            release_date: details.release_date || details.first_air_date,
            vote_average: details.vote_average,
            vote_count: details.vote_count,
            genres: details.genres || [],
            runtime: details.runtime || details.episode_run_time?.[0],
            cast: credits.cast?.slice(0, 10) || [],
            crew: credits.crew || [],
            trailer: videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') || null,
            tagline: details.tagline
        };
    } catch (error) {
        console.error('Error fetching details:', error);
        return null;
    }
}

async function getSimilarMedia(type, id) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/similar?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        return data.results?.slice(0, 6) || [];
    } catch (error) {
        return [];
    }
}

// ========== CREATE MEDIA CARD ==========
function createMediaCard(media, type = 'movie') {
    const posterPath = media.poster_path ? `${TMDB_IMAGE_BASE}/w342${media.poster_path}` : FALLBACK_POSTER;
    const title = media.title || media.name || 'Unknown';
    const year = (media.release_date || media.first_air_date)?.substring(0, 4) || 'N/A';
    const rating = media.vote_average?.toFixed(1) || 'N/A';
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${posterPath}" alt="${title}" onerror="this.src='${FALLBACK_POSTER}'">
            <div class="movie-rating"><i class="fas fa-star"></i> ${rating}</div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${title}</h3>
            <div class="movie-meta"><span>${year}</span> • <span>${type === 'movie' ? 'Movie' : 'TV'}</span></div>
        </div>
    `;
    card.addEventListener('click', () => window.location.href = `movie.html?type=${type}&id=${media.id}`);
    return card;
}

// ========== SEARCH - ONLY MAIN CONTENT ==========
async function performSearch(query, type = 'multi') {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    searchResults.innerHTML = `<div class="loading-results">Searching for "${query}"...</div>`;
    searchResults.style.display = 'block';
    
    try {
        let results = [];
        
        if (type === 'anime') {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            results = (data.results || []).filter(item => 
                item.genre_ids?.includes(16) &&
                !item.name?.toLowerCase().includes('interview') &&
                !item.name?.toLowerCase().includes('behind the scenes')
            );
        } else if (type === 'all') {
            const [moviesRes, tvRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`),
                fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`)
            ]);
            
            const moviesData = await moviesRes.json();
            const tvData = await tvRes.json();
            
            const filteredMovies = (moviesData.results || []).filter(item => 
                !item.title?.toLowerCase().includes('trailer') &&
                !item.title?.toLowerCase().includes('interview') &&
                !item.title?.toLowerCase().includes('behind the scenes') &&
                !item.title?.toLowerCase().includes('recap') &&
                !item.title?.toLowerCase().includes('story so far')
            );
            
            const filteredTv = (tvData.results || []).filter(item => 
                !item.name?.toLowerCase().includes('interview') &&
                !item.name?.toLowerCase().includes('behind the scenes') &&
                !item.name?.toLowerCase().includes('recap') &&
                !item.name?.toLowerCase().includes('talk show')
            );
            
            results = [...filteredMovies, ...filteredTv];
        } else {
            const response = await fetch(
                `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
            );
            const data = await response.json();
            results = (data.results || []).filter(item => {
                const title = item.title || item.name || '';
                return !title.toLowerCase().includes('trailer') &&
                       !title.toLowerCase().includes('interview') &&
                       !title.toLowerCase().includes('behind the scenes');
            });
        }
        
        // Remove duplicates
        const uniqueResults = [];
        const seenIds = new Set();
        results.forEach(item => {
            if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueResults.push(item);
            }
        });
        
        if (uniqueResults.length === 0) {
            searchResults.innerHTML = `<div class="no-results">No results found for "${query}"</div>`;
            return;
        }
        
        uniqueResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        displaySearchResults(uniqueResults.slice(0, 8), query);
        
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `<div class="no-results">Search failed</div>`;
    }
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    if (!searchResults) return;
    
    let html = '';
    results.forEach(item => {
        const posterPath = item.poster_path ? `${TMDB_IMAGE_BASE}/w92${item.poster_path}` : FALLBACK_POSTER;
        const title = item.title || item.name || 'Unknown';
        const year = (item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A';
        const itemType = item.media_type || (item.title ? 'movie' : 'tv');
        const rating = item.vote_average?.toFixed(1) || 'N/A';
        
        html += `
            <div class="search-result-item" data-id="${item.id}" data-type="${itemType}">
                <img src="${posterPath}" alt="${title}" class="result-poster" onerror="this.src='${FALLBACK_POSTER}'">
                <div class="result-info">
                    <div class="result-title">${title}</div>
                    <div class="result-meta">
                        <span>${year}</span> • <span>${itemType === 'movie' ? 'Movie' : 'TV'}</span>
                        <span class="result-rating"><i class="fas fa-star"></i> ${rating}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = `movie.html?type=${this.dataset.type}&id=${this.dataset.id}`;
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('mainSearchInput');
    const filterBtns = document.querySelectorAll('.search-filters .filter-btn');
    const genreTags = document.querySelectorAll('.genre-tag');
    const searchTags = document.querySelectorAll('.search-tag');
    const moodTags = document.querySelectorAll('.mood-tag');

    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        if (query.length < 2) {
            document.getElementById('searchResults').style.display = 'none';
            return;
        }
        searchTimeout = setTimeout(() => performSearch(query, currentSearchType), 500);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSearchType = this.dataset.type;
            const query = searchInput.value.trim();
            if (query.length >= 2) performSearch(query, currentSearchType);
        });
    });

    genreTags.forEach(tag => {
        tag.addEventListener('click', async function() {
            searchInput.value = '';
            document.getElementById('searchResults').style.display = 'none';
            await loadGenreResults(this.dataset.genre, this.textContent, 'movie');
        });
    });

    moodTags.forEach(tag => {
        tag.addEventListener('click', async function() {
            const moodMap = {
                'happy': 35, 'intense': 28, 'funny': 35,
                'scary': 27, 'romantic': 10749, 'thoughtful': 18
            };
            await loadGenreResults(moodMap[this.dataset.mood] || 18, this.dataset.mood, 'movie');
        });
    });

    searchTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = this.dataset.search;
            searchInput.focus();
            performSearch(this.dataset.search, currentSearchType);
        });
    });
}

async function loadGenreResults(genreId, genreName, type = 'movie') {
    const trendingSection = document.getElementById('trendingSection');
    const genreSection = document.getElementById('genreResultsSection');
    const resultsGrid = document.getElementById('genreResultsGrid');
    const resultsTitle = document.querySelector('#resultsTitle span');
    
    if (!trendingSection || !genreSection || !resultsGrid) return;
    
    trendingSection.classList.add('hidden');
    genreSection.style.display = 'block';
    resultsTitle.textContent = genreName;
    
    resultsGrid.innerHTML = `<div class="loading-cards">${Array(6).fill('<div class="card-skeleton"></div>').join('')}</div>`;
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
        );
        const data = await response.json();
        const results = data.results || [];
        
        resultsGrid.innerHTML = '';
        results.slice(0, 12).forEach(item => {
            resultsGrid.appendChild(createMediaCard(item, type));
        });
    } catch (error) {
        resultsGrid.innerHTML = '<div class="error-state">Failed to load results</div>';
    }
}

// ========== MOVIE DETAIL PAGE ==========
async function renderMovieDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'movie';
    const id = urlParams.get('id');
    
    const movieContent = document.getElementById('movieContent');
    if (!movieContent) return;
    
    if (!id) {
        movieContent.innerHTML = '<div class="error-state">No movie selected</div>';
        return;
    }
    
    movieContent.innerHTML = `
        <div class="loading-detail">
            <div class="poster-skeleton"></div>
            <div class="info-skeleton">
                ${Array(5).fill('<div class="line"></div>').join('')}
                <div class="line short"></div>
            </div>
        </div>
    `;
    
    const movie = await getMediaDetails(type, id);
    
    if (!movie) {
        movieContent.innerHTML = '<div class="error-state">Movie not found</div>';
        return;
    }
    
    const posterPath = movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : FALLBACK_POSTER;
    const releaseYear = movie.release_date?.substring(0, 4) || 'N/A';
    const isInWatchlist = currentUser.watchlist.includes(`${type}-${id}`);
    
    const keyCrew = (movie.crew || []).filter(p => ['Director', 'Producer', 'Writer'].includes(p.job)).slice(0, 6);
    
    movieContent.innerHTML = `
        <div class="movie-header">
            <div class="movie-poster-large">
                <img src="${posterPath}" alt="${movie.title}" onerror="this.src='${FALLBACK_POSTER}'">
            </div>
            <div class="movie-details">
                <h1 class="movie-title-large">${movie.title}</h1>
                <div class="movie-meta-large">
                    <span>${releaseYear}</span>
                    ${movie.runtime ? `<span>•</span><span>${movie.runtime} min</span>` : ''}
                    <span>•</span>
                    <div class="movie-rating-large">
                        <i class="fas fa-star"></i> ${movie.vote_average?.toFixed(1) || 'N/A'}/10
                    </div>
                </div>
                
                <div class="movie-actions">
                    ${movie.trailer ? `
                        <a href="https://www.youtube.com/watch?v=${movie.trailer.key}" target="_blank" class="action-btn trailer-btn">
                            <i class="fab fa-youtube"></i> Watch Trailer
                        </a>
                    ` : ''}
                    <button class="action-btn watchlist-btn" id="watchlistBtn">
                        <i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i>
                        ${isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </button>
                </div>
                
                <div class="movie-overview">
                    <h3>Overview</h3>
                    <p>${movie.overview || 'No overview available.'}</p>
                </div>
                
                ${movie.tagline ? `<div class="movie-tagline"><em>"${movie.tagline}"</em></div>` : ''}
                
                <div class="genre-section">
                    <h3>Genres</h3>
                    <div class="movie-genres">
                        ${(movie.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        ${movie.cast?.length > 0 ? `
            <div class="cast-section">
                <h2><i class="fas fa-users"></i> Cast</h2>
                <div class="cast-grid">
                    ${movie.cast.map(person => `
                        <div class="cast-card" data-name="${person.name}">
                            <img src="${person.profile_path ? `${TMDB_IMAGE_BASE}/w185${person.profile_path}` : FALLBACK_CAST}" 
                                 alt="${person.name}" onerror="this.src='${FALLBACK_CAST}'">
                            <h4 class="cast-name">${person.name}</h4>
                            <p class="cast-character">${person.character || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${keyCrew.length > 0 ? `
            <div class="crew-section">
                <h2><i class="fas fa-video"></i> Crew</h2>
                <div class="crew-grid">
                    ${keyCrew.map(person => `
                        <div class="crew-card" data-name="${person.name}">
                            <img src="${person.profile_path ? `${TMDB_IMAGE_BASE}/w185${person.profile_path}` : FALLBACK_CAST}" 
                                 alt="${person.name}" onerror="this.src='${FALLBACK_CAST}'">
                            <h4 class="crew-name">${person.name}</h4>
                            <p class="crew-job">${person.job || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    // Watchlist button
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
    
    // Clickable cast/crew
    document.querySelectorAll('.cast-card, .crew-card').forEach(card => {
        card.addEventListener('click', function() {
            const name = this.querySelector('.cast-name, .crew-name')?.textContent;
            if (name) window.location.href = `person.html?name=${encodeURIComponent(name)}`;
        });
    });
    
    // Similar movies
    const similarMovies = await getSimilarMedia(type, id);
    const similarGrid = document.getElementById('similarMovies');
    if (similarGrid && similarMovies.length > 0) {
        similarGrid.innerHTML = '';
        similarMovies.forEach(media => similarGrid.appendChild(createMediaCard(media, type)));
    }
    
    setupReviewSystem(type, id);
}

// ========== REVIEW SYSTEM ==========
function setupReviewSystem(type, id) {
    const mediaId = `${type}-${id}`;
    const userReview = currentUser.reviews[mediaId] || null;
    
    const verdictButtons = document.querySelectorAll('.verdict-btn');
    verdictButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            verdictButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (!currentUser.reviews[mediaId]) currentUser.reviews[mediaId] = {};
            currentUser.reviews[mediaId].verdict = this.dataset.verdict;
            saveUserData();
        });
        if (userReview?.verdict === btn.dataset.verdict) btn.classList.add('active');
    });
    
    const reviewText = document.getElementById('reviewText');
    const charCount = document.querySelector('.char-count');
    
    if (userReview?.text) {
        reviewText.value = userReview.text;
        charCount.textContent = `${userReview.text.length}/500 characters`;
    }
    
    reviewText.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = `${length}/500 characters`;
        if (!currentUser.reviews[mediaId]) currentUser.reviews[mediaId] = {};
        currentUser.reviews[mediaId].text = this.value;
        saveUserData();
    });
    
    const submitBtn = document.getElementById('submitReview');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const verdict = document.querySelector('.verdict-btn.active');
            const text = reviewText.value.trim();
            
            if (!verdict) {
                showNotification('Please select a verdict!', 'warning');
                return;
            }
            if (text.length < 10) {
                showNotification('Please write at least 10 characters', 'warning');
                return;
            }
            
            currentUser.reviews[mediaId] = {
                verdict: verdict.dataset.verdict,
                text: text,
                timestamp: Date.now(),
                submitted: true
            };
            saveUserData();
            
            const movieTitle = document.querySelector('.movie-title-large')?.textContent || '';
            if (movieMessages[movieTitle]) {
                showMoviePopup(movieTitle);
            } else {
                showNotification('Review submitted successfully!', 'success');
            }
            
            this.innerHTML = '<i class="fas fa-check"></i> Review Submitted!';
            this.style.background = '#10b981';
            this.disabled = true;
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
                this.style.background = '';
                this.disabled = false;
            }, 3000);
        });
    }
}

// ========== TRENDING ==========
async function loadTrendingMovies() {
    const trendingGrid = document.getElementById('trendingContent');
    if (!trendingGrid) return;
    
    trendingGrid.innerHTML = `<div class="loading-cards">${Array(6).fill('<div class="card-skeleton"></div>').join('')}</div>`;
    
    const trendingMovies = await fetchTrending('movie');
    
    if (trendingMovies.length === 0) {
        const fallbackMovies = [
            { id: 693134, title: "Dune: Part Two", poster_path: "/8b8R8l88Qje9dn9OE8PY05Nx1S8.jpg", vote_average: 8.8, release_date: "2024-02-28" },
            { id: 872585, title: "Oppenheimer", poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n8ua.jpg", vote_average: 8.3, release_date: "2023-07-19" },
            { id: 569094, title: "Spider-Verse", poster_path: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg", vote_average: 8.7, release_date: "2023-05-31" }
        ];
        trendingGrid.innerHTML = '';
        fallbackMovies.forEach(m => trendingGrid.appendChild(createMediaCard(m, 'movie')));
        return;
    }
    
    trendingGrid.innerHTML = '';
    trendingMovies.slice(0, 6).forEach(m => trendingGrid.appendChild(createMediaCard(m, 'movie')));
}

// ========== POPUP ==========
function showMoviePopup(movieTitle) {
    const popup = document.getElementById('reviewPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    
    if (!popup) return;
    
    const message = movieMessages[movieTitle];
    if (message) {
        popupTitle.textContent = message.title;
        popupMessage.textContent = message.message;
    } else {
        popupTitle.textContent = "Thank you for your review!";
        popupMessage.textContent = "Your opinion helps the community.";
    }
    
    popup.classList.add('show');
    
    document.getElementById('closePopup')?.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('show'); });
}

// ========== CLEAR RESULTS ==========
document.getElementById('clearResults')?.addEventListener('click', () => {
    document.getElementById('trendingSection')?.classList.remove('hidden');
    document.getElementById('genreResultsSection').style.display = 'none';
    loadTrendingMovies();
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    showLoadingQuote();
    setupBackToTop();
    
    if (window.location.pathname.includes('movie.html')) {
        renderMovieDetails();
    } else if (window.location.pathname.includes('person.html')) {
        import('./person.js').then(m => m.loadPersonDetails?.());
    } else {
        setupSearch();
        loadTrendingMovies();
        
        document.querySelectorAll('.trending-filter').forEach(btn => {
            btn.addEventListener('click', async function() {
                document.querySelectorAll('.trending-filter').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const grid = document.getElementById('trendingContent');
                const movies = await fetchTrending(this.dataset.type);
                grid.innerHTML = '';
                movies.slice(0, 6).forEach(m => grid.appendChild(createMediaCard(m, this.dataset.type)));
            });
        });
    }
    
    window.addEventListener('load', hideLoadingQuote);
});
