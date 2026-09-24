// js/comments.js
import { auth, db } from "./firebase-config.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const DEDICATED_ADMIN_EMAIL = "jayjovendinawanao2020@gmail.com";

const BORDER_CLASSES = {
  emerald: "avatar-border-vip",
  cyber: "avatar-border-cyber",
  fire: "avatar-border-fire",
  gold: "avatar-border-gold",
  amethyst: "avatar-border-amethyst",
  rainbow: "avatar-border-rainbow"
};

const GLOW_CLASSES = {
  emerald: "name-glow-emerald",
  blue: "name-glow-blue",
  red: "name-glow-red",
  gold: "name-glow-gold",
  purple: "name-glow-purple",
  rgb: "name-glow-rgb"
};

function getRoleBadge(role) {
  switch (role) {
    case "admin":
      return `<span class="user-role role-admin" style="font-size:9px; padding:2px 6px; margin-left:5px;"><i class="fas fa-shield-alt"></i> Admin</span>`;
    case "legendary":
      return `<span class="user-role role-legendary" style="font-size:9px; padding:2px 6px; margin-left:5px;"><i class="fas fa-gem"></i> LEGENDARY</span>`;
    case "top-donor":
      return `<span class="user-role role-top-donor" style="font-size:9px; padding:2px 6px; margin-left:5px;"><i class="fas fa-crown"></i> TOP DONOR</span>`;
    case "vip":
      return `<span class="user-role role-vip" style="font-size:9px; padding:2px 6px; margin-left:5px;"><i class="fas fa-star"></i> VIP</span>`;
    default:
      return "";
  }
}

function timeAgo(date) {
  if (!date) return "Just now";
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function initMovieComments(mediaId, mediaTitle, mediaType = "movie") {
  const commentInput = document.getElementById("comment-input") || document.getElementById("comment-text");
  const postBtn = document.getElementById("post-comment-btn") || document.getElementById("submit-comment");
  const commentsContainer = document.getElementById("comments-list-container") || document.getElementById("commentsList");

  if (!commentsContainer) return;

  const commentsRef = collection(db, "comments");
  const q = query(commentsRef, where("mediaId", "==", String(mediaId)));

  onSnapshot(q, async (snapshot) => {
    let comments = [];
    snapshot.forEach((docSnap) => {
      comments.push({ id: docSnap.id, ...docSnap.data() });
    });

    comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (comments.length === 0) {
      commentsContainer.innerHTML = `<p style="color:#777; font-size:13px; text-align:center; padding:20px;">No reviews yet. Be the first to leave a comment!</p>`;
      return;
    }

    commentsContainer.innerHTML = comments.map(c => {
      const isOwner = auth.currentUser && (auth.currentUser.uid === c.userId || auth.currentUser.email === DEDICATED_ADMIN_EMAIL);
      const postDate = c.createdAt ? new Date(c.createdAt.seconds * 1000) : (c.timestamp ? new Date(c.timestamp) : null);
      
      const borderClass = BORDER_CLASSES[c.avatarBorder] || "";
      const glowClass = GLOW_CLASSES[c.nameGlow] || "";
      const roleBadge = getRoleBadge(c.role);

      return `
        <div class="comment-card" style="background:#181818; border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${c.userPhoto || 'images/logo-192.png'}" class="${borderClass}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; background:#111;" alt="Avatar" />
              <div>
                <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                  <strong class="${glowClass}" style="font-size:13px; font-weight:700;">${c.userName || 'User'}</strong>
                  ${roleBadge}
                  <span style="font-size:10px; color:#777; margin-left:4px;">${timeAgo(postDate)}</span>
                </div>
              </div>
            </div>
            ${isOwner ? `
              <button class="delete-comment-btn" data-id="${c.id}" style="background:transparent; border:none; color:#666; cursor:pointer; font-size:12px; padding:4px;" title="Delete Comment">
                <i class="fas fa-trash"></i>
              </button>
            ` : ''}
          </div>
          <p style="color:#ddd; font-size:13px; margin-top:8px; line-height:1.4; word-break:break-word;">${escapeHTML(c.text)}</p>
        </div>
      `;
    }).join("");

    commentsContainer.querySelectorAll(".delete-comment-btn").forEach(btn => {
      btn.onclick = async () => {
        const cId = btn.dataset.id;
        if (confirm("Delete this comment?")) {
          try {
            await deleteDoc(doc(db, "comments", cId));
          } catch (e) {
            console.error("Error deleting comment:", e);
          }
        }
      };
    });
  });

  if (postBtn && commentInput) {
    postBtn.onclick = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Please sign in first to post a review or comment.");
        document.getElementById("nav-login-btn")?.click();
        return;
      }

      const text = commentInput.value.trim();
      if (!text) return;

      postBtn.disabled = true;
      postBtn.textContent = "Posting...";

      try {
        let userRole = "free";
        let avatarBorder = "none";
        let nameGlow = "none";
        let userPhoto = user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName || user.uid}`;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const uData = userDoc.data();
          userRole = user.email === DEDICATED_ADMIN_EMAIL ? "admin" : (uData.role || "free");
          avatarBorder = uData.avatarBorder || "none";
          nameGlow = uData.nameGlow || "none";
          userPhoto = uData.photoURL || userPhoto;
        }

        await addDoc(collection(db, "comments"), {
          mediaId: String(mediaId),
          mediaTitle: mediaTitle || "Untitled",
          mediaType: mediaType,
          userId: user.uid,
          userName: user.displayName || "User",
          userEmail: user.email || "",
          userPhoto: userPhoto,
          role: userRole,
          avatarBorder: avatarBorder,
          nameGlow: nameGlow,
          text: text,
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        });

        commentInput.value = "";
      } catch (err) {
        console.error("Comment post error:", err);
        alert("Failed to post comment.");
      } finally {
        postBtn.disabled = false;
        postBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Post Comment`;
      }
    };
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}