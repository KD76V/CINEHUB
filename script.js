// ========== QUOTES DATABASE ==========
const loadingQuotes = [
    { text: "Movies are dreams that you never forget.", author: "CineVerse" },
    { text: "The cinema is a window into our dreams.", author: "CineVerse" },
    { text: "A good film is when the price of the ticket is forgotten.", author: "CineVerse" },
    { text: "Movies touch our hearts and awaken our vision.", author: "CineVerse" },
    { text: "The best movies are the ones that make you feel something.", author: "CineVerse" },
    { text: "Cinema is a matter of what's in the frame and what's out.", author: "Martin Scorsese" },
    { text: "Film is one of the three universal languages.", author: "Frank Capra" },
    { text: "Movies can and do have tremendous influence in shaping young lives.", author: "Walt Disney" },
    { text: "The length of a film should be directly related to the endurance of the human bladder.", author: "Alfred Hitchcock" },
    { text: "A film is a never-ending dream.", author: "CineVerse" }
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
    },
    "Pulp Fiction": {
        title: "Say what again!",
        message: "You just witnessed Quentin Tarantino's masterpiece. Zed's dead, baby."
    },
    "The Dark Knight": {
        title: "Why so serious?",
        message: "You either die a hero, or you live long enough to see yourself become the villain."
    },
    "Interstellar": {
        title: "Do not go gentle into that good night",
        message: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space."
    },
    "Forrest Gump": {
        title: "Life is like a box of chocolates",
        message: "You never know what you're gonna get."
    },
    "The Godfather": {
        title: "I'm gonna make him an offer he can't refuse",
        message: "Leave the gun, take the cannoli."
    },
    "Goodfellas": {
        title: "As far back as I can remember",
        message: "I always wanted to be a gangster."
    },
    "Shawshank Redemption": {
        title: "Get busy living",
        message: "Or get busy dying."
    }
};

// ========== BACK TO TOP FUNCTIONALITY ==========
function setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========== LOADING QUOTE FUNCTIONALITY ==========
function showLoadingQuote() {
    const loadingQuote = document.getElementById('loadingQuote');
    const quoteText = document.getElementById('quoteText');
    if (!loadingQuote || !quoteText) return;
    
    const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
    quoteText.textContent = `"${randomQuote.text}"`;
    
    loadingQuote.classList.add('show');
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
        hideLoadingQuote();
    }, 2000);
}

function hideLoadingQuote() {
    const loadingQuote = document.getElementById('loadingQuote');
    if (loadingQuote) {
        loadingQuote.classList.remove('show');
    }
}

// ========== MOVIE-SPECIFIC POPUP ==========
function showMoviePopup(movieTitle) {
    const popup = document.getElementById('reviewPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    
    if (!popup || !popupTitle || !popupMessage) return;
    
    // Check if movie has custom message
    const message = movieMessages[movieTitle];
    if (message) {
        popupTitle.textContent = message.title;
        popupMessage.textContent = message.message;
    } else {
        // Default message
        popupTitle.textContent = "Thank you for your review!";
        popupMessage.textContent = "Your opinion helps the community discover great movies.";
    }
    
    popup.classList.add('show');
    
    // Close button
    const closeBtn = document.getElementById('closePopup');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('show');
        });
    }
    
    // Click outside to close
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
}

