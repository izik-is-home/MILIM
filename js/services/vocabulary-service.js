import { supabase } from '../supabase-client.js';
import { shuffle } from '../game/shuffle.js';

export async function getActiveVocabularyCount() {
  const { count, error } = await supabase
    .from('vocabulary_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) throw error;
  return count || 0;
}

export async function getRandomActiveVocabularyItems(count) {
  const { data: allActive, error: fetchError } = await supabase
    .from('vocabulary_items')
    .select('id, word, meaning')
    .eq('is_active', true);

  if (fetchError) throw fetchError;
  if (!allActive || allActive.length < count) {
    throw new Error('Not enough active words');
  }

  const shuffledItems = shuffle(allActive).slice(0, count);

  return shuffledItems;
}

export async function getAllVocabularyItems() {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createVocabularyItem(itemData) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .insert([itemData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVocabularyItem(id, itemData) {
  const { data, error } = await supabase
    .from('vocabulary_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
