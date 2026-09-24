// ✅ js/browse.js (BROWSE PAGE WITH SKELETON LOADING & FIXED LOAD MORE BUTTON)

let currentPage = 1;
let currentType = 'movie';
let currentGenre = '';
let isLoading = false;
let currentSort = 'popularity.desc';

const browseGenresMap = {
    "movie": {
        28:"Action", 12:"Adventure", 16:"Animation", 35:"Comedy", 80:"Crime", 99:"Documentary", 18:"Drama", 10751:"Family", 14:"Fantasy", 36:"History", 27:"Horror", 10402:"Music", 9648:"Mystery", 10749:"Romance", 878:"Sci-Fi", 10770:"TV Movie", 53:"Thriller", 10752:"War", 37:"Western"
    },
    "tv": {
        10759: "Action & Adv", 16: "Animation", 35: "Comedy", 80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 10762: "Kids", 9648: "Mystery", 10763: "News", 10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics", 37: "Western"
    }
};

const fullGenreMap = { ...browseGenresMap.movie, ...browseGenresMap.tv };

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentType = urlParams.get('type') || 'movie';
    const typeLabel = currentType === 'tv' ? 'TV Shows' : currentType === 'anime' ? 'Anime' : 'Movies';
    
    const titleEl = document.getElementById("browse-title");
    if (titleEl) titleEl.textContent = typeLabel;
    document.title = `Browse ${typeLabel} - Movies-J`;

    populateGenreFilter();
    setupInfiniteScroll();

    // Ikonekta sa existing HTML Load More button
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            if (currentType === 'anime') fetchAnime();
            else fetchBrowseContent();
        };
    }

    if (currentType === 'anime') {
        fetchAnime();
    } else {
        fetchBrowseContent();
    }

    const genreFilter = document.getElementById("genre-filter");
    if (genreFilter) {
        if (currentType === 'anime') {
            genreFilter.style.display = 'none';
        } else {
            genreFilter.addEventListener("change", (e) => {
                currentGenre = e.target.value;
                currentPage = 1;
                document.getElementById("browse-grid").innerHTML = '';
                fetchBrowseContent();
            });
        }
    }
});

function populateGenreFilter() {
    const filter = document.getElementById("genre-filter");
    if (!filter || currentType === 'anime') return;
    
    const targetMap = browseGenresMap[currentType] || browseGenresMap.movie;
    filter.innerHTML = `<option value="">All Genres</option>`;
    for (let id in targetMap) {
        filter.innerHTML += `<option value="${id}">${targetMap[id]}</option>`;
    }
}

async function fetchBrowseContent() {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);

    try {
        let endpoint = `${BASE_URL}/discover/${currentType}?page=${currentPage}&sort_by=${currentSort}`;
        let directEndpoint = `https://api.themoviedb.org/3/discover/${currentType}?api_key=${TMDB_DIRECT_KEY}&page=${currentPage}&sort_by=${currentSort}`;

        if (currentGenre) {
            endpoint += `&with_genres=${currentGenre}`;
            directEndpoint += `&with_genres=${currentGenre}`;
        }

        let res;
        try {
            res = await fetch(endpoint);
            if (!res.ok) throw new Error("Proxy failed");
        } catch (e) {
            res = await fetch(directEndpoint);
        }

        const data = await res.json();
        const items = data.results || [];
        
        displayGridItems(items.map(item => ({ ...item, media_type: currentType })));
        currentPage++;
    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

async function fetchAnime() {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);

    try {
        let endpoint = `${BASE_URL}/discover/tv?with_keywords=210024|287501&with_genres=16&sort_by=popularity.desc&page=${currentPage}`;
        let directEndpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_DIRECT_KEY}&with_keywords=210024|287501&with_genres=16&sort_by=popularity.desc&page=${currentPage}`;

        let res;
        try {
            res = await fetch(endpoint);
            if (!res.ok) throw new Error("Proxy failed");
        } catch (e) {
            res = await fetch(directEndpoint);
        }

        const data = await res.json();
        const items = data.results || [];
        
        displayGridItems(items.map(item => ({ ...item, media_type: 'tv' })));
        currentPage++;
    } catch (error) {
        console.error("Anime Fetch Error:", error);
    } finally {
        isLoading = false;
        showLoading(false);
    }
}

function displayGridItems(items) {
    const grid = document.getElementById("browse-grid");
    if (!grid) return;

    items.forEach(item => {
        if (!item.poster_path) return;
        const releaseYear = (item.release_date || item.first_air_date || 'N/A').substring(0, 4);
        const voteAvg = (item.vote_average || 0).toFixed(1);

        const card = document.createElement("div");
        card.className = "movie-card loading"; 

        card.innerHTML = `
            <img src="${IMG_URL_W500}${item.poster_path}" alt="${item.title || item.name}" loading="lazy" onload="this.classList.add('loaded'); this.parentElement.classList.remove('loading');">
            <div class="card-info">
                <h4>${item.title || item.name}</h4>
                <p>⭐ ${voteAvg} • ${releaseYear}</p>
            </div>
        `;

        card.onclick = () => {
            if (typeof showDetailsModal === 'function') {
                showDetailsModal(item);
            }
        };
        grid.appendChild(card);
    });
}

function showLoading(show) {
    const btn = document.getElementById("load-more-btn");
    if (btn) {
        btn.textContent = show ? "Loading..." : "Load More";
        btn.disabled = show;
        btn.style.opacity = show ? "0.6" : "1";
        btn.style.cursor = show ? "wait" : "pointer";
    }
}

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !isLoading) {
            if (currentType === 'anime') fetchAnime();
            else fetchBrowseContent();
        }
    });
}