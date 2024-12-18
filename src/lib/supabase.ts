import { createClient } from '@supabase/supabase-js'
import { GameRoom, Player } from '@/types/multiplayer'

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

// Existing functions...
export async function createProfile(userId: string, nickname: string) {
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

// New multiplayer functions
export async function createGameRoom(
  hostId: string,
  name: string,
  maxPlayers: number,
  difficulty: 'easy' | 'medium' | 'hard',
  digits: number
): Promise<GameRoom> {
  const { data, error } = await supabase
    .from('game_rooms')
    .insert([{
      host_id: hostId,
      name,
      max_players: maxPlayers,
      status: 'waiting',
      difficulty,
      digits
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinGameRoom(
  roomId: string,
  playerId: string,
  nickname: string
): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .insert([{
      id: playerId,
      room_id: roomId,
      nickname,
      score: 0,
      status: 'ready'
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function leaveGameRoom(
  roomId: string,
  playerId: string
) {
  const { error } = await supabase
    .from('players')
    .delete()
    .match({ room_id: roomId, id: playerId })

  if (error) throw error
}

export async function updatePlayerStatus(
  roomId: string,
  playerId: string,
  status: Player['status'],
  guess?: string,
  feedback?: string
) {
  const { error } = await supabase
    .from('players')
    .update({
      status,
      last_guess: guess,
      last_feedback: feedback
    })
    .match({ room_id: roomId, id: playerId })

  if (error) throw error
}

export async function updateGameRoomStatus(
  roomId: string,
  status: GameRoom['status'],
  currentNumber?: string
) {
  const { error } = await supabase
    .from('game_rooms')
    .update({
      status,
      current_number: currentNumber
    })
    .match({ id: roomId })

  if (error) throw error
}

export function subscribeToGameRoom(roomId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`
      },
      callback
    )
    .subscribe()
}

export async function getAvailableRooms() {
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*, players(*)')
    .eq('status', 'waiting')

  if (error) throw error
  return data.filter(room => room.players.length < room.max_players)
}

export async function getRoomDetails(roomId: string) {
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*, players(*)')
    .eq('id', roomId)
    .single()

  if (error) throw error
  return data
}