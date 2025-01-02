import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/contexts/ProfileContext'

interface NicknameDialogProps {
  isOpen: boolean
  onSubmit: (nickname: string) => void
}

export function NicknameDialog({ isOpen, onSubmit }: NicknameDialogProps) {
  const [inputNickname, setInputNickname] = useState('')
  const { setNickname } = useProfile()

  const handleSubmit = () => {
    if (inputNickname.trim()) {
      setNickname(inputNickname.trim())
      onSubmit(inputNickname.trim())
      setInputNickname('')
    }
  }

  return (
    <Dialog open={isOpen} modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Nickname</DialogTitle>
          <DialogDescription>
            Enter a nickname to identify yourself in the game room
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter your nickname"
            value={inputNickname}
            onChange={(e) => setInputNickname(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            minLength={3}
            maxLength={20}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!inputNickname.trim()} 
            className="w-full"
          >
            Join Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}