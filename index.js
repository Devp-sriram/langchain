import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Mistral } from "@mistralai/mistralai";
import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config();

const mistral = new Mistral({
  apiKey:process.env.MISTRAL_API_KEY,
});


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

const dir = path.join('/home/devp-sriram/scrimba/langchain','scrimba-info.txt');

 async function createEmberding(input){
    const result = await mistral.embeddings.create({
      inputs : input,
      model : 'mistral-embed',
})
   const content = input.map((chunck,index)=>{
      return {
      content : chunck,
      embedding : result.data[index].embedding
    }
  })
   return content;
}


try {
  const result = readFileSync(dir,'utf8');
  const spliter = new RecursiveCharacterTextSplitter({
    chunkSize :250,
    separators: ['\n\n', '\n', ' ', ''], // default settings
    chunkOverlap :50,
  })
   
  const output = await spliter.createDocuments([result]);
  const content = output.map(chunk => chunk.pageContent);

 //  const tempcontent = ['dfjbdfioasdbvoiasbdv','dwucydvcyadvc','wdihfvdwiuvc'];
  const embeddings = await createEmberding(content)

 
async function insertData(data) {
  try {
    const { data: insertedData, error } = await supabase
      .from('match_documents')
      .insert(data)

    if (error) {
      console.error('Error inserting data:', error)
      throw error
    }

    console.log('Successfully inserted data:', insertedData)
    return insertedData
  } catch (error) {
    console.error('Failed to insert data:', error)
    throw error
  }
}

// Call the function with your data
try {
  await insertData(embeddings)
} catch (error) {
  console.error('Insertion failed:', error)
}
  
} catch (err) {
  console.log(err)
}

