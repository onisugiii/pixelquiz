import { current } from './auth.js';

const LEGACY_KEY = 'pq_cards';
const key = () => 'pq_cards_' + (current.user ? current.user.id : 'guest');

export function getCards() {
  try {
    let raw = localStorage.getItem(key());
    if (raw === null) {
      // adopt cards made before accounts existed, once
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy !== null) {
        localStorage.setItem(key(), legacy);
        localStorage.removeItem(LEGACY_KEY);
        raw = legacy;
      }
    }
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

export function saveCards(cards) {
  localStorage.setItem(key(), JSON.stringify(cards));
}
