import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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
    queryName: "match_docs",
});

 const retriever = new SupabaseHybridSearch(embeddings, {
    client: supabase,
    //  Below are the defaults, expecting that you set up your supabase table and functions according to the guide above. Please change if necessary.
    similarityK: 2,
    keywordK: 2,
    tableName: "documents",
    similarityQueryName: "match_documents",
    keywordQueryName: "kw_match_documents",
  });

const model = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-4o",
});

const promptTemplate = PromptTemplate.fromTemplate(
  "make this prompt as a standalone Question : {prompt}"
);

const template =  await promptTemplate.pipe(model)

try{

  const chain = await template.invoke({ 
    prompt: "how scrimba keep learners distraction-free and improve focus on tasks ,do they have anything special events for learners" 
  });

  const response = await retriever.invoke('if I dn;t like the curses ,can i get my money back')
  console.log(chain.content)
  console.log(response);
}catch(err){
  console.log(err)
}
