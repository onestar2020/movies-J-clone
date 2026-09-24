// js/rewards.js

export const RANK_TIERS = {
  FREE: {
    id: "free",
    label: "Free Member",
    badgeClass: "role-free",
    icon: "",
    minDonation: 0
  },
  VIP: {
    id: "vip",
    label: "VIP SUPPORTER",
    badgeClass: "role-vip",
    icon: "fa-star",
    minDonation: 1
  },
  TOP_DONOR: {
    id: "top-donor",
    label: "TOP DONOR",
    badgeClass: "role-top-donor",
    icon: "fa-crown",
    minDonation: 1000
  },
  LEGENDARY: {
    id: "legendary",
    label: "LEGENDARY BACKER",
    badgeClass: "role-legendary",
    icon: "fa-gem",
    minDonation: 2500
  }
};

export const AVATAR_BORDERS = [
  { id: "none", label: "Default / Clean", class: "", requiredTier: "free" },
  { id: "emerald", label: "⭐ Emerald Supporter", class: "avatar-border-vip", requiredTier: "vip" },
  { id: "cyber", label: "⚡ Cyberpunk Neon Blue", class: "avatar-border-cyber", requiredTier: "vip" },
  { id: "fire", label: "🔥 Crimson Ember", class: "avatar-border-fire", requiredTier: "vip" },
  { id: "gold", label: "👑 Top Gold Crown", class: "avatar-border-gold", requiredTier: "top-donor" },
  { id: "amethyst", label: "💎 Royal Amethyst", class: "avatar-border-amethyst", requiredTier: "top-donor" },
  { id: "rainbow", label: "🌈 Cosmic RGB Pulse", class: "avatar-border-rainbow", requiredTier: "legendary" }
];

export const NAME_GLOWS = [
  { id: "none", label: "Default White", class: "", requiredTier: "free" },
  { id: "emerald", label: "💚 Emerald Glow", class: "name-glow-emerald", requiredTier: "vip" },
  { id: "blue", label: "⚡ Cyan Plasma", class: "name-glow-blue", requiredTier: "vip" },
  { id: "red", label: "🔥 Fire Crimson", class: "name-glow-red", requiredTier: "vip" },
  { id: "gold", label: "✨ Shiny Gold", class: "name-glow-gold", requiredTier: "top-donor" },
  { id: "purple", label: "🔮 Mystic Purple", class: "name-glow-purple", requiredTier: "top-donor" },
  { id: "rgb", label: "🌈 Rainbow Aurora", class: "name-glow-rgb", requiredTier: "legendary" }
];

export function getUserTier(totalDonated = 0, isTopDonor = false) {
  if (totalDonated >= RANK_TIERS.LEGENDARY.minDonation) return RANK_TIERS.LEGENDARY;
  if (isTopDonor || totalDonated >= RANK_TIERS.TOP_DONOR.minDonation) return RANK_TIERS.TOP_DONOR;
  if (totalDonated >= RANK_TIERS.VIP.minDonation) return RANK_TIERS.VIP;
  return RANK_TIERS.FREE;
}

export function canAccessCosmetic(itemTierId, userTierId) {
  const tierWeights = { "free": 0, "vip": 1, "top-donor": 2, "legendary": 3 };
  return (tierWeights[userTierId] || 0) >= (tierWeights[itemTierId] || 0);
}