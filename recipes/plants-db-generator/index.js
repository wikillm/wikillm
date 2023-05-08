const plants = [
  'Umbilicus rupestris tuberous roots',
  'navelwort',
  'wall pennywort',
  'Umbrella liverwort bulbs',
  'syringe of plant Calypogeia azurea',
  'syringe of Blue Pouchwort ',
  'syringe of liverwort',
  'moss Philonotis seriata',
  'Liverwort Lunularia cruciata carpet',
  'hanging moss Neckera crispa,',
  'moss Polytrichum strictum',
  'Liverwort Endiviifolia',
  'moss Barbula unguiculata',
  'selaginella erythropus sanguinea',
  'Leptodon smithii',
  'moss Ptilium crista-castrensis',
  'moss Mnium hornum',
  'Tree moss Thamnobryum alopecurum moss',
  'moss Pohlia nutans',
  'Peltigera praetextata',
  'Selaginella Uncinata',
  'Dragon horn Lichen'
]
const organisms = [
  "adult Glomeris marginata 'Pill millipedes' Oniscomorpha",
  'Springtails, Small Arthropods'
]

module.exports = {
  inputSchema: {
    apikey: {
      title: 'OpenAI api key',
      type: 'string'
    }

  },
  children: [{
    input: {
      plantList: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    variables: {
      plantList: plants
    },
    objective: 'The main objective is to create a guide book for a list of moss plants',
    pattern: '\'["1. ${each}1", "2. ${each}2"]\'',
    type: 'a json array of single line strings',
    name: 'chapters',
    each: 'chapter',
    context: `This is a list of moss plants that are meant to be grown in terrarium:
    """          
    ${plants.map(p => `
- ${p}`)}
    """`,
    // variables: {
    //   plantList: plants
    // },
    question: `
    For a book about these moss plants provide 20 chapter titles 
     `,
    //  where you expand on the main characteristics of this plant.

    children: [{
      name: 'subchapters',
      each: 'subchapter',
      question: 'For chapter """${chapter}""" of this book provide 10 subchapters'

    }]
  }]
}
