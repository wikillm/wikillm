const plants = [
  "Umbilicus rupestris tuberous roots",
  "navelwort",
  "wall pennywort",
  "Umbrella liverwort bulbs",
  "syringe of plant Calypogeia azurea",
  "syringe of Blue Pouchwort ",
  "syringe of liverwort",
  "moss Philonotis seriata",
  "Liverwort Lunularia cruciata carpet",
  "hanging moss Neckera crispa,",
  "moss Polytrichum strictum",
  "Liverwort Endiviifolia",
  "moss Barbula unguiculata",
  "selaginella erythropus sanguinea",
  "Leptodon smithii",
  "moss Ptilium crista-castrensis",
  "moss Mnium hornum",
  "Tree moss Thamnobryum alopecurum moss",
  "moss Pohlia nutans",
  "Peltigera praetextata",
  "Selaginella Uncinata",
  "Dragon horn Lichen",
];
const organisms = [
  "adult Glomeris marginata 'Pill millipedes' Oniscomorpha",
  "Springtails, Small Arthropods",
];

export default {
  input: {
    apikey: {
      title: "OpenAI api key",
      type: "string",
    },
  },
  views: [
    {
      name: "web-book",
      component: ({ data }) => {
        return "this is data" + JSON.stringify(data);
      },
    },
  ],
  children: [
    {
      input: {
        plantList: {
          type: "array",
          items: { type: "string" },
        },
      },
      variables: {
        plantList: plants,
      },
      objective:
        "The main objective is to create a guide about a list of moss plants",
      pattern: '\'["1. ${each}1", "2. ${each}2"]\'',
      type: "a json array of single line strings",
      name: "chapters",
      each: "chapter",
      context: `This is the list of moss plants that are meant to be grown in a terrarium:
    """          
    ${plants.map((p) => `\n- ${p}`)}
    """\
    `,
      question: `
    For a book about these moss plants provide 5 chapter titles 
     `,
      action: "createChatCompletion",
      children: [
        {
          name: "subchapters",
          each: "subchapter",
          question: `For chapter "\${chapter}"
      of this book provide 10 subchapters`,
          children: [
            {
              name: "imagePrompts",
              each: "imagePrompt",
              question:
                'Under chapter "${chapter}" on subchapter "${subchapter}" provide 3 dall-e prompts to generate an image for starting the subchapter',
              // children: [{
              //   name: 'generatedImages',
              //   each: 'generatedImage',
              //   prompt: `${imagePrompt}`,
              //   action: 'createImage',
              //   variables: {
              //     size: "1024x1024",
              //     n: 1
              //   }
              // }]
            },
            {
              name: "paragraphs",
              each: "paragraph",
              question:
                "Under chapter ${chapter} and subchapter ${subchapter} provide 10 paragraphs",
            },
          ],
        },
      ],
    },
  ],
};
