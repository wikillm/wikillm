const subjectAttributeGenerator = {
    inputSchema: {},
    objective: `create a list of attribute labels that describes any plant `,
    pattern: `'["\${each}1", "\${each}2"]'`,
    type: "a json array of single line strings",
    questions: [
      {
        name: "attributes",
        each: "attribute",
        question: `with the first 100 of 1000 attributes,`
        // children: [
        //   {
        //     name: "plants",
        //     each: "plant",
        //     question: `
        // Provide 3 plants for plant family "\${family}"`,
        //     children: [
        //       {
        //         name: "attributes",
        //         each: "attribute",
        //         question: `Provide 10 attribute labels
        //         combining maximum 2 words for each label
        //          that can describe characteristics of the
        //         "\${plant}" under plant family "\${family}".`,
        //         children: [
        //           {
        //             name: "enums",
        //             each: "enum",
        //             question: `Provide 10 attribute enum values
        //         combining maximum 2 words for each enum value
        //          that can describe the different choices of the
        //          attribute "\${attribute}" that is used for plants
        //          under plant family "\${family}".`
        //           }
        //         ]
        //       }
        //     ]
        //   }
        // ]
      }
    ]
  };
  export const bookGenerator = {
    inputSchema: {
      apikey: {
        title: "OpenAI api key",
        type: "string"
      },
      dataPurpose: {
        type: 'string',
        title: 'What is it meant for?',
        enum: ["book", 'encyclopedia', 'guide', 'database','manual', 'list']
      },
      about: { type: "string", default: "everysasathing", title: "What is it about?" },
  
      
      chaptersLength: { type: "number", default: 2 },
      maxCategories: { type: "number", default: 700 },
      maxSubCategories: { type: "number", default: 700 },
      subchaptersLength: { type: "number", default: 2 },
      questionsLength: { type: "number", default: 2 },
      paragraphsLength: { type: "number", default: 2 }
    },
    objective: `In an book about  
    \${guide}.`,
    pattern: `'["1. \${each}1", "2. \${each}2"]'`,
    type: "a json array of single line strings",
    children: [
      {
        name: "chapters",
        each: "chapter",
  
        question: `Provide \${chaptersLength} chapter titles for this guide.`,
        children: [
          {
            name: "imageprompts",
            each: "imageprompt",
            type: " ",
            pattern: " ",
            
            question: `
            Provide a prompt to be given to an image generator like openai dall-e
             for the chapter with title "\${chapter}"
            `
          },
          {
            name: "subchapters",
            each: "subchapter",
            question: `
                   For chapter "\${chapter}" provide \${subchaptersLength} subchapter titles`,
            children: [
              {
                name: "questions",
                each: "question",
                context: `Under the chapter "\${chapter}":`,
                question: `For subchapter "\${subchapter}" provide \${questionsLength} questions`,
                children: [
                  {
                    name: "paragraphs",
                    each: "paragraph",
                    question: `Under the chapter "\${chapter}" and the subchapter
                      "\${subchapter}":
                      For question "\${question}" provide a detailed answer split into \${paragraphsLength} paragraphs`,
                    children: [
                      {
                        name: "metrics",
                        each: "metric",
                        context: `Under the chapter "\${chapter}"`,
                        question: `and subchapter "\${subchapter}"
                          and for the question "\${question}"
                          with answer
                          """
                          \${paragraph}
                          """
                          provide all possible key points
                          included in the answer.
                          `
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
    //   {
    //     name: "categories",
    //     each: "category",
    //     loop: {
    //       items: [
    //         "first",
    //         "second",
    //         "third",
    //         "fourth",
    //         "fifth",
    //         "sixth",
    //         "seventh"
    //       ],
    //       name: "position"
    //     },
    //     question: `Provide the \${position} 100 entries in a list
    // of 700 categories for attributes you know sorted in alphabetical order`,
    //     children: [
    //       {
    //         name: "attributes",
    //         each: "attribute",
    //         loop: {
    //           items: [
    //             "first",
    //             "second",
    //             "third",
    //             "fourth",
    //             "fifth",
    //             "sixth",
    //             "seventh"
    //           ],
    //           name: "position"
    //         },
  
    //         question: `Provide the \${position} 100 entries in a list
    // of 700 attributes under the category \${category} you know sorted in alphabetical order`
    //       }
    //     ]
    //   }
    ]
  };
  const parametersGenerator = {
    inputSchema: {
      apikey: {
        title: "OpenAI api key",
        type: "string"
      },
      guide: { type: "string", default: "any plant", title: "guide about" },
  
      chaptersLength: { type: "number", default: 2 },
      maxCategories: { type: "number", default: 700 },
      maxSubCategories: { type: "number", default: 700 },
      subchaptersLength: { type: "number", default: 2 },
      questionsLength: { type: "number", default: 2 },
      paragraphsLength: { type: "number", default: 2 }
    },
    objective: `Create a list of categorized attribute labels that describes
    \${guide}.`,
    pattern: `'["\${each}1", "\${each}2"]'`,
    type: "a json array of single line strings",
    questions: [
      {
        name: "categories",
        each: "category",
        loop: {
          items: [
            "first",
            "second",
            "third",
            "fourth",
            "fifth",
            "sixth",
            "seventh"
          ],
          name: "position"
        },
        question: `Provide the \${position} 100 entries in a list
  of 700 categories for attributes you know sorted in alphabetical order`,
        children: [
          {
            name: "attributes",
            each: "attribute",
            loop: {
              items: [
                "first",
                "second",
                "third",
                "fourth",
                "fifth",
                "sixth",
                "seventh"
              ],
              name: "position"
            },
  
            question: `Provide the \${position} 100 entries in a list
  of 700 attributes under the category \${category} you know sorted in alphabetical order`
          }
        ]
      }
    ]
  };