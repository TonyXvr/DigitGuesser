import React, { createContext, useContext, useState, useEffect } from 'react'

type ProfileContextType = {
  nickname: string | null
  setNickname: (nickname: string | null) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [nickname, setNicknameState] = useState<string | null>(null)

  useEffect(() => {
    // Load nickname from localStorage on mount
    const savedNickname = localStorage.getItem('nickname')
    if (savedNickname) {
      setNicknameState(savedNickname)
    }
  }, [])

  const setNickname = (newNickname: string | null) => {
    setNicknameState(newNickname)
    if (newNickname) {
      localStorage.setItem('nickname', newNickname)
    } else {
      localStorage.removeItem('nickname')
    }
  }

  return (
    <ProfileContext.Provider value={{ nickname, setNickname }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}