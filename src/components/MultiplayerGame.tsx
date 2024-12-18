import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMultiplayer } from "@/contexts/MultiplayerContext";
import { useProfile } from "@/contexts/ProfileContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MultiplayerGame() {
  const [guess, setGuess] = useState("");
  const { currentRoom, makeGuess } = useMultiplayer();
  const { user } = useProfile();

  if (!currentRoom || !user) return null;

  const handleSubmitGuess = () => {
    if (guess.length === currentRoom.room.digits) {
      makeGuess(guess);
      setGuess("");
    }
  };

  const getPlayerStatus = (playerId: string) => {
    const player = currentRoom.players.find(p => p.id === playerId);
    return player?.status || 'waiting';
  };

  const getPlayerLastGuess = (playerId: string) => {
    const player = currentRoom.players.find(p => p.id === playerId);
    return player?.last_guess || '';
  };

  const getPlayerFeedback = (playerId: string) => {
    const player = currentRoom.players.find(p => p.id === playerId);
    return player?.feedback || '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Game Progress
            <Badge variant="outline">
              {currentRoom.room.status === 'playing' ? 'Game in Progress' : 'Waiting to Start'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {currentRoom.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className={player.id === currentRoom.room.host_id ? "text-primary font-semibold" : ""}>
                      {player.nickname}
                    </span>
                    {player.id === currentRoom.room.host_id && (
                      <Badge variant="secondary">Host</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {getPlayerLastGuess(player.id) && (
                      <>
                        <span>Last Guess: {getPlayerLastGuess(player.id)}</span>
                        <Badge variant="outline">{getPlayerFeedback(player.id)}</Badge>
                      </>
                    )}
                    <Badge 
                      variant={getPlayerStatus(player.id) === 'playing' ? "default" : "secondary"}
                    >
                      {getPlayerStatus(player.id)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {currentRoom.room.status === 'playing' && (
        <Card>
          <CardHeader>
            <CardTitle>Make Your Guess</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder={`Enter ${currentRoom.room.digits} digits`}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                maxLength={currentRoom.room.digits}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmitGuess}
                disabled={guess.length !== currentRoom.room.digits}
              >
                Submit Guess
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}