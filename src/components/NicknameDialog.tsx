import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProfile } from '@/lib/supabase'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/components/ui/use-toast'

export function NicknameDialog() {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, profile, setProfile } = useProfile()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !user) return

    setIsLoading(true)
    try {
      const newProfile = await createProfile(user.id, nickname.trim())
      setProfile(newProfile)
      toast({
        title: 'Welcome!',
        description: `Your nickname "${nickname}" has been set.`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set nickname. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show dialog only if user is authenticated but doesn't have a profile yet
  const showDialog = user && !profile

  return (
    <Dialog open={showDialog} modal>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Your Nickname</DialogTitle>
          <DialogDescription>
            Enter a unique nickname to start playing and compete on the leaderboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isLoading}
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_-]+"
            title="Nickname can only contain letters, numbers, underscores, and hyphens"
          />
          <Button type="submit" disabled={!nickname.trim() || isLoading} className="w-full">
            {isLoading ? 'Setting up...' : 'Start Playing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}