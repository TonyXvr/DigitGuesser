import React, { createContext, useContext, useEffect, useState } from 'react';
import { GameRoom, GameState, Player } from '@/types/multiplayer';
import {
  createGameRoom,
  joinGameRoom,
  leaveGameRoom,
  updatePlayerStatus,
  updateGameRoomStatus,
  subscribeToGameRoom,
  getAvailableRooms,
  getRoomDetails,
} from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useProfile } from './ProfileContext';

interface MultiplayerContextType {
  availableRooms: GameRoom[];
  currentRoom: GameState | null;
  isHost: boolean;
  createRoom: (name: string, maxPlayers: number, difficulty: 'easy' | 'medium' | 'hard', digits: number) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  makeGuess: (guess: string) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameState | null>(null);
  const { profile } = useProfile();
  const { toast } = useToast();

  const refreshRooms = async () => {
    try {
      const rooms = await getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error: any) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch available rooms. Please make sure you have proper database access.',
        variant: 'destructive',
      });
    }
  };

  const createRoom = async (
    name: string,
    maxPlayers: number,
    difficulty: 'easy' | 'medium' | 'hard',
    digits: number
  ) => {
    if (!profile) return;
    try {
      const room = await createGameRoom(profile.id, name, maxPlayers, difficulty, digits);
      const player = await joinGameRoom(room.id, profile.id, profile.nickname);
      setCurrentRoom({
        room,
        players: [player],
        currentRound: 1,
        maxRounds: 10,
      });
      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game room',
        variant: 'destructive',
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!profile) return;
    try {
      const roomDetails = await getRoomDetails(roomId);
      const player = await joinGameRoom(roomId, profile.id, profile.nickname);
      setCurrentRoom({
        room: roomDetails,
        players: [...roomDetails.players, player],
        currentRound: 1,
        maxRounds: 10,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join game room',
        variant: 'destructive',
      });
    }
  };

  const leaveRoom = async () => {
    if (!profile || !currentRoom) return;
    try {
      await leaveGameRoom(currentRoom.room.id, profile.id);
      setCurrentRoom(null);
    } catch (error) {
      console.error('Error leaving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave game room',
        variant: 'destructive',
      });
    }
  };

  const startGame = async () => {
    if (!currentRoom || !profile || currentRoom.room.host_id !== profile.id) return;
    try {
      const number = Math.floor(Math.random() * Math.pow(10, currentRoom.room.digits)).toString().padStart(currentRoom.room.digits, '0');
      await updateGameRoomStatus(currentRoom.room.id, 'playing', number);
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Error',
        description: 'Failed to start the game',
        variant: 'destructive',
      });
    }
  };

  const makeGuess = async (guess: string) => {
    if (!currentRoom || !profile) return;
    try {
      const feedback = generateFeedback(guess, currentRoom.room.current_number || '');
      await updatePlayerStatus(currentRoom.room.id, profile.id, 'playing', guess, feedback);
    } catch (error) {
      console.error('Error making guess:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit guess',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!currentRoom) return;

    const subscription = subscribeToGameRoom(currentRoom.room.id, (payload) => {
      getRoomDetails(currentRoom.room.id).then((updatedRoom) => {
        setCurrentRoom((prev) => ({
          ...prev!,
          room: updatedRoom,
          players: updatedRoom.players,
        }));
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentRoom]);

  useEffect(() => {
    refreshRooms();
    const interval = setInterval(refreshRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const isHost = Boolean(currentRoom?.room.host_id === profile?.id);

  return (
    <MultiplayerContext.Provider
      value={{
        availableRooms,
        currentRoom,
        isHost,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        makeGuess,
        refreshRooms,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
}

function generateFeedback(guess: string, actual: string): string {
  let bulls = 0;
  let cows = 0;
  const guessArray = guess.split('');
  const actualArray = actual.split('');

  // Count bulls
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] === actualArray[i]) {
      bulls++;
      guessArray[i] = 'X';
      actualArray[i] = 'Y';
    }
  }

  // Count cows
  for (let i = 0; i < guessArray.length; i++) {
    if (guessArray[i] !== 'X') {
      const index = actualArray.indexOf(guessArray[i]);
      if (index !== -1) {
        cows++;
        actualArray[index] = 'Y';
      }
    }
  }

  return `${bulls}B${cows}C`;
}