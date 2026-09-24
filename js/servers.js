/**
 * Movies-J - Stream Servers Configuration (Protected & Encoded Version)
 * Active: Server 1 (Vidstorm), Server 2 (CineSRC), Server 3 (2Embed), Server 4 (ZXCStream)
 * Security: Anti-F12, Anti-Inspect, Debugger Loop, Base64 Encoded Stream URLs
 */

// ================= 1. ANTI-DEVTOOLS & INSPECT PROTECTION =================
(function() {
  // Disable Right Click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Disable DevTools Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
      (e.ctrlKey && ['U', 'u', 'S', 's'].includes(e.key))
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Anti-Debugger Trap Loop (Freezes on Console Open)
  setInterval(() => {
    const startTime = performance.now();
    debugger;
    if (performance.now() - startTime > 100) {
      window.location.href = "about:blank";
    }
  }, 500);
})();

// ================= 2. ENCODED SERVER CONFIGURATION =================
const _d = (str) => atob(str);

const STREAM_SERVERS = {
  // Server 1 - Vidstorm
  vidstorm: {
    id: "vidstorm",
    name: "Server 1",
    type: "iframe",
    enabled: true,
    movie: (imdbId) => `${_d('aHR0cHM6Ly92aWRzdG9ybS5ydS9tb3ZpZS8=')}${imdbId}?autoplay=true&theme=7c5cff&download=false&lang=en`,
    tv: (imdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly92aWRzdG9ybS5ydS90di8=')}${imdbId}/${s}/${e}?autoplay=true&theme=7c5cff&download=false&lang=en`
  },

  // Server 2 - CineSRC
  cinesrc: {
    id: "cinesrc",
    name: "Server 2",
    type: "iframe",
    enabled: true,
    movie: (tmdbId) => `${_d('aHR0cHM6Ly9jaW5lc3JjLnN0L2VtYmVkL21vdmllLw==')}${tmdbId}`,
    tv: (tmdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly9jaW5lc3JjLnN0L2VtYmVkL3R2Lw==')}${tmdbId}?s=${s}&e=${e}`
  },

  // Server 3 - 2Embed
  twoembed: {
    id: "twoembed",
    name: "Server 3",
    type: "iframe",
    enabled: true,
    movie: (tmdbId) => `${_d('aHR0cHM6Ly93d3cuMmVtYmVkLnNraW4vZW1iZWQv')}${tmdbId}`,
    tv: (tmdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly93d3cuMmVtYmVkLnNraW4vZW1iZWR0di8=')}${tmdbId}&s=${s}&e=${e}`
  },

  // Server 4 - ZXCStream
  zxcstream: {
    id: "zxcstream",
    name: "Server 4",
    type: "iframe",
    enabled: true,
    movie: (tmdbId) => `${_d('aHR0cHM6Ly9wbGF5ZXIuenhjc3RyZWFtLnh5ei9wbGF5ZXIvbW92aWUv')}${tmdbId}`,
    tv: (tmdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly9wbGF5ZXIuenhjc3RyZWFtLnh5ei9wbGF5ZXIvdHYv')}${tmdbId}/${s}/${e}`
  },

  // Hidden / Disabled Servers
  cloudorchestra: {
    id: "cloudorchestra",
    name: "Server (Nova)",
    type: "iframe",
    enabled: false,
    movie: (tmdbId) => `${_d('aHR0cHM6Ly9jbG91ZG9yY2hlc3RyYW5vdmEuY29tL2VtYmVkL21vdmllLw==')}${tmdbId}`,
    tv: (tmdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly9jbG91ZG9yY2hlc3RyYW5vdmEuY29tL2VtYmVkL3R2Lw==')}${tmdbId}/${s}/${e}`
  },
  vidlink: {
    id: "vidlink",
    name: "Server (VidLink)",
    type: "iframe",
    enabled: false,
    movie: (tmdbId) => `${_d('aHR0cHM6Ly92aWRsaW5rLnByby9tb3ZpZS8=')}${tmdbId}?autoplay=true`,
    tv: (tmdbId, s = 1, e = 1) => `${_d('aHR0cHM6Ly92aWRsaW5rLnByby90di8=')}${tmdbId}/${s}/${e}?autoplay=true`
  },
  yastream: {
    id: "yastream",
    name: "Server (KKPhim)",
    type: "api_addon",
    enabled: false,
    endpoint: "https://yastream.tamthai.de/eyJjYXRhbG9ncyI6WyJpZHJhbWEuc2VyaWVzLmlEcmFtYSIsImlkcmFtYS5zZXJpZXMuU2VhcmNoIiwia2lzc2toLnNlcmllcy5DaGluZXNlIiwia2lzc2toLnNlcmllcy5Lb3JlYW4iLCJraXNza2guc2VyaWVzLkphcGFuZXNlIiwia2lzc2toLnNlcmllcy5Ib25na29uZyIsImtpc3NraC5zZXJpZXMuVGhhaSIsImtpc3NraC5zZXJpZXMuVVMiLCJraXNza2guc2VyaWVzLlRhaXdhbmVzZSIsImtpc3NraC5zZXJpZXMuUGhpbGlwcGluZSIsImtpc3NraC5zZXJpZXMuU2VhcmNoIiwia2lzc2toLm1vdmllLkNoaW5lc2UiLCJraXNza2gubW92aWUuS29yZWFuIiwia2lzc2toLm1vdmllLkphcGFuZXNlIiwia2lzc2toLm1vdmllLkhvbmdrb25nIiwia2lzc2toLm1vdmllLlRoYWkiLCJraXNza2gubW92aWUuVVMiLCJraXNza2gubW92aWUuVGFpd2FuZXNlIiwia2lzc2toLm1vdmllLlBoaWxpcHBpbmUiLCJraXNza2gubW92aWUuU2VhcmNoIiwib25ldG91Y2h0di5zZXJpZXMuUG9wdWxhciIsIm9uZXRvdWNodHYuc2VyaWVzLkNoaW5lc2UiLCJvbmV0b3VjaHR2LnNlcmllcy5Lb3JlYW4iLCJvbmV0b3VjaHR2LnNlcmllcy5UaGFpIiwib25ldG91Y2h0di5zZXJpZXMuU2VhcmNoIiwib25ldG91Y2h0di5tb3ZpZS5Qb3B1bGFyIiwib25ldG91Y2h0di5tb3ZpZS5DaGluZXNlIiwib25ldG91Y2h0di5tb3ZpZS5Lb3JlYW4iLCJvbmV0b3VjaHR2Lm1vdmllLlRoYWkiLCJvbmV0b3VjaHR2Lm1vdmllLlNlYXJjaCJdLCJjYXRhbG9nIjpbImtpc3NraCIsIm9uZXRvdWNodHYiLCJpZHJhbWEiXSwic3RyZWFtIjpbImtpc3NraCIsIm9uZXRvdWNodHYiLCJta3ZkcmFtYSIsImlkcmFtYSIsImtrcGhpbSIsIm9waGltIl0sIm5zZnciOmZhbHNlLCJpbmZvIjpmYWxzZSwicG9zdGVyIjoicnBkYiIsIm1mcFVybCI6IiIsInRiS2V5IjoiIiwibWZwUGFzcyI6IiIsImVtYWlsIjoiIiwiaXAiOiIifQ",
    getStreamUrl: (imdbId, type = "movie", s = 1, e = 1) => {
      const idStr = type === "movie" ? imdbId : `${imdbId}:${s}:${e}`;
      return `${STREAM_SERVERS.yastream.endpoint}/stream/${type}/${idStr}.json`;
    }
  }
};

// ================= 3. GET EMBED URL DISPATCHER =================
function getEmbedUrl(serverKey, mediaData, type = "movie", s = 1, e = 1) {
  const server = STREAM_SERVERS[serverKey];
  if (!server) return "";

  if (server.id === "vidstorm") {
    const id = mediaData.imdb_id || mediaData.id;
    return type === "tv" ? server.tv(id, s, e) : server.movie(id);
  }

  const id = mediaData.tmdb_id || mediaData.id;
  return type === "tv" ? server.tv(id, s, e) : server.movie(id);
}