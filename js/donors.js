// ✅ js/donors.js - REALTIME FIRESTORE SYNC & CLIENT PROTECTION
import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Helper para iwas XSS injection mula sa user-submitted data
function sanitizeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Global cache ng donations para mabasa agad ng auth.js nang real-time
window.moviesJ_DonationsCache = [];

// --- 2. REALTIME FIRESTORE LISTENER ---
function initRealtimeDonors() {
    const donationsRef = collection(db, "donations");

    onSnapshot(donationsRef, (snapshot) => {
        let donorsList = [];
        snapshot.forEach((docSnap) => {
            donorsList.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // I-sort mula pinakabago pababa
        donorsList.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
        window.moviesJ_DonationsCache = donorsList;

        renderDonorsUI(donorsList);

        // I-trigger ang update sa profile kung naka-login na ang user
        if (typeof window.refreshUserVIPBadge === "function") {
            window.refreshUserVIPBadge();
        }
    }, (error) => {
        console.warn("Could not fetch donations from Firestore:", error);
    });
}

// --- 3. UI RENDERING ---
function renderDonorsUI(list) {
    const wallContainer = document.getElementById('donors-wall-container') || 
                          document.getElementById('supporters-container') || 
                          document.querySelector('.verified-supporters-grid') || 
                          document.querySelector('.supporters-grid');

    if (wallContainer) {
        if (!list || list.length === 0) {
            wallContainer.innerHTML = `<p style="color:#777; font-size:0.85rem; text-align:center; padding:15px; grid-column:1/-1;">Be the first verified supporter!</p>`;
        } else {
            wallContainer.innerHTML = list.map(d => {
                const safeName = sanitizeHTML(d.name || 'Supporter');
                const rawAmount = Number(d.amount ?? d.amountVal ?? 0);
                const safeAmount = rawAmount.toLocaleString();
                const safeMessage = sanitizeHTML(d.message || '');
                const safeDate = sanitizeHTML(d.date || '');

                return `
                    <div class="donor-item-card" style="background:#1e1e1e; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:8px;">
                        <div class="donor-item-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span class="donor-name" style="font-weight:700; color:#fff; font-size:13px;">
                                <i class="fas fa-heart" style="color:#e50914; font-size:11px; margin-right:4px;"></i>${safeName}
                            </span>
                            <span class="donor-amount" style="color:#4caf50; font-weight:bold; font-size:12px; background:rgba(76,175,80,0.15); padding:2px 8px; border-radius:4px;">₱${safeAmount}</span>
                        </div>
                        ${safeMessage ? `<p class="donor-message" style="font-size:12px; color:#bbb; margin:4px 0;">"${safeMessage}"</p>` : ''}
                        <span class="donor-date" style="font-size:10px; color:#666; display:block; text-align:right;">${safeDate}</span>
                    </div>
                `;
            }).join('');
        }
    }

    // 2. Render sa Navbar Badges (Top Donor & Latest Donor)
    const highlightContainer = document.getElementById('donor-nav-highlights');
    const topBadge = document.querySelector('.top-donor') || document.querySelector('.badge-top') || document.getElementById('top-donor-badge');
    const latestBadge = document.querySelector('.latest-donor') || document.querySelector('.badge-latest') || document.getElementById('latest-donor-badge');

    if (list && list.length > 0) {
        const topDonor = [...list].sort((a, b) => (Number(b.amount ?? b.amountVal ?? 0)) - (Number(a.amount ?? a.amountVal ?? 0)))[0];
        const latestDonor = list[0];

        const topName = sanitizeHTML(topDonor.name || 'Supporter');
        const topAmount = Number(topDonor.amount ?? topDonor.amountVal ?? 0).toLocaleString();
        const latestName = sanitizeHTML(latestDonor.name || 'Supporter');
        const latestAmount = Number(latestDonor.amount ?? latestDonor.amountVal ?? 0).toLocaleString();

        if (highlightContainer) {
            highlightContainer.innerHTML = `
                <div class="nav-donor-tag top-donor" onclick="document.getElementById('supportBtn')?.click()" style="cursor:pointer;" title="Top Supporter: ${topName} (₱${topAmount})">
                    <i class="fas fa-crown" style="color:#ffd700;"></i> <span>Top: <strong>${topName}</strong> (₱${topAmount})</span>
                </div>
                <div class="nav-donor-tag latest-donor" onclick="document.getElementById('supportBtn')?.click()" style="cursor:pointer;" title="Latest Supporter: ${latestName} (₱${latestAmount})">
                    <i class="fas fa-sparkles" style="color:#e50914;"></i> <span>Latest: <strong>${latestName}</strong> (₱${latestAmount})</span>
                </div>
            `;
        } else {
            if (topBadge) {
                topBadge.innerHTML = `<i class="fas fa-crown" style="color:#ffd700;"></i> Top: <strong>${topName}</strong> (₱${topAmount})`;
                topBadge.style.display = "inline-flex";
            }
            if (latestBadge) {
                latestBadge.innerHTML = `<i class="fas fa-heart" style="color:#e50914;"></i> Latest: <strong>${latestName}</strong> (₱${latestAmount})`;
                latestBadge.style.display = "inline-flex";
            }
        }
    }
}

// --- 4. UTILITY FUNCTIONS ---
window.copyDonationEmail = function() {
    const email = "jayjovendinawanao29@gmail.com";
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => {
            updateCopyButtonState(email);
        }).catch(() => {
            promptFallback(email);
        });
    } else {
        promptFallback(email);
    }
};

function updateCopyButtonState(email) {
    const btn = document.getElementById('copyProofEmailBtn');
    if (btn) {
        const originalHTML = btn.innerHTML;
        const originalBG = btn.style.background;

        btn.innerHTML = `<i class="fas fa-check"></i> Email Copied: ${email}`;
        btn.style.background = "#4CAF50";

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = originalBG || "#e50914";
        }, 3000);
    }
}

function promptFallback(email) {
    prompt("Copy this email to send your proof:", email);
}

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initRealtimeDonors();

    const copyBtn = document.getElementById('copyProofEmailBtn');
    if (copyBtn) {
        copyBtn.onclick = window.copyDonationEmail;
    }
});