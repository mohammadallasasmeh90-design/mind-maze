export type PlayerState = {
  level: number;
  xp: number;
  coins: number;
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
  accuracy: number;
  dailyCompleted: boolean;
  dailyDate: string;
  streak: number;
  achievements: string[];
  language: "en" | "ar";
  sound: boolean;
  reducedMotion: boolean;
  consent: boolean;
};

const fallback: PlayerState = { level: 3, xp: 420, coins: 860, bestScore: 4280, bestStreak: 7, gamesPlayed: 28, accuracy: 87, dailyCompleted: false, dailyDate: "", streak: 4, achievements: ["first-game", "seven-day"], language: "en", sound: true, reducedMotion: false, consent: true };
const KEY = "mind-maze-player-v1";

export function loadPlayer(): PlayerState {
  try { return { ...fallback, ...(JSON.parse(localStorage.getItem(KEY) || "null") || {}) }; } catch { return fallback; }
}
export function savePlayer(state: PlayerState) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* offline fallback */ } }
export function todayKey() { return new Date().toISOString().slice(0, 10); }

export type AnalyticsProvider = { track: (event: string, data?: Record<string, unknown>) => void };
export const analytics: AnalyticsProvider = { track: (event, data) => { if (import.meta.env.DEV) console.info(`[analytics] ${event}`, data || ""); } };

export const monetizationConfig = {
  rewardedCoins: 100,
  interstitialMinGames: 3,
  maxSessionAds: 2,
  products: { removeAds: "PRODUCT_REMOVE_ADS", premium: "PRODUCT_PREMIUM", coinsSmall: "PRODUCT_COINS_SMALL" },
};
