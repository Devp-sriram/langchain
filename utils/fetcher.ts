import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export default async function feed() {
  let supabase;
  try {
    const filePath = path.join(process.cwd(), "data.txt"); // root of project
    const text = await fs.readFile(filePath, "utf-8");

    const SUPABASE_ID = process.env.SUPABASE_ID!;
    const SUPABASE_KEY = process.env.SUPABASE_KEY!;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: OPENAI_API_KEY,
    });

    supabase = createClient(SUPABASE_ID, SUPABASE_KEY);

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: "documents",
      queryName: "match_docs",
    });

    const output = await splitter.createDocuments([text]);

    console.log("*****************feed started******************");
    const res = await vectorStore.addDocuments(output);
    console.log(res);
    console.log("*********feed completed successfully***********");

    return res;
  } catch (err) {
    console.error("Error in feed:", err);
    throw err;
  } finally {
    if (supabase) {
      // 👇 force close DB pool
      await supabase.removeAllChannels();
    }
  }
}

// Run directly if invoked as a script
if (import.meta.url === `file://${process.argv[1]}`) {
  feed().then(() => process.exit(0));
}
