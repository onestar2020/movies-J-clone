// ✅ js/admin.js - STRICT ADMIN ONLY (WITH AUTO-GENRE DETECT & USER REWARDS ENGINE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const TMDB_PROXY = 'https://movies-j-api-proxy.jayjovendinawanao2020.workers.dev';

const ADMIN_UID = 'ys5KRWrQmbYsLAue4wjKBZmFZnF2'; 

// ================= GLOBAL USER REWARD CONTROLLER =================
// Ginagamit ito para baguhin ang Role, Avatar Border, at Name Glow ng kahit sinong user
window.updateUserReward = async function(userId, field, value) {
    if (!userId) return;
    try {
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, { [field]: value }, { merge: true });
        console.log(`[Admin] User ${userId} ${field} updated to ${value}`);
    } catch (err) {
        console.error("Error updating user reward:", err);
        alert("Failed to update user reward in Firestore.");
    }
};

onAuthStateChanged(auth, (user) => {
    const list = document.getElementById('inventoryList');
    if (user) {
        if (user.uid !== ADMIN_UID) {
            alert("ACCESS DENIED: Hindi ka awtorisado para sa page na ito.");
            signOut(auth).then(() => window.location.href = "index.html");
            return;
        }
        if (list) loadInventory();
    } else {
        if (list) {
            list.innerHTML = `
                <div style="text-align:center; padding:40px; border: 2px dashed #333; border-radius: 10px;">
                    <i class="fas fa-user-shield" style="font-size: 2.5rem; color: #ff9800; margin-bottom: 15px;"></i>
                    <h3 style="color: #fff;">Admin Area Restricted</h3>
                    <button id="manualAdminLogin" class="submit-btn" style="max-width: 250px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18"> Login with Google
                    </button>
                </div>
            `;
            const loginBtn = document.getElementById('manualAdminLogin');
            if (loginBtn) {
                loginBtn.onclick = () => signInWithPopup(auth, provider);
            }
        }
    }
});

// --- TMDB Genre ID to Admin Select Value Mapping ---
const genreMapping = {
    28: "action", 12: "action", 10759: "action", // Action, Adventure
    35: "comedy", // Comedy
    27: "horror", 53: "horror", // Horror, Thriller
    10749: "romance", 18: "romance", // Romance, Drama
    878: "scifi", 14: "scifi", 10765: "scifi", // Sci-Fi, Fantasy
    16: "animation" // Animation
};

// --- Auto Fetch Poster & Auto Select Genre ---
const fetchPosterBtn = document.getElementById('fetchPosterBtn');
if (fetchPosterBtn) {
    fetchPosterBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('movieTitle');
        const title = titleInput ? titleInput.value : '';
        const btn = document.getElementById('fetchPosterBtn');
        if (!title) return alert("Type the movie title first!");

        btn.textContent = "Searching...";
        try {
            const res = await fetch(`${TMDB_PROXY}/search/multi?query=${encodeURIComponent(title)}`);
            const data = await res.json();
            
            const result = data.results && data.results.find(item => item.poster_path);

            if (result) {
                const posterInput = document.getElementById('posterUrl');
                if (posterInput) {
                    posterInput.value = `https://image.tmdb.org/t/p/w500${result.poster_path}`;
                }
                
                if (result.genre_ids && result.genre_ids.length > 0) {
                    let matchedGenre = "action";
                    for (let id of result.genre_ids) {
                        if (genreMapping[id]) {
                            matchedGenre = genreMapping[id];
                            break;
                        }
                    }
                    const genreSelect = document.getElementById('movieGenre');
                    if (genreSelect) {
                        genreSelect.value = matchedGenre;
                    }
                }

                btn.innerHTML = '<i class="fas fa-check"></i> Found!';
                setTimeout(() => btn.innerHTML = '<i class="fas fa-search"></i> Get Poster', 2000);
            } else {
                alert("No poster found.");
                btn.innerHTML = '<i class="fas fa-search"></i> Get Poster';
            }
        } catch (err) {
            btn.innerHTML = '<i class="fas fa-search"></i> Get Poster';
        }
    });
}

async function loadInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    list.innerHTML = '<p style="text-align: center; color: #888;">Fetching vault items...</p>';
    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        let movies = [];
        querySnapshot.forEach((docSnap) => movies.push({ id: docSnap.id, ...docSnap.data() }));
        movies.sort((a, b) => (b.timestamp ? b.timestamp.toMillis() : 0) - (a.timestamp ? a.timestamp.toMillis() : 0));

        if (movies.length === 0) return list.innerHTML = '<p style="text-align: center; color: #888;">Vault is empty.</p>';

        list.innerHTML = '';
        movies.forEach(movie => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <div class="inv-info">
                    <h4>${movie.title} ${movie.isNew ? '<span style="color:#4caf50;font-size:10px;">(NEW)</span>' : ''}</h4>
                    <p style="font-size: 0.75rem; color: #666; font-family: monospace;">Category: ${movie.genre || 'N/A'}</p>
                </div>
                <div class="inv-actions">
                    <button class="btn-edit" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
            div.querySelector('.btn-edit').onclick = () => startEdit(movie);
            div.querySelector('.btn-delete').onclick = () => deleteMovie(movie.id, movie.title);
        });
    } catch (error) {
        list.innerHTML = '<p style="color: #ff4444; text-align:center;">Failed to load data. Database is locked.</p>';
    }
}

