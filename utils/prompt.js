import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";

import dotenv from "dotenv";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_ID = process.env.SUPABASE_ID;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if(!OPENAI_API_KEY) throw new Error('open ai key not found')
if(!SUPABASE_ID) throw new Error('supabase id not found')
if(!SUPABASE_KEY) throw new Error('supabase key key not found')


const supabase = createClient(SUPABASE_ID, SUPABASE_KEY);

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  apiKey: OPENAI_API_KEY,
});

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: "documents",
  queryName: "match_documents",
});


//  const retriever = new SupabaseHybridSearch(embeddings, {
//  client: supabase,
//  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
//  similarityK: 2,
//  keywordK: 2,
//  tableName: "documents",
//  similarityQueryName: "match_documents",
//  keywordQueryName: "kw_match_documents",
// });

const retriever = vectorStore.asRetriever({
  k: 4,
});

const model = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-4o",
});

const promptTemplate = PromptTemplate.fromTemplate(
  "make this prompt as a standalone Question : {prompt}"
);

async function getAnswer( question , context){
  const prompt = PromptTemplate.fromTemplate(`You are a helpful and enthusiastic support bot who chain answer a given question about Scrimba based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@scrimba.com. Don't try to make up an answer. Always speak as if you were chatting to a friend, here is question : {question} and context : {context}`);

  const temp =  await prompt.pipe(model).pipe(new StringOutputParser())

  const response = await temp.invoke({ 
    question: question,
    context : context
  });

  return response
}
try{
  const template =  await promptTemplate.pipe(model).pipe(new StringOutputParser()).pipe(retriever)

  const chain = await template.invoke({ 
    prompt: "Hi, I'm a vey distracted guy , I didn't complete my many courses I have been Started , how scrimba is going keep me distraction-free and improve focus on tasks" 
  });
  console.log(chain)
  // const response = await retriever.invoke("how scrimba keep learners distraction-free and improve focus on tasks ,do they have anything special for learners")
  const context = chain.map(doc=>doc.pageContent).join('\n\n')
  // console.log(context)
  console.log(await getAnswer( "Hi, I'm a vey distracted guy , I didn't complete my many courses I have been Started , how scrimba is going keep me distraction-free and improve focus on tasks" , context))

  // console.log(response);
}catch(err){
  console.log(err)
}
