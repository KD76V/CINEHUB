// config.js - ADD YOUR API KEYS HERE

// Get FREE API Key from: https://www.themoviedb.org/settings/api
const TMDB_API_KEY = '8e75c66eb4940b3690ad35d3f55010f5'; // ← YOUR REAL KEY HERE

// Optional: YouTube API Key for trailers
// Get from: https://console.cloud.google.com/apis/credentials
const YOUTUBE_API_KEY = ''; // ← Leave empty or add YouTube key

// API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Fallback images
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=800&auto=format&fit=crop';
const FALLBACK_CAST = 'https://i.pravatar.cc/150?img=';

export {
    TMDB_API_KEY,
    YOUTUBE_API_KEY,
    TMDB_BASE_URL,
    TMDB_IMAGE_BASE,
    FALLBACK_POSTER,
    FALLBACK_CAST
};