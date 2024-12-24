import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useMultiplayer } from "@/contexts/MultiplayerContext"
import { useProfile } from "@/contexts/ProfileContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MultiplayerGame } from "@/components/MultiplayerGame"
import { useRouter } from 'next/router'
import Header from "@/components/Header"

export default function MultiplayerPage() {
  const [roomCode, setRoomCode] = useState("")
  const [roomName, setRoomName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("4")
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [digits, setDigits] = useState("4")
  const { createRoom, joinRoom, currentRoom, leaveRoom, startGame } = useMultiplayer()
  const { profile } = useProfile()
  const router = useRouter()

  const { toast } = useToast()

  const handleCreateRoom = async () => {
    try {
      const room = await createRoom(
        roomName || 'New Game Room',
        parseInt(maxPlayers),
        difficulty,
        parseInt(digits)
      )
      if (room) {
        toast({
          title: "Room Created Successfully!",
          description: `Your room code is: ${room.id}`,
          duration: 5000,
        })
        router.push(`/room/${room.id}`)
      }
    } catch (error: any) {
      console.error('Error creating room:', error)
      toast({
        title: "Error Creating Room",
        description: error.message || "Failed to create room",
        variant: "destructive",
      })
    }
  }

  const handleJoinRoom = async () => {
    if (roomCode) {
      await joinRoom(roomCode)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">Multiplayer Mode</h1>
        
        {!currentRoom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create Room</CardTitle>
                <CardDescription>Start a new game room and invite friends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select max players" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digits">Number of Digits</Label>
                  <Select value={digits} onValueChange={setDigits}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of digits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Digits</SelectItem>
                      <SelectItem value="4">4 Digits</SelectItem>
                      <SelectItem value="5">5 Digits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCreateRoom}
                  className="w-full"
                  variant="default"
                >
                  Create New Room
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>Enter a room code to join an existing game</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <Button 
                  onClick={handleJoinRoom}
                  className="w-full"
                  variant="default"
                  disabled={!roomCode}
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Room: {currentRoom.room.id}</CardTitle>
                  <CardDescription>
                    {currentRoom.players.length} players in room
                  </CardDescription>
                </div>
                <Button 
                  variant="outline"
                  onClick={leaveRoom}
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
                  
                  {currentRoom.room.host_id === profile?.id && currentRoom.room.status === 'waiting' && (
                    <Button 
                      className="w-full"
                      variant="default"
                      disabled={currentRoom.players.length < 2}
                      onClick={startGame}
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
        )}
      </div>
    </div>
  )
}