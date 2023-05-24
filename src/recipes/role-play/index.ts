export default {
  children: [
    {
      input: {
        userActAs: {
          type: 'string',
        },
        botActAs: {
          type: 'string',
        },
        inputType: {
          type: 'string',
        },
        outputFormat: {
          type: 'string',
        },
        firstInput: {
          type: 'string',
        },
      },
      name: 'role-play',
      question: `Let's play a role-playing game. 
        I will act as a reader, and you will act as 
        the book "Mini Encyclopedia of plants" that has all information humanity has about plants on earth.
        I will provide the page index preceded by one arrow bracket (>). 
        You will print out the output formatted in markdown. 
        Do not explain anything; only print the output. 
        My first page index is this:
        >/api/plants?count=347480&from=10&to=20&include=[name]`,
    },
  ],
};
