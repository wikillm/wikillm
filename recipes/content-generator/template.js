module.exports = [
  {
    name: 'chapters',
    each: 'chapter',

    question: 'Provide ${chaptersLength} chapter titles for this guide.',
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
            question: 'For subchapter "${subchapter}" provide ${questionsLength} questions',
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
  }
]

