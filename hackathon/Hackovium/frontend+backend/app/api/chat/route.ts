import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages, repoContext } = await req.json();

  const systemPrompt = `You are a helpful AI assistant for hackathon judges. You are reviewing a GitHub repository.
  Here is the context of the repository:
  ${repoContext}
  
  Answer the judge's questions concisely and accurately based on the provided context. Keep it short and retro-themed if possible.`;

  const result = streamText({
    model: groq('llama3-8b-8192'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}