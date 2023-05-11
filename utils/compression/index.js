import LZString from 'lz-string'

const decompressValue = (data, schema, defs) => {
  if (schema?.type === 'object') {
    return decompressObject(data, schema.properties, defs)
  }
  if (schema?.type === 'array') {
    return decompressArray(data, schema.items, defs)
  }
  if (schema?.$ref) {
    return decompressValue(data, defs[schema.$ref.replace('#/definitions/', '')], defs)
  }
  return data
}

const decompressObject = (data, schema, defs) => {
  const obj = {}
  let index = -1
  if (!data) {
    return data
  }
  for (const name in schema) {
    index++
    const entry = schema[name]
    if (typeof data !== 'object') {
      obj[name] = decompressValue(data[index], entry, defs)
    } else {
      obj[name] = data
    }
  }
  return obj
}

const decompressArray = (data, schema, defs) => {
  const arr = []

  for (let i = 0; i < data.length; ++i) {
    arr.push(decompressValue(data[i], schema, defs))
  }
  return arr
}
// var compressed = LZString.compressToUTF16(string);

// string = LZString.decompressFromUTF16(localStorage.getItem("myData"));
export const decompress = (data, schema) => {
  const parsedData = JSON.parse(LZString.decompressFromUTF16(data))
  // console.log('parsed lz compressed data')
  	return decompressValue(parsedData, schema, schema.definitions)
}

const compressValue = (value, schema, defs) => {
  // console.log('value', value, schema, defs)
  if (!schema) {
    return value
  }
  if (schema.type === 'object') {
    return compressObject(value, schema, defs)
  }
  if (schema.type === 'array') {
    return compressArray(value, schema.items, defs)
  }
  if (schema.$ref) {
    return compressValue(value, defs[schema.$ref.replace('#/definitions/', '')], defs)
  }
  return value
}

const compressObject = (object, schema, defs) => {
  // console.log('object', object, schema, defs)

  const data = []
  if (!schema.properties) {
    return object
  }
  for (const name in schema.properties) {
    const value = object[name]
    value && data.push(compressValue(value, schema.properties[name], defs))
  }
  return data
}

const compressArray = (array, schema, defs) => {
  // console.log('array', array, schema, defs)
  if (!array) {
    return
  }
  const data = []
  for (const value of array) {
    data.push(compressValue(value, schema, defs))
  }
  return data
}

export const compress = (object, schema) => {
  // console.log('compress', object, schema)
  const schemaCompressed = compressValue(object, schema, schema.definitions)
  // console.log({ schemaCompressed })

  const compressed = LZString.compressToUTF16(JSON.stringify(schemaCompressed))
  // console.log({ compressed })
  console.log('Root stats', {
    originalSize: JSON.stringify(object).length,
    schemaCompressedSize: JSON.stringify(schemaCompressed).length,
    compressedSize: compressed.length,
    lzcompressOriginalSize: LZString.compressToUTF16(JSON.stringify(object)).length,
    decompressed: decompress(compressed, schema)
  })
  return compressed
}

// // Usage example:

// const schema = {
//   $schema: 'http://json-schema.org/draft-07/schema#',
//   type: 'object',
//   properties: {
//     template: {
//       type: 'array',
//       items: {
//         $ref: '#/definitions/Layer'
//       }
//     }
//   },
//   definitions: {
//     Layer: {
//       type: 'object',
//       properties: {
//         name: {
//           type: 'string'
//         },
//         question: {
//           type: 'string'
//         },

//         hasOverrides: {
//           enum: ['Yes']
//         },
//         hasLoop: {
//           enum: ['Yes']
//         },
//         each: {
//           type: 'string'
//         },
//         children: {
//           type: 'array',
//           items: {
//             $ref: '#/definitions/Layer'
//           }
//         },
//         type: {
//           type: 'string'
//         },
//         pattern: {
//           type: 'string'
//         },
//         context: {
//           type: 'string'
//         },
//         items: {
//           type: 'array',
//           items: {
//             type: 'string'
//           }
//         }

//       }
//     }
//   }
// }

// const data = {
//   template: [{
//     name: 'chapters',
//     each: 'chapter',

//     question: 'Provide ${chaptersLength} chapter titles for this guide.',
//     children: [
//       {
//         name: 'imageprompts',
//         each: 'imageprompt',
//         type: ' ',
//         pattern: ' ',

//         question: `
//           Provide a prompt to be given to an image generator like openai dall-e
//            for the chapter with title "\${chapter}"
//           `
//       },
//       {
//         name: 'subchapters',
//         each: 'subchapter',
//         question: `
//                  For chapter "\${chapter}" provide \${subchaptersLength} subchapter titles`,
//         children: [
//           {
//             name: 'questions',
//             each: 'question',
//             context: 'Under the chapter "${chapter}":',
//             question: 'For subchapter "${subchapter}" provide ${questionsLength} questions',
//             children: [
//               {
//                 name: 'paragraphs',
//                 each: 'paragraph',
//                 question: `Under the chapter "\${chapter}" and the subchapter
//                     "\${subchapter}":
//                     For question "\${question}" provide a detailed answer split into \${paragraphsLength} paragraphs`,
//                 children: [
//                   {
//                     name: 'metrics',
//                     each: 'metric',
//                     context: 'Under the chapter "${chapter}"',
//                     question: `and subchapter "\${subchapter}"
//                         and for the question "\${question}"
//                         with answer
//                         """
//                         \${paragraph}
//                         """
//                         provide all possible key points
//                         included in the answer.
//                         `
//                   }
//                 ]
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }]
// }

// // Output contains decompressed object constructed using schema and input.
// //
// const compressed = compress(data,schema, )
// // console.log('compressed', JSON.stringify(compressed))

// const output = decompress(compressed,schema)
// // console.log('decompressed', output)
