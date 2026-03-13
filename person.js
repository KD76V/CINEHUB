// person.js - Person Profile Page Script

import { 
    TMDB_API_KEY, 
    TMDB_BASE_URL, 
    TMDB_IMAGE_BASE,
    FALLBACK_POSTER,
    FALLBACK_CAST 
} from './config.js';

export async function loadPersonDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const personName = urlParams.get('name');
    
    if (!personName) {
        showError('No person specified');
        return;
    }
    
    try {
        const searchResponse = await fetch(
            `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(personName)}`
        );
        const searchData = await searchResponse.json();
        
        if (!searchData.results?.length) {
            showError('Person not found');
            return;
        }
        
        const personId = searchData.results[0].id;
        
        const [personRes, creditsRes] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&language=en-US`),
            fetch(`${TMDB_BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}&language=en-US`)
        ]);
        
        const person = await personRes.json();
        const credits = await creditsRes.json();
        
        renderPersonPage(person, credits);
        
    } catch (error) {
        console.error('Error loading person:', error);
        showError('Failed to load person details');
    }
}

function renderPersonPage(person, credits) {
    const contentDiv = document.getElementById('personContent');
    const filmographyGrid = document.getElementById('filmographyGrid');
    
    if (!contentDiv || !filmographyGrid) return;
    
    const birthDate = person.birthday ? new Date(person.birthday) : null;
    const deathDate = person.deathday ? new Date(person.deathday) : null;
    const age = birthDate ? calculateAge(birthDate, deathDate) : null;
    
    const profilePath = person.profile_path 
        ? `${TMDB_IMAGE_BASE}/w500${person.profile_path}`
        : FALLBACK_CAST;
    
    contentDiv.innerHTML = `
        <div class="person-header">
            <div class="person-image">
                <img src="${profilePath}" alt="${person.name}" onerror="this.src='${FALLBACK_CAST}'">
            </div>
            <div class="person-info">
                <h1 class="person-name">${person.name}</h1>
                
                <div class="person-details">
                    ${person.birthday ? `
                        <div class="person-detail-item">
                            <span class="person-detail-label">Born</span>
                            <span class="person-detail-value">${formatDate(person.birthday)}</span>
                        </div>
                    ` : ''}
                    ${age ? `
                        <div class="person-detail-item">
                            <span class="person-detail-label">Age</span>
                            <span class="person-detail-value">${age}</span>
                        </div>
                    ` : ''}
                    ${person.place_of_birth ? `
                        <div class="person-detail-item">
                            <span class="person-detail-label">Birthplace</span>
                            <span class="person-detail-value">${person.place_of_birth}</span>
                        </div>
                    ` : ''}
                    ${person.known_for_department ? `
                        <div class="person-detail-item">
                            <span class="person-detail-label">Known for</span>
                            <span class="person-detail-value">${person.known_for_department}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${person.biography ? `
                    <div class="person-bio">
                        <h3>Biography</h3>
                        <p>${person.biography}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Filter: Only movies and TV shows, no talk shows/guest appearances
    const validCast = (credits.cast || []).filter(item => {
        const title = item.title || item.name || '';
        return !title.toLowerCase().includes('interview') &&
               !title.toLowerCase().includes('talk show') &&
               !title.toLowerCase().includes('behind the scenes') &&
               !item.character?.toLowerCase().includes('self') &&
               !item.character?.toLowerCase().includes('host') &&
               !item.character?.toLowerCase().includes('guest');
    });
    
    const validCrew = (credits.crew || []).filter(item => {
        return ['Director', 'Producer', 'Writer', 'Screenplay', 'Story'].includes(item.job) &&
               !item.job?.toLowerCase().includes('thanks');
    });
    
    const allCredits = [...validCast, ...validCrew];
    const uniqueCredits = [];
    const seenIds = new Set();
    
    allCredits.forEach(item => {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueCredits.push(item);
        }
    });
    
    uniqueCredits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    filmographyGrid.innerHTML = '';
    uniqueCredits.slice(0, 20).forEach(item => {
        filmographyGrid.appendChild(createFilmCard(item));
    });
    
    if (uniqueCredits.length === 0) {
        filmographyGrid.innerHTML = '<div class="no-results">No movies or shows found</div>';
    }
}

function createFilmCard(item) {
    const posterPath = item.poster_path ? `${TMDB_IMAGE_BASE}/w342${item.poster_path}` : FALLBACK_POSTER;
    const title = item.title || item.name || 'Unknown';
    const year = (item.release_date || item.first_air_date)?.substring(0, 4) || 'N/A';
    const type = item.title ? 'movie' : 'tv';
    
    let role = '';
    if (item.character) role = `as ${item.character}`;
    else if (item.job) role = item.job;
    
    const card = document.createElement('div');
    card.className = 'film-card';
    card.innerHTML = `
        <div class="film-poster">
            <img src="${posterPath}" alt="${title}" loading="lazy" onerror="this.src='${FALLBACK_POSTER}'">
        </div>
        <div class="film-info">
            <h4 class="film-title">${title}</h4>
            ${role ? `<p class="film-role">${role}</p>` : ''}
            <p class="film-year">${year}</p>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `movie.html?type=${type}&id=${item.id}`;
    });
    
    return card;
}

function calculateAge(birthDate, deathDate) {
    const end = deathDate || new Date();
    let age = end.getFullYear() - birthDate.getFullYear();
    const m = end.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birthDate.getDate())) age--;
    return age;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString(undefined, { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
}

function showError(message) {
    const contentDiv = document.getElementById('personContent');
    if (contentDiv) {
        contentDiv.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h2>${message}</h2>
                <a href="index.html" class="action-btn">Go Home</a>
            </div>
        `;
    }
}

// Auto-load when page loads
if (window.location.pathname.includes('person.html')) {
    document.addEventListener('DOMContentLoaded', loadPersonDetails);
}
