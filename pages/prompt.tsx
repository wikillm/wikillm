import { TextInput, Button, Card } from "@mantine/core";
// import openai from the openai lib
import  { ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi } from "openai";
import { useState } from "react";

const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)
export function useChat(
  prompt: string,
  type: 'openai.completion'
){
  // create a state variable to hold the response
  const [response, setResponse] = useState<string | null>(null);
  ChatCompletionRequestMessageRoleEnum
  // create a function to send a message
  const sendMessage = async (prompt: string) => {
    // get the response using the openai lib to call the API
    const message: { role: ChatCompletionRequestMessageRoleEnum, content: string } = { role: 'user', content: `${prompt}` }
    const responseObj = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [message],
      max_tokens: 3700,
      temperature: 0.5,
      // topP: 1,
      n: 1,
      stream: false,
      stop: ["\n"],
      presence_penalty: 2      
    });

    // set the response state variable
    setResponse(response.data.choices[0].message.content);
  };

  // return the response and the sendMessage function
  return { response, sendMessage };
}


export default function Prompt() {
  // a hook that is called useChat()
  // and takes the parameters
  // prompt: string
  // type: openai.CompletionType | openai.ImageGenerationType
  // and returns the response
  // and the function to call to send a message
  const { response, sendMessage } = useChat({
    prompt: "Once upon a time",
    type: openai.CompletionType.Autocomplete,
  });
  

  return (
    // an input using mantine.dev components to send a message
    // and a mantine.dev card to display the response
    <div>
      <TextInput
        label="Prompt"
        placeholder="Once upon a time"
        value={prompt}
        onChange={(event) => setPrompt(event.currentTarget.value)}
      />
      <Button onClick={() => sendMessage(prompt)}>Send</Button>
      <Card>{response}</Card>
    </div>
    // import the mantine.dev components
  );
  
}