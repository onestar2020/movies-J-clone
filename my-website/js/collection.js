// ✅ js/collection.js
// Updated version: Handles both 'Company' and 'Collection' types

// Ang home.js ay dapat na-load muna para makuha ang BASE_URL at IMG_URL_W500

const urlParams = new URLSearchParams(window.location.search);
const collectionId = urlParams.get('id'); // Kinukuha ang ID (e.g., 8650)
const collectionName = urlParams.get('name') || "Collection"; // Kinukuha ang Pangalan
const collectionType = urlParams.get('type') || 'company'; // 'company' or 'collection'
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
    if (!collectionId) {
        document.getElementById('browse-grid').innerHTML = "<h3 style='color: #888;'>Error: Collection ID not provided in URL.</h3>";
        return;
    }
    
    setupCollectionPage();
    loadCollectionContent(); // Pinalitan ang pangalan ng function
});

function setupCollectionPage() {
    const titleElement = document.getElementById('browse-title');
    if(titleElement) titleElement.textContent = collectionName.includes("Collection") ? collectionName : `${collectionName} Collection`;
    document.title = `${collectionName} - Movies-J`;
    
    // Itago ang "Load More" button by default
    document.getElementById('load-more-btn').style.display = 'none';
}

async function loadCollectionContent() {
    if (collectionType === 'collection') {
        // Gagamitin ang API para sa specific na 'Collection'
        await loadFromCollectionAPI();
    } else {
        // Gagamitin ang lumang API para sa 'Company'
        await loadFromCompanyAPI(currentPage);
    }
}

// BAGO: Function para kumuha sa 'Collection' API
async function loadFromCollectionAPI() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    loadMoreBtn.style.display = 'none'; // 'Collection' endpoint ay walang pagination

    try {
        const endpoint = `${BASE_URL}/collection/${collectionId}`;
        const res = await fetch(endpoint);
        const data = await res.json();

        // Ang 'Collection' API ay nagbabalik ng 'parts'
        const results = (data.parts || []).map(item => ({...item, media_type: 'movie'}));
        
        displayContentGrid(results, true); // I-display ang resulta

    } catch (error) {
        console.error("Failed to load collection content:", error);
        document.getElementById('browse-grid').innerHTML = "<h3 style='color: #888;'>Failed to load collection.</h3>";
    }
}

// BAGO: Function para kumuha sa 'Company' API (ang lumang logic)
async function loadFromCompanyAPI(page) {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    try {
        const endpointMovie = `${BASE_URL}/discover/movie?with_companies=${collectionId}&sort_by=popularity.desc&page=${page}`;
        const endpointTv = `${BASE_URL}/discover/tv?with_companies=${collectionId}&sort_by=popularity.desc&page=${page}`;

        const [resMovie, resTv] = await Promise.all([
            fetch(endpointMovie),
            fetch(endpointTv)
        ]);
        
        const dataMovie = await resMovie.json();
        const dataTv = await resTv.json();

        const newResults = [
            ...(dataMovie.results || []).map(item => ({...item, media_type: 'movie'})),
            ...(dataTv.results || []).map(item => ({...item, media_type: 'tv'}))
        ];
        
        newResults.sort((a, b) => b.popularity - a.popularity);
        
        displayContentGrid(newResults, page === 1); // clearGrid ay true kung page 1
        
        // Ipakita ang "Load More" button kung may laman at kung company type
        if (newResults.length > 0) {
            loadMoreBtn.style.display = 'block';
            
            // Alisin ang lumang event listener at magdagdag ng bago
            loadMoreBtn.onclick = null; // Linisin
            loadMoreBtn.onclick = () => {
                currentPage++;
                loadFromCompanyAPI(currentPage); // Tatawagin ulit ang sarili nito
            };
            
        } else {
            loadMoreBtn.style.display = 'none'; // Wala nang results
        }
        
    } catch (error) {
        console.error("Failed to load company content:", error);
        document.getElementById('browse-grid').innerHTML = "<h3 style='color: #888;'>Failed to load company collection.</h3>";
    }
}


function displayContentGrid(items, clearGrid) {
    const grid = document.getElementById('browse-grid');
    if (!grid) return;

    if (clearGrid) {
        grid.innerHTML = ''; 
    }

    if (items.length === 0 && clearGrid) {
        grid.innerHTML = "<h3 style='color: #888; text-align: center;'>No items found in this collection.</h3>";
        document.getElementById('load-more-btn').style.display = 'none';
        return;
    }

    items.forEach(item => {
        if (item.poster_path) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            if (typeof showDetailsModal === 'function') {
                movieCard.onclick = () => showDetailsModal(item);
            } else {
                movieCard.onclick = () => goToMoviePage(item);
            }
            
            const posterUrl = typeof IMG_URL_W500 !== 'undefined' ? IMG_URL_W500 : 'https://image.tmdb.org/t/p/w500';
            
            movieCard.innerHTML = `
                <img src="${posterUrl}${item.poster_path}" alt="${item.title || item.name}" loading="lazy">
                <p class="movie-title">${item.title || item.name}</p>
            `;
            grid.appendChild(movieCard);
        }
    });
}