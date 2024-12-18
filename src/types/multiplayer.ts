export type GameRoom = {
  id: string;
  name: string;
  host_id: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  current_number?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  digits: number;
  created_at: string;
}

export type Player = {
  id: string;
  nickname: string;
  room_id: string;
  score: number;
  status: 'ready' | 'playing' | 'finished';
  last_guess?: string;
  last_feedback?: string;
}

export type GameState = {
  room: GameRoom;
  players: Player[];
  currentRound: number;
  maxRounds: number;
}