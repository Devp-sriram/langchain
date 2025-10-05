import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence , RunnablePassthrough } from "@langchain/core/runnables";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const model = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  model: "gpt-4o",
});

const punctuationTemplate = `Given a sentence, add punctuation where needed. 
sentence: {sentence}
sentence with punctuation:  
`

const grammarTemplate = `Given a sentence correct the grammar.
sentence: {punctuated_sentence}
if it's already corrected just return it
sentence with correct grammar: 
`
const translatorTemplate = `
Change the language of the given sentence.
sentence:{grammar_sentence}
language:{language}
`
const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate)
const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate)
const translatorPrompt = PromptTemplate.fromTemplate(translatorTemplate)

const punctuationChain = RunnableSequence.from([ punctuationPrompt , model , new StringOutputParser()])
const grammerChain  =  RunnableSequence.from([ grammarPrompt , model , new StringOutputParser()])
const translatorchain = RunnableSequence.from([translatorPrompt , model , new StringOutputParser()])

const chain = RunnableSequence.from([
  {
    punctuated_sentence: punctuationChain,
    original_input : new RunnablePassthrough()
  },
  {
    grammar_sentence : grammerChain, 
    language : ({original_input}) => original_input.language
  },
  translatorchain
])

const response = await chain.invoke({
  sentence: 'i dont liked mondays',
  language: 'dutch'
})

console.log(response)