// ========== UPDATE SETUPSEARCH WITH GENRE RESULTS ==========
// Add this function to handle genre/mood results
async function loadGenreResults(genreId, genreName, type = 'movie') {
    const trendingSection = document.getElementById('trendingSection');
    const genreSection = document.getElementById('genreResultsSection');
    const resultsGrid = document.getElementById('genreResultsGrid');
    const resultsTitle = document.querySelector('#resultsTitle span');
    
    if (!trendingSection || !genreSection || !resultsGrid) return;
    
    // Hide trending, show genre results
    trendingSection.classList.add('hidden');
    genreSection.style.display = 'block';
    resultsTitle.textContent = genreName;
    
    // Show loading
    resultsGrid.innerHTML = `
        <div class="loading-cards">
            ${Array(6).fill('<div class="card-skeleton"></div>').join('')}
        </div>
    `;
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
        );
        const data = await response.json();
        const results = data.results || [];
        
        resultsGrid.innerHTML = '';
        results.slice(0, 12).forEach(item => {
            const card = createMediaCard(item, type);
            resultsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading genre results:', error);
        resultsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load results. Please try again.</p>
            </div>
        `;
    }
}

// Update setupSearch function to include genre click handling
// Find the genre tags section in setupSearch and replace with:

// Genre tags
if (genreTags.length > 0) {
    genreTags.forEach(tag => {
        tag.addEventListener('click', async function() {
            const genreId = this.dataset.genre;
            const genreName = this.textContent;
            
            // Clear any active search
            const searchInput = document.getElementById('mainSearchInput');
            if (searchInput) searchInput.value = '';
            
            // Hide search results if visible
            const searchResults = document.getElementById('searchResults');
            if (searchResults) searchResults.style.display = 'none';
            
            await loadGenreResults(genreId, genreName, 'movie');
        });
    });
}

// Mood filters
const moodTags = document.querySelectorAll('.mood-tag');
if (moodTags.length > 0) {
    moodTags.forEach(tag => {
        tag.addEventListener('click', async function() {
            const mood = this.dataset.mood;
            
            // Map moods to genres
            const moodMap = {
                'happy': [35, 10751], // Comedy, Family
                'intense': [28, 53, 878], // Action, Thriller, Sci-Fi
                'funny': [35], // Comedy
                'scary': [27, 53], // Horror, Thriller
                'romantic': [10749], // Romance
                'thoughtful': [18, 9648] // Drama, Mystery
            };
            
            const genres = moodMap[mood] || [18]; // Default to drama
            
            // For now, just use first genre
            await loadGenreResults(genres[0], mood.charAt(0).toUpperCase() + mood.slice(1), 'movie');
        });
    });
}

// Clear results button
const clearBtn = document.getElementById('clearResults');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        const trendingSection = document.getElementById('trendingSection');
        const genreSection = document.getElementById('genreResultsSection');
        
        if (trendingSection) trendingSection.classList.remove('hidden');
        if (genreSection) genreSection.style.display = 'none';
        
        // Reload trending
        loadTrendingMovies();
    });
}

// ========== UPDATE SETUPREVIEWSYSTEM TO REMOVE STARS ==========
// Replace the star rating section in setupReviewSystem with:
// (Keep everything else the same, just remove star rating code)

// In setupReviewSystem, remove the entire star rating section
// Keep only verdict buttons, review text, and submit button

// ========== UPDATE SUBMIT REVIEW TO SHOW POPUP ==========
// In setupReviewSystem, find the submit button click handler
// Add this at the beginning of the submit handler:

// Get movie title
const movieTitle = document.querySelector('.movie-title-large')?.textContent || '';

// After saving review, show popup for popular movies
if (movieMessages[movieTitle]) {
    showMoviePopup(movieTitle);
} else {
    showNotification('Review submitted successfully!', 'success');
}

// ========== UPDATE RENDERMOVIEDETAILS TO ADD CLICKABLE CAST/CREW ==========
// In renderMovieDetails, after rendering cast and crew sections, add:

// Add click handlers for cast cards
document.querySelectorAll('.cast-card').forEach(card => {
    card.addEventListener('click', function() {
        const name = this.querySelector('.cast-name')?.textContent;
        if (name) {
            window.location.href = `person.html?name=${encodeURIComponent(name)}`;
        }
    });
});

// Add click handlers for crew cards
document.querySelectorAll('.crew-card').forEach(card => {
    card.addEventListener('click', function() {
        const name = this.querySelector('.crew-name')?.textContent;
        if (name) {
            window.location.href = `person.html?name=${encodeURIComponent(name)}`;
        }
    });
});

// ========== UPDATE REVIEW VISUALIZATION ==========
// Add this function to update the circle progress
function updateVerdictCircles(reviewCounts) {
    const total = Object.values(reviewCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    
    const percentages = {
        skip: (reviewCounts.skip / total * 100).toFixed(1),
        notBad: (reviewCounts.notBad / total * 100).toFixed(1),
        goForIt: (reviewCounts.goForIt / total * 100).toFixed(1),
        cinema: (reviewCounts.cinema / total * 100).toFixed(1)
    };
    
    // Update circle progress
    document.querySelectorAll('.circle-progress').forEach(circle => {
        const verdict = circle.classList.contains('skip') ? 'skip' :
                        circle.classList.contains('not-bad') ? 'notBad' :
                        circle.classList.contains('go-for-it') ? 'goForIt' : 'cinema';
        
        const percent = percentages[verdict];
        const degrees = (percent / 100) * 360;
        circle.style.background = `conic-gradient(var(--progress-color) ${degrees}deg, var(--border) 0deg)`;
    });
    
    // Update percent text
    document.getElementById('skipPercent').textContent = percentages.skip + '%';
    document.getElementById('notBadPercent').textContent = percentages.notBad + '%';
    document.getElementById('goForItPercent').textContent = percentages.goForIt + '%';
    document.getElementById('cinemaPercent').textContent = percentages.cinema + '%';

    // Check if we're on person page
if (window.location.pathname.includes('person.html')) {
    import('./person.js');
}
}

// ========== UPDATE INITIALIZATION ==========
// Add these to the initialization section:

// Show loading quote on page load
showLoadingQuote();

// Setup back to top
setupBackToTop();

// Hide loading quote after page loads
window.addEventListener('load', hideLoadingQuote);


