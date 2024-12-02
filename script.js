import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Mistral } from "@mistralai/mistralai";
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

{/* window.document.addEventListener('submit', (e) => {
    e.preventDefault()
    progressConversation()
}) */}

const mistral = new Mistral({
  apiKey:process.env.MISTRAL_API_KEY,
});
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

{/* const prompt = ChatPromptTemplate.fromTemplate(
  `transform the user question into a standalone question , :{usersQuestion}`
); */}

//console.log(prompt.promptMessages);

async function createStandaloneQuestion(input) {
  const result = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
       {
        content: "convert the user's question as a standalone question and return the standalone question",
        role: "system",
      },{
        content:input,
        role: "user",
      },
      ],
  });

  // Handle the result
  return result.choices[0].message.content
}

const input = "What is the format of the courses?,What kind of support is available (forums, mentorship, etc.)?"
const content = await createStandaloneQuestion(input);
console.log(`content ${content}`);

async function createEmbeddings(content){
   const result =  await mistral.embeddings.create({
    model : 'mistral-embed',
    inputs : [content],
  })
  return result.data[0].embedding;
}

const embedding = await createEmbeddings(content);
console.log(`embedding ${embedding}`)

async function retrieveMatches(embedding) {
  const { data } = await supabase.rpc('match_document_docs', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 10
    });
  
  return data.map((info) => info.content).join(',');
}
const matches = retrieveMatches(embedding);
console.log(`matches ${matches}`)

async function ragResult(matches,input) {
  const result = await mistral.chat.complete({
    model: "mistral-large-latest",
    messages: [
       {
        content: `give the answer accoring to this content content:${matches}`,
        role: "system",
      },{
        content:input,
        role: "user",
      },
      ],
  });

  // Handle the result
  return result.choices[0].message.content
}

console.log(await ragResult(matches, content)),



async function progressConversation() {
    const userInput = document.getElementById('user-input')
    const chatbotConversation = document.getElementById('chatbot-conversation-container')
    const question = userInput.value
    userInput.value = ''

    // add human message
    const newHumanSpeechBubble = document.createElement('div')
    newHumanSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newHumanSpeechBubble)
    newHumanSpeechBubble.textContent = question
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight

    // add AI message
    const newAiSpeechBubble = document.createElement('div')
    newAiSpeechBubble.classList.add('speech', 'speech-ai')
    chatbotConversation.appendChild(newAiSpeechBubble)
    newAiSpeechBubble.textContent = result
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
}
