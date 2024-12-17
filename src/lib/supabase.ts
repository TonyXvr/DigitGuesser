import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Profile = {
  id: string
  nickname: string
  created_at: string
}

export type GameResult = {
  id: string
  profile_id: string
  score: number
  difficulty: string
  digits: number
  created_at: string
}

export type LeaderboardEntry = {
  nickname: string
  score: number
  difficulty: string
  digits: number
  created_at: string
}

export async function createProfile(userId: string, nickname: string) {
  // First check if nickname is already taken
  const { data: existingNickname } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('nickname', nickname)
    .single()

  if (existingNickname) {
    throw new Error('Nickname already taken')
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, nickname }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function saveGameResult(
  profile_id: string,
  score: number,
  difficulty: string,
  digits: number
) {
  const { data, error } = await supabase
    .from('game_results')
    .insert([{ profile_id, score, difficulty, digits }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getLeaderboard(
  difficulty?: string,
  digits?: number,
  limit = 10
) {
  let query = supabase
    .from('game_results')
    .select(`
      score,
      difficulty,
      digits,
      created_at,
      profiles (
        nickname
      )
    `)
    .order('score', { ascending: false })
    .limit(limit)

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }
  if (digits) {
    query = query.eq('digits', digits)
  }

  const { data, error } = await query

  if (error) throw error
  return data.map(entry => ({
    nickname: entry.profiles.nickname,
    score: entry.score,
    difficulty: entry.difficulty,
    digits: entry.digits,
    created_at: entry.created_at
  }))
}

export async function getProfileStats(profile_id: string) {
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('profile_id', profile_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}