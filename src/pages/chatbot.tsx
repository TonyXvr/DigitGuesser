import { useState } from 'react'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle } from 'lucide-react'

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSend = async () => {
    if (!input.trim()) return
    
    setIsLoading(true)
    try {
      // Add your API integration here
      const newMessage = { role: 'user', content: input }
      setMessages(prev => [...prev, newMessage])
      
      // Simulated AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "This is a simulated response. Integrate with your AI API here."
        }])
        setIsLoading(false)
      }, 1000)
      
      setInput('')
    } catch (error) {
      console.error('Chat error:', error)
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
                  <div 
                    key={index}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'ml-auto bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="p-3 rounded-lg bg-muted max-w-[80%] animate-pulse">
                    ...
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about number patterns..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 