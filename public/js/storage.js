import { supabase } from './supabase.js';
import { current } from './auth.js';

let cache = null;
let cacheUser = null;
let migratedFor = null;

const validCache = () => cache !== null && current.user && cacheUser === current.user.id;

// Upload cards that were saved on this device before cloud saving existed
async function migrateLocal() {
  const keys = ['pq_cards_' + current.user.id, 'pq_cards'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    let list = [];
    try { list = JSON.parse(raw); } catch { list = []; }
    list = list.filter((c) => c && c.q && c.a);

    if (list.length) {
      const { error } = await supabase
        .from('flashcards')
        .insert(list.map((c) => ({ q: c.q, a: c.a })));
      if (error) return; // keep the local copy and try again next time
    }
    localStorage.removeItem(key);
  }
}

export async function getCards() {
  if (!current.user) return [];
  if (validCache()) return cache;

  if (migratedFor !== current.user.id) {
    migratedFor = current.user.id;
    await migrateLocal();
  }

  const { data, error } = await supabase
    .from('flashcards')
    .select('id, q, a')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Could not load flashcards:', error.message);
    return [];
  }

  cache = data;
  cacheUser = current.user.id;
  return cache;
}

export async function addCard(q, a) {
  await getCards();
  const { data, error } = await supabase
    .from('flashcards')
    .insert({ q, a })
    .select('id, q, a')
    .single();
  if (!error && validCache()) cache.push(data);
  return { data, error };
}

export async function deleteCard(id) {
  const { error } = await supabase.from('flashcards').delete().eq('id', id);
  if (!error && validCache()) cache = cache.filter((c) => c.id !== id);
  return { error };
}

export async function deleteAllCards() {
  const { error } = await supabase.from('flashcards').delete().eq('user_id', current.user.id);
  if (!error && validCache()) cache = [];
  return { error };
}
