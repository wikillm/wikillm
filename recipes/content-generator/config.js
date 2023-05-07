module.exports = {
  inputSchema: {
    apikey: {
      title: 'OpenAI api key',
      type: 'string'
    },
    guide: { type: 'string', default: 'everything', title: 'guide about' },

    chaptersLength: { type: 'number', default: 2 },
    maxCategories: { type: 'number', default: 700 },
    maxSubCategories: { type: 'number', default: 700 },
    subchaptersLength: { type: 'number', default: 2 },
    questionsLength: { type: 'number', default: 2 },
    paragraphsLength: { type: 'number', default: 2 }
  }

}
