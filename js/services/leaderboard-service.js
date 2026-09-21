import { supabase } from '../supabase-client.js';

export async function getLeaderboard(pairsCount, limit = 20) {
  const { data, error } = await supabase
    .from('game_scores')
    .select('display_name, duration_ms, created_at')
    .eq('game_type', 'memory')
    .eq('pairs_count', pairsCount)
    .order('duration_ms', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function submitScore({ gameType = 'memory', pairsCount, durationMs, displayName }) {
  const safeDurationMs = Math.max(1, Math.round(Number(durationMs) || 0));

  // Using the RPC function defined in the spec
  const { data, error } = await supabase.rpc('submit_game_score', {
    p_game_type: gameType,
    p_pairs_count: pairsCount,
    p_duration_ms: safeDurationMs,
    p_display_name: displayName
  });

  if (error) {
    console.error('RPC failed, falling back to direct insert if RLS allows (it should not in prod)', error);
    // Optional fallback for MVP if RPC wasn't created by user
    const { data: insertData, error: insertError } = await supabase
      .from('game_scores')
      .insert([{
        game_type: gameType,
        pairs_count: pairsCount,
        duration_ms: safeDurationMs,
        display_name: displayName
      }])
      .select()
      .single();
      
    if (insertError) throw insertError;
    return insertData.id;
  }
  
  return data;
}