async function deleteMovie(id, title) {
    if (confirm(`Sigurado ka bang burahin ang "${title}"?`)) {
        await deleteDoc(doc(db, "movies", id));
        loadInventory();
    }
}

function startEdit(movie) {
    const formHeader = document.getElementById('formHeader');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (formHeader) formHeader.textContent = "✏️ Editing: " + movie.title;
    if (submitBtn) submitBtn.textContent = "Save Changes";
    if (cancelEditBtn) cancelEditBtn.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.getElementById('editDocId').value = movie.id;
    document.getElementById('movieTitle').value = movie.title || '';
    document.getElementById('movieGenre').value = movie.genre || 'action'; 
    document.getElementById('posterUrl').value = movie.posterUrl || '';
    document.getElementById('fileInfo').value = movie.fileInfo || '';
    document.getElementById('isNewMovie').checked = movie.isNew || false;

    ['driveLink', 'mediafireLink', 'megaLink', 'teraboxLink', 'otherPlatformName', 'otherLink'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    if (movie.links) {
        movie.links.forEach(link => {
            const p = link.platform.toLowerCase();
            if (p.includes("drive")) document.getElementById('driveLink').value = link.url;
            else if (p.includes("mediafire")) document.getElementById('mediafireLink').value = link.url;
            else if (p.includes("mega")) document.getElementById('megaLink').value = link.url;
            else if (p.includes("terabox")) document.getElementById('teraboxLink').value = link.url;
            else {
                const otherNameEl = document.getElementById('otherPlatformName');
                const otherLinkEl = document.getElementById('otherLink');
                if (otherNameEl) otherNameEl.value = link.platform;
                if (otherLinkEl) otherLinkEl.value = link.url;
            }
        });
    }
}

function resetForm() {
    const form = document.getElementById('uploadForm');
    if (form) form.reset();
    const editDocId = document.getElementById('editDocId');
    if (editDocId) editDocId.value = '';
    const formHeader = document.getElementById('formHeader');
    if (formHeader) formHeader.textContent = "🎬 Upload to Vault";
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.textContent = "Upload Movie";
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) cancelEditBtn.style.display = "none";
}

const cancelBtn = document.getElementById('cancelEditBtn');
if (cancelBtn) cancelBtn.onclick = resetForm;

const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const submitBtn = document.getElementById('submitBtn');
        const statusMsg = document.getElementById('statusMessage');
        const editId = document.getElementById('editDocId').value;
        
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        const links = [];
        const fields = {
            drive: document.getElementById('driveLink').value,
            mf: document.getElementById('mediafireLink').value,
            mega: document.getElementById('megaLink').value,
            tera: document.getElementById('teraboxLink').value,
            other: document.getElementById('otherLink').value,
            otherName: document.getElementById('otherPlatformName').value || "Link"
        };

        if (fields.drive) links.push({ platform: "Google Drive", url: fields.drive });
        if (fields.mf) links.push({ platform: "MediaFire", url: fields.mf });
        if (fields.mega) links.push({ platform: "Mega", url: fields.mega });
        if (fields.tera) links.push({ platform: "TeraBox", url: fields.tera });
        if (fields.other) links.push({ platform: fields.otherName, url: fields.other });

        const movieData = {
            title: document.getElementById('movieTitle').value,
            genre: document.getElementById('movieGenre').value, 
            isNew: document.getElementById('isNewMovie').checked,
            posterUrl: document.getElementById('posterUrl').value,
            fileInfo: document.getElementById('fileInfo').value,
            links: links,
            timestamp: editId ? undefined : new Date()
        };

        try {
            if (editId) {
                delete movieData.timestamp;
                await updateDoc(doc(db, "movies", editId), movieData);
                statusMsg.textContent = "✅ Na-update na ang movie!";
            } else {
                await addDoc(collection(db, "movies"), movieData);
                statusMsg.textContent = "✅ Tagumpay na naidagdag!";
            }
            statusMsg.style.display = "block";
            statusMsg.style.color = "#4caf50";
            resetForm();
            loadInventory();
            setTimeout(() => statusMsg.style.display = "none", 3000);
        } catch (error) {
            statusMsg.textContent = "❌ Error: Hindi na-save ang movie.";
            statusMsg.style.display = "block";
            statusMsg.style.color = "#ff4444";
        } finally {
            submitBtn.disabled = false;
            if (!editId) submitBtn.textContent = "Upload Movie";
        }
    });
}