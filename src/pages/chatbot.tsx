import { useState } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle } from 'lucide-react'

// Update message type
type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSend = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    const newMessage: ChatMessage = { role: 'user', content: input }
    
    try {
      // Update messages optimistically
      setMessages(prev => [...prev, newMessage])
      setInput('')

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, newMessage] })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { content, reasoning } = await response.json()
      
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: content || "I couldn't generate a response.",
          reasoning: reasoning || "Response generation failed"
        }
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I'm having trouble responding. Please try again.",
          reasoning: "Error occurred during API request"
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto p-4 max-w-4xl">
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <CardTitle>AI Assistant</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 rounded-md border p-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index}>
                    {msg.reasoning && (
                      <div className="p-3 mb-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <span className="font-medium">Reasoning:</span> {msg.reasoning}
                      </div>
                    )}
                    <div className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'ml-auto bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="p-3 rounded-lg bg-muted max-w-[80%] animate-pulse">
                    Thinking...
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about number patterns..."
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 