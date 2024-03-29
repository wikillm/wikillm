export default {
  objective: '',
  validate: {},
  transform: {},
  children: [
    {
      name: 'categories',
      each: 'category',
      loop: {
        items: [
          'first',
          'second',
          'third',
          'fourth',
          'fifth',
          'sixth',
          'seventh',
        ],
        name: 'position',
      },
      question: `Provide the \${position} 100 entries in a list
  of 700 categories for \${subject} you know sorted in alphabetical order`,
      children: [
        {
          name: 'attributes',
          each: 'attribute',
          loop: {
            items: [
              'first',
              'second',
              'third',
              'fourth',
              'fifth',
              'sixth',
              'seventh',
            ],
            name: 'position',
          },

          question: `Provide the \${position} 100 entries in a list
  of 700 attributes under the category \${category}  for \${subject} you know sorted in alphabetical order`,
        },
      ],
    },
  ],
};
