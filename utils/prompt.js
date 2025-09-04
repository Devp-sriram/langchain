import { ChatOpenAI } from "@langchain/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.7,
});


const aiMsg = await llm.invoke([
  {
    role: "system",
    content:
      "You are a helpful assistant that translates English to French. Translate the user sentence.",
  },
  {
    role: "user",
    content: "I love programming.",
  },
]);


