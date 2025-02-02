import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY
});

const systemPrompt = `You are a helpful AI assistant specializing in college degree planning and academic advising. 
Help students understand their degree requirements, suggest course selections, and provide guidance on academic planning.
Your responses should be:
1. Structured in short bullet points
2. Limited to 3-5 key points
3. Each point should be 1-2 lines maximum
4. Use emoji indicators for different types of advice:
   📚 for course-related
   ⚡ for quick tips
   ⚠️ for important warnings
   ✅ for requirements
Focus on:
- Course prerequisites and sequencing
- Credit hour requirements
- Major/minor requirements
- Academic policies
Keep responses concise and practical.
Make sure your replies are not in seperate paragraphs. They should be in a list format. But keep the list short and concise.`;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...req.body.messages
      ],
      model: "deepseek-chat",
    });

    res.status(200).json(completion.choices[0].message);
  } catch (error) {
    console.error('DeepSeek API error:', error);
    res.status(500).json({ error: 'Error communicating with DeepSeek API' });
  }
}





// import type { NextApiRequest, NextApiResponse } from 'next'

// type Message = {
//   role: 'user' | 'assistant'
//   content: string
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   try {
//     console.log('API Key exists:', !!process.env.DEEPSEEK_API_KEY);

//     if (!process.env.DEEPSEEK_API_KEY) {
//       console.error('DeepSeek API key is missing')
//       throw new Error('API key not configured')
//     }

//     const { messages } = req.body as { messages: Message[] }
    
//     console.log('Sending to DeepSeek API:', JSON.stringify({
//       model: "deepseek-reasoner",
//       messages: messages.slice(-3), // Last 3 messages for context
//       temperature: 0.3
//     }, null, 2))

//     const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "deepseek-reasoner",
//         messages: [{ role: "system", content: "Auth test" }],
//         temperature: 0
//       })
//     })

//     if (!deepseekResponse.ok) {
//       throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`)
//     }

//     console.log('DeepSeek response status:', deepseekResponse.status)
//     const responseBody = await deepseekResponse.text()
//     console.log('DeepSeek response body:', responseBody)

//     const data = await deepseekResponse.json()
//     const responseData = {
//       content: data.choices[0].message.content,
//       reasoning: data.choices[0].message.reasoning_content
//     }
//     res.setHeader('Content-Type', 'application/json')
//     res.status(200).json(responseData)

//   } catch (error) {
//     console.error('API Error:', error)
//     res.status(500).json({ 
//       error: 'AI service unavailable',
//       message: error instanceof Error ? error.message : 'Unknown error'
//     })
//   }
// } 