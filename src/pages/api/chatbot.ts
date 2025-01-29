import type { NextApiRequest, NextApiResponse } from 'next'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body as { messages: Message[] }
    
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.2,
        stop: ["\n\n"],
        reasoning_depth: "advanced"
      })
    })

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`)
    }

    const data = await deepseekResponse.json()
    const responseData = {
      content: data.choices[0].message.content,
      reasoning: data.choices[0].message.reasoning_content
    }
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(responseData)

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'AI service unavailable',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 