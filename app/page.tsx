'use client'

import { useState , useEffect } from 'react';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export default function Home() {
  const [text,setText] = useState('');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize : 500,
    chunkOverlap :50
  })


  async function fetcher (){
    try{
      const res = await fetch('data.txt').then(res => res.text())
      setText(res)
    }catch(err){
      console.log(err)
    }
  }

  useEffect(()=>{
    (async()=>{
      await fetcher()
    })()
  },[])

  useEffect(()=>{
    (async()=>{
    const output = await splitter.createDocuments([text])
      console.log(output)
    })()
  },[text])


  return (
    <>
      <h1>{text}</h1>
    </>
  );
}
