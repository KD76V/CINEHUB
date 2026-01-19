// ========== SEARCH FUNCTIONALITY ==========
let searchTimeout;
let currentSearchType = 'all';

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
                searchResults.style.display = 'none';
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
