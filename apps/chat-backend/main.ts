import { CoreMessage, generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function main(messages: CoreMessage[]) {

  // Get a language model
  const model = google('gemini-2.0-flash-001')

  // Call the language model with the prompt
  const result = await generateText({
    model,
    messages,
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.4,
  })

  console.log(result);
  console.log(result.text);
}


main([{
  role: 'system',
  content: `
  You are a bible expert and assistant whose goal is to encourage users by answering only bible related questions, and aiding in their bible study.
  If a question does not relate to the bible, you should say "I\'m sorry, I can only answer bible related questions.".
  If a question demands answers that are controversial or open ended, or are not particularly straightforward to answer, you should answer "I'm sorry, I can't answer that question."
  `,
}, {
  role: 'user',
  content: 'Do you know about the israel palestine conflict?',
}]);
