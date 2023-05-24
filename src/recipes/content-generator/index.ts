export default {
  input: {
    apikey: {
      title: 'OpenAI api key',
      type: 'string',
    },
    book: { type: 'string', default: 'everything', title: 'book about' },
    chaptersLength: { type: 'number', default: 2 },
    subchaptersLength: { type: 'number', default: 2 },
    paragraphsLength: { type: 'number', default: 2 },
  },
  viewer: {
    '/App.js': `
import React from "react";
import data from "./data.json";

// Component for rendering a paragraph
const Paragraph = ({ value, imagepromptimage, imageprompt }) => (
  <div>
    <p>{value}</p>
    {imageprompt &&<> <img width={500} src={imagepromptimage}/><pre>Image {imageprompt} </pre></>}
  </div>
);

// Component for rendering a subchapter
const SubChapter = ({ value, paragraphs }) => (
  <div>
    <h3>{value}</h3>
    {paragraphs.map((paragraph, index) => (
      <Paragraph key={index} {...paragraph} />
    ))}
  </div>
);

// Component for rendering a chapter
const Chapter = ({ value, subchapters }) => (
  <div>
    <h2>{value}</h2>
    {subchapters.map((subchapter, index) => (
      <SubChapter key={index} {...subchapter} />
    ))}
  </div>
);

// Component for rendering the entire data structure
const DataDisplay = ({ chapters }) => (
  <div>
  <button onClick={
    () => window.print()
  }>print</button>
    {chapters.map((chapter, index) => (
      <Chapter key={index} {...chapter} />
    ))}
  </div>
);

// Usage in your React application
const App = () => {
  return <DataDisplay {...data} />;
};

export default App;
`,
  },
  children: [
    // {
    //   name: "coverImagePrompt",
    //   // dependencies: ["imageprompts"],

    //   action: "openai.createChatCompletion",
    //   dataType: "string",

    //   question: 'Provide a dalle prompt for an image for cover of the book  "${book}"',
    //   children: [{
    //     name: "coverImage",
    //     action: "openai.createImage",
    //     question: '${coverImagePrompt}}',
    //   }]
    // },
    {
      name: 'chapters',
      each: 'chapter',

      objective: `In an book about  
    \${book}.`,
      pattern: '\'["${each}1", "${each}2"]\'',
      type: 'a json array of single line strings',
      question: 'Provide ${chaptersLength} chapter titles for this book.',
      action: 'openai.createChatCompletion',
      dataType: 'array',
      children: [
        {
          name: 'subchapters',
          each: 'subchapter',
          question: `
                 For chapter "\${chapter}" provide \${subchaptersLength} subchapter titles`,
          children: [
            {
              name: 'paragraphs',
              each: 'paragraph',
              question: `Under the chapter "\${chapter}" and the subchapter
                    "\${subchapter}":
                    Provide \${paragraphsLength} paragraphs`,
              children: [
                {
                  name: 'imageprompt',
                  type: ' ',
                  pattern: ' ',
                  dataType: 'string',
                  question: `
                  Provide a prompt to be given to an image generator like openai dall-e
                  for a paragraph under the chapter with title "\${chapter} 
                  and subchapter "\${subchapter}" and paragraph 
                  """\${paragraph}"""

                  The image should not include any letters in the composition.
                  `,
                  children: [
                    {
                      name: 'image',
                      action: 'openai.createImage',
                      question: '${imageprompt}}',
                      dataType: 'string',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
