'use client'

import { useState , useEffect } from 'react'

export default function home() {
  const [prompt , setPrompt]  = useState('')

  return(
    <section className='w-full h-screen flex justify-center items-center'>
      <div className='w-sm flex flex-col gap-4'>
        <label className=''> Enter the prompt </label>
        <input type='text' value={prompt} onChange={(e)=>setPrompt(e.target.value)} className='border border-solid border-e-emerald-50'/>
        <button className='text-black bg-white w-fit p-2 rounded-xl'> send </button>
      </div>
    </section>
  );
}
