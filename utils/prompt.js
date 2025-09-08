import { ChatOpenAI } from "@langchain/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if(!OPENAI_API_KEY) throw new Error('open ai key not found')

const model = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-4o",
  temperature: 0.7,
});

const promptTemplate = PromptTemplate.fromTemplate(
  "make this prompt as a standalone Question : {prompt}"
);

const template =  await promptTemplate.pipe(model)

const chain = await template.invoke({ 
  prompt: "Hey Hi , I'm JavaScript dev trying to learn ai bu every recources are in python , why does ai development highly uses pyhton" 
});

console.log(chain.content);
