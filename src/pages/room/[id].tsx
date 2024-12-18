import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { MultiplayerGame } from '@/components/MultiplayerGame';
import { useMultiplayer } from '@/contexts/MultiplayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/contexts/ProfileContext';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const { currentRoom, joinRoom, leaveRoom } = useMultiplayer();
  const { user } = useProfile();

  useEffect(() => {
    if (id && typeof id === 'string' && !currentRoom) {
      joinRoom(id);
    }
  }, [id, joinRoom, currentRoom]);

  const handleLeaveRoom = async () => {
    await leaveRoom();
    router.push('/multiplayer');
  };

  if (!currentRoom || !user) {
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
            
            {currentRoom.room.host_id === user.id && currentRoom.room.status === 'waiting' && (
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