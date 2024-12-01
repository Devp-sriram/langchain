import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

const dir = path.join('/home/devp-sriram/scrimba/langchain','scrimba-info.txt');


const openAiEmbeddings = new OpenAIEmbeddings({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function main() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  });

  console.log(chatCompletion)
}

// main();



try {
  const result = readFileSync(dir,'utf8');
  const spliter = new RecursiveCharacterTextSplitter({
    chunkSize :350,
    separators: ['\n\n', '\n', ' ', ''], // default settings
    chunkOverlap :50,
  })
   
  const output = await spliter.createDocuments([result]);


  await SupabaseVectorStore.fromDocuments(
           output,
           openAiEmbeddings,
           { 
            client : supabase,
            tableName : 'match_documents', 
           }
  )

{/* const data = output.map(chunk => {
    return {
      content ;
    }
  }) */}

} catch (err) {
  console.log(err)
}

