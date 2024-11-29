import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export async function getChatCompletion(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: formattedMessages,
      system: "You are a helpful trading strategy assistant. Help users create and customize trading strategies for cryptocurrency backtesting. Provide clear explanations and generate valid JavaScript code for strategy implementation."
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}