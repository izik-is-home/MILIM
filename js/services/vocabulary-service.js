import { supabase } from '../supabase-client.js';

export async function getActiveVocabularyCount() {
  const { count, error } = await supabase
    .from('vocabulary_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (error) throw error;
  return count || 0;
}

export async function getRandomActiveVocabularyItems(count) {
  // Using PostgREST extension random ordering via RPC or limit if RPC not available.
  // In MVP, we might pull all active items and shuffle if the list is small, 
  // but standard practice is to rely on RPC for large datasets.
  // Since we might not have RPC get_random_vocabulary_items implemented by user yet,
  // we fetch all active IDs, pick N, then fetch those rows.
  
  const { data: allActive, error: fetchError } = await supabase
    .from('vocabulary_items')
    .select('id')
    .eq('is_active', true);

  if (fetchError) throw fetchError;
  if (!allActive || allActive.length < count) {
    throw new Error('Not enough active words');
  }

  // Shuffle and pick N
  const shuffledIds = [...allActive].sort(() => Math.random() - 0.5).slice(0, count).map(x => x.id);

  const { data: selectedItems, error: itemsError } = await supabase
    .from('vocabulary_items')
    .select('id, word, meaning')
    .in('id', shuffledIds);

  if (itemsError) throw itemsError;
  return selectedItems;
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
