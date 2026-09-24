// ✅ js/changelog.js - REALTIME FIRESTORE CHANGELOG & CLIENT PROTECTION
import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- 1. ANTI-DEVTOOLS & DEBUGGER FREEZE PROTECTION ---
(function protectClient() {
    function freezeDebugger() {
        setInterval(() => {
            (function() {
                return false;
            }
            ["constructor"]("debugger")());
        }, 50);
    }
    try {
        freezeDebugger();
    } catch (e) {}
})();

// Helper para iwas XSS
function sanitizeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- 2. INITIALIZATION & REALTIME LISTENER ---
document.addEventListener("DOMContentLoaded", () => {
    const changelogBtn = document.getElementById("changelog-btn");
    let modal = document.getElementById("changelog-modal");
    
    // Hanapin ang container o gumawa ng dynamic na bago
    let feedContainer = modal ? (modal.querySelector(".changelog-feed") || modal.querySelector(".changelog-list") || modal.querySelector(".changelog-body") || modal.querySelector(".modal-content")) : null;

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "changelog-modal";
        modal.className = "modal";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:999999; display:none; align-items:center; justify-content:center; padding:15px;";
        modal.innerHTML = `
            <div class="changelog-modal-card" style="background:#181818; border:1px solid #333; border-radius:12px; max-width:540px; width:100%; padding:24px; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.9); max-height:85vh; overflow-y:auto;">
                <span id="close-changelog-modal-btn" style="position:absolute; right:15px; top:12px; font-size:24px; color:#888; cursor:pointer; line-height:1;">&times;</span>
                <h3 style="color:#fff; font-size:1.2rem; margin-bottom:15px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-rocket" style="color:#e50914;"></i> System Updates & Logs
                </h3>
                <div id="changelog-feed-container" style="display:flex; flex-direction:column; gap:12px;">
                    <p style="color:#777; text-align:center; padding:20px;">Loading updates...</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById("close-changelog-modal-btn").onclick = () => {
            modal.style.display = "none";
        };
        feedContainer = document.getElementById("changelog-feed-container");
    } else {
        const existingClose = modal.querySelector(".close") || modal.querySelector(".close-btn") || modal.querySelector(".changelog-close-btn");
        if (existingClose) {
            existingClose.onclick = () => {
                modal.style.display = "none";
            };
        }
    }

    if (changelogBtn) {
        changelogBtn.onclick = () => {
            modal.style.display = "flex";
        };
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // Realtime Listener mula sa Firestore
    const changelogsRef = collection(db, "changelogs");

    onSnapshot(changelogsRef, (snapshot) => {
        const logs = [];
        snapshot.forEach((docSnap) => {
            logs.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        logs.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));

        renderChangelogUI(logs, feedContainer || modal.querySelector(".modal-content"));
    }, (error) => {
        console.warn("Could not fetch changelogs from Firestore:", error);
    });
});

// --- 3. UI RENDERING ---
function renderChangelogUI(logs, targetElem) {
    if (!targetElem) return;

    if (!logs || logs.length === 0) {
        targetElem.innerHTML = `
            <div style="text-align:center; padding:25px; color:#777;">
                <i class="fas fa-bullhorn" style="font-size:24px; margin-bottom:8px; color:#444;"></i>
                <p style="margin:0; font-size:13px;">No updates posted yet.</p>
            </div>
        `;
        return;
    }

    targetElem.innerHTML = logs.map(log => {
        const safeVer = sanitizeHTML(log.version || 'UPDATE');
        const safeTitle = sanitizeHTML(log.title || 'System Update');
        const safeDate = sanitizeHTML(log.date || '');
        
        const isWarning = safeVer.toUpperCase().includes("WARN");
        const badgeBg = isWarning ? "#ff9800" : "#e50914";

        let formattedNotes = "";
        if (Array.isArray(log.items) && log.items.length > 0) {
            formattedNotes = log.items.map(it => `• ${sanitizeHTML(it)}`).join("<br>");
        } else if (log.notes) {
            formattedNotes = sanitizeHTML(log.notes).replace(/\n/g, "<br>");
        }

        return `
            <div class="changelog-item-card" style="background:#202020; border:1px solid #2e2e2e; border-radius:8px; padding:14px; margin-bottom:10px; text-align:left;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="background:${badgeBg}; color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px;">${safeVer}</span>
                        <strong style="color:#fff; font-size:13px;">${safeTitle}</strong>
                    </div>
                    <span style="font-size:11px; color:#777;">${safeDate}</span>
                </div>
                <div style="font-size:12px; color:#bbb; line-height:1.6;">
                    ${formattedNotes}
                </div>
            </div>
        `;
    }).join('');
}