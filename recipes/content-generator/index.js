export const contentGenerator = {
    input: {
        apikey: {
            title: 'OpenAI api key',
            type: 'string'
        }
    },
    children: [
        {
            name: 'chapters',
            each: 'chapter',
            input: {
                guide: {type: 'string', default: 'everything', title: 'guide about'},
                chaptersLength: {type: 'number', default: 2},
                maxCategories: {type: 'number', default: 700},
                maxSubCategories: {type: 'number', default: 700},
                subchaptersLength: {type: 'number', default: 2},
                questionsLength: {type: 'number', default: 2},
                paragraphsLength: {type: 'number', default: 2}
            },
            objective: `In an encyclopedia about  
    \${guide}.`,
            pattern: '\'["1. ${each}1", "2. ${each}2"]\'',
            type: 'a json array of single line strings',
            question: 'Provide ${chaptersLength} chapter titles for this guide.',
            action: 'openai.textCompletion',
            children: [
                {
                    name: 'imageprompts',
                    each: 'imageprompt',
                    type: ' ',
                    pattern: ' ',

                    question: `
          Provide a prompt to be given to an image generator like openai dall-e
           for the chapter with title "\${chapter}"
          `
                },
                {
                    name: 'subchapters',
                    each: 'subchapter',
                    question: `
                 For chapter "\${chapter}" provide \${subchaptersLength} subchapter titles`,
                    children: [
                        {
                            name: 'questions',
                            each: 'question',
                            context: 'Under the chapter "${chapter}":',
                            question:
                                'For subchapter "${subchapter}" provide ${questionsLength} questions',
                            children: [
                                {
                                    name: 'paragraphs',
                                    each: 'paragraph',
                                    question: `Under the chapter "\${chapter}" and the subchapter
                    "\${subchapter}":
                    For question "\${question}" provide a detailed answer split into \${paragraphsLength} paragraphs`,
                                    children: [
                                        {
                                            name: 'metrics',
                                            each: 'metric',
                                            context: 'Under the chapter "${chapter}"',
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
        {
            name: 'images',
            each: 'image',
            dependencies: ['imageprompts'],
            loop: {
                name: 'imageprompt',
                items: 'imageprompts'
            },
            action: 'openai.dalle',
            question: 'Provide an image for the prompt "${imageprompt}"'
        }
    ]
};
