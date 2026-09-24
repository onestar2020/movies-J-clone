/* ============================================================
   MOVIES-J DAILY STREAK ENGINE
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    initStreakCounter();
});

// Watch Streak Counter (Araw-araw na login tracker)
function initStreakCounter() {
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem("moviesj_last_visit");
    let streak = parseInt(localStorage.getItem("moviesj_streak") || "1");

    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak += 1;
            localStorage.setItem("moviesj_streak", streak.toString());
        } else if (diffDays > 1) {
            streak = 1;
            localStorage.setItem("moviesj_streak", "1");
        }
    } else {
        localStorage.setItem("moviesj_streak", "1");
    }
    localStorage.setItem("moviesj_last_visit", today);
}