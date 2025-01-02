import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MultiplayerGame } from '@/components/MultiplayerGame';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/contexts/ProfileContext';
import { NicknameDialog } from '@/components/NicknameDialog';
import { useToast } from '@/components/ui/use-toast';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentRoom, joinRoom, leaveRoom } = useMultiplayer();
  const { nickname } = useProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeRoom = async () => {
      if (!id || typeof id !== 'string') return;
      
      if (!nickname) {
        setShowNicknameDialog(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await joinRoom(id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to join the room. Please try again.",
          variant: "destructive",
        });
        router.push('/multiplayer');
      } finally {
        setIsLoading(false);
      }
    };

    // Set a timeout for the loading state
    timeoutId = setTimeout(() => {
      if (isLoading) {
        toast({
          title: "Connection timeout",
          description: "Failed to connect to the room. Please try again.",
          variant: "destructive",
        });
        router.push('/multiplayer');
      }
    }, 15000); // 15 seconds timeout

    initializeRoom();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [id, nickname, joinRoom]);

  const handleNicknameSubmit = async (nickname: string) => {
    setShowNicknameDialog(false);
    if (id && typeof id === 'string') {
      try {
        await joinRoom(id);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to join the room. Please try again.",
          variant: "destructive",
        });
        router.push('/multiplayer');
      }
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    router.push('/multiplayer');
  };

  if (showNicknameDialog) {
    return <NicknameDialog isOpen={true} onSubmit={handleNicknameSubmit} />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we connect you to the game room</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Room not found</CardTitle>
            <CardDescription>This room might no longer exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/multiplayer')}>
              Back to Rooms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Room: {currentRoom.room.name}</CardTitle>
            <CardDescription>
              {currentRoom.players.length} / {currentRoom.room.max_players} players
            </CardDescription>
          </div>
          <Button 
            variant="outline"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Players:</h3>
                <ul className="space-y-2">
                  {currentRoom.players.map((player) => (
                    <li key={player.id} className="flex items-center gap-2">
                      <span className={player.id === currentRoom.room.host_id ? "text-primary" : ""}>
                        {player.nickname} {player.id === currentRoom.room.host_id && "(Host)"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Game Settings:</h3>
                <p>Difficulty: {currentRoom.room.difficulty}</p>
                <p>Digits: {currentRoom.room.digits}</p>
                <p>Max Players: {currentRoom.room.max_players}</p>
                <p>Status: {currentRoom.room.status}</p>
              </div>
            </div>
            
            {currentRoom.room.host_id === nickname && currentRoom.room.status === 'waiting' && (
              <Button 
                className="w-full"
                variant="default"
                disabled={currentRoom.players.length < 2}
                onClick={() => currentRoom.startGame()}
              >
                Start Game
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {currentRoom.room.status === 'playing' && (
        <MultiplayerGame />
      )}
    </div>
  );
}