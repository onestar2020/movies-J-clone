// ✅ js/vault.js - FIREBASE DATABASE WITH POSTERS & INFO (FIXED CATEGORY FILTER)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getAuth, GoogleAuthProvider, signInWithPopup, 
    onAuthStateChanged, signOut, setPersistence, browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
    getFirestore, collection, getDocs 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAauNF6VBg_bcC1kDjxw6WO3cTvvSUKY-Q", 
  authDomain: "movies-j-vault.firebaseapp.com",
  projectId: "movies-j-vault",
  storageBucket: "movies-j-vault.firebasestorage.app",
  messagingSenderId: "16270353501",
  appId: "1:16270353501:web:0d2a8461cd761bd319b4",
  measurementId: "G-TH5LWS3R11"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
let allMoviesData = []; 

setPersistence(auth, browserLocalPersistence);

// Authentication Watcher
onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isLoginPage = path.includes("login");
    const isVaultPage = path.includes("vault");

    if (user) {
        if (isLoginPage) window.location.href = "vault.html";
        const userNameEl = document.getElementById("userName");
        if (userNameEl) userNameEl.textContent = user.displayName;

        // --- ADMIN BUTTON LOGIC ---
        if (user.uid === "ys5KRWrQmbYsLAue4wjKBZmFZnF2") {
            if (!document.getElementById("adminLinkBtn")) {
                const logoutBtn = document.getElementById("logoutBtn");
                if (logoutBtn) {
                    const adminBtn = document.createElement("a");
                    adminBtn.href = "admin.html";
                    adminBtn.id = "adminLinkBtn";
                    adminBtn.innerHTML = '<i class="fas fa-user-cog"></i> Admin';
                    adminBtn.style = "background: #ff9800; color: black; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 0.8rem; margin-right: 10px; transition: 0.3s;";
                    logoutBtn.parentNode.insertBefore(adminBtn, logoutBtn);
                }
            }
        }

        if (document.getElementById("vaultContainer")) loadMoviesFromDB();
    } else {
        if (isVaultPage) window.location.href = "login.html";
    }
});

// Fetch Data from Firestore
async function loadMoviesFromDB() {
    const container = document.getElementById("vaultContainer");
    container.innerHTML = `<h3 style="color: #888; text-align: center; grid-column: 1/-1;">Loading premium movies...</h3>`;

    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        allMoviesData = [];
        querySnapshot.forEach((doc) => allMoviesData.push({ id: doc.id, ...doc.data() }));

        allMoviesData.sort((a, b) => (b.timestamp ? b.timestamp.toMillis() : 0) - (a.timestamp ? a.timestamp.toMillis() : 0));
        renderVault(allMoviesData);
    } catch (error) {
        console.error("Error fetching movies:", error);
        container.innerHTML = `<h3 style="color: #ff4444; text-align: center; grid-column: 1/-1;">Failed to load movies.</h3>`;
    }
}

// Search & Buttons (CORRECTED CATEGORY LOGIC)
window.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const searchInput = document.getElementById("vaultSearchInput");
    const categorySelect = document.getElementById("vaultCategorySelect"); 

    if (loginBtn) loginBtn.addEventListener("click", async () => { try { await signInWithPopup(auth, provider); } catch (e) { alert("Error: " + e.message); } });
    if (logoutBtn) logoutBtn.addEventListener("click", async () => { await signOut(auth); window.location.href = "index.html"; });

    function filterVault() {
        const term = searchInput ? searchInput.value.toLowerCase() : "";
        const category = categorySelect ? categorySelect.value.toLowerCase() : "all";

        const filteredData = allMoviesData.filter(m => {
            const movieTitle = m.title ? m.title.toLowerCase() : "";
            const matchesSearch = movieTitle.includes(term);
            
            // TAMA NA LOGIC: Binabasa na niya yung "m.genre" galing database
            let matchesCategory = true;
            if (category !== "all") {
                matchesCategory = (m.genre === category);
            }

            return matchesSearch && matchesCategory;
        });

        renderVault(filteredData);
    }

    if (searchInput) searchInput.addEventListener("input", filterVault);
    if (categorySelect) categorySelect.addEventListener("change", filterVault);
});

function getButtonStyles(platform) {
    const p = platform.toLowerCase();
    if (p.includes("drive")) return "background: #ff9800; color: #000;";
    if (p.includes("mediafire")) return "background: #0078D7; color: #fff;";
    if (p.includes("mega")) return "background: #D9272E; color: #fff;";
    if (p.includes("terabox")) return "background: #4F46E5; color: #fff;";
    return "background: #333; color: #fff;"; 
}

// Main Renderer
function renderVault(data) {
    const container = document.getElementById("vaultContainer");

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: #333; margin-bottom: 15px;"></i>
                <p style="color: #888;">No movies found.</p>
            </div>`;
        return;
    }

    container.innerHTML = data.map(item => {
        let buttonsHTML = '';
        if (item.links && Array.isArray(item.links)) {
            buttonsHTML = item.links.map(link => `
                <a href="${link.url}" target="_blank" class="dl-btn" style="${getButtonStyles(link.platform)}">
                    <i class="fas fa-download"></i> ${link.platform}
                </a>
            `).join('');
        }

        const imageSource = item.posterUrl ? item.posterUrl : 'images/logo-192.png';
        const fileQualityInfo = item.fileInfo ? item.fileInfo : 'Verified Direct Link';

        let uploadDate = "Premium"; 
        if (item.timestamp) {
            const dateObj = item.timestamp.toDate();
            uploadDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        return `
        <div class="dl-card">
            <div class="badge-container">
                ${item.isNew ? '<span class="new-badge">NEW</span>' : '<span></span>'}
                <span class="dl-badge">${uploadDate}</span>
            </div>
            
            <img src="${imageSource}" alt="${item.title}" style="object-fit: cover;">
            
            <div class="dl-info">
                <h3>${item.title}</h3>
                
                <p style="font-size: 0.75rem; color: #aaa; margin-top: -10px; margin-bottom: 15px; word-break: break-all;">
                    ${fileQualityInfo}
                </p>

                <div class="dl-links-container">
                    ${buttonsHTML}
                </div>
            </div>
        </div>
        `;
    }).join('');
}