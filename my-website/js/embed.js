// ✅ js/embed.js - UPDATED API LINKS

function generateEmbedURL(server, item, season = 1, episode = 1) {
  const id = item.id;
  // Mas reliable na paraan para malaman kung TV show
  const isTV = item.media_type === "tv" || item.first_air_date; 

  switch (server) {
    case "autoembed":
      return isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`;

    case "vidsrc.net":
      return isTV
        ? `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://vidsrc.net/embed/movie?tmdb=${id}`;

    case "superembed":
      return isTV
        ? `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`;

    default:
      return isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`;
  }
}