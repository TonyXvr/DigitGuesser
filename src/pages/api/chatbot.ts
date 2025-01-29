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
    
    console.log('Sending to DeepSeek API:', JSON.stringify({
      model: "deepseek-reasoner",
      messages: messages.slice(-3), // Last 3 messages for context
      temperature: 0.3
    }, null, 2))

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
      })
    })

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`)
    }

    console.log('DeepSeek response status:', deepseekResponse.status)
    const responseBody = await deepseekResponse.text()
    console.log('DeepSeek response body:', responseBody)

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