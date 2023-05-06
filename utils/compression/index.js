function compress (node, spec) {
  let index = 0
  const compressedNode = []
  for (const key of spec) {
    if (Array.isArray(key)) {
      const value = node[key[0]]
      if (value) {
        if (Array.isArray(value)) {
          compressedNode[index] = value.map(v => compress(v, key.slice(1)))
        } else {
          compressedNode[index] = key.slice(1).map(k => {
            return value[k]
          })
        }
      }
    } else if (node[key]) {
      compressedNode[index] = node[key]
    }

    index++
  }
  return compressedNode
}

function decompress (node, spec) {
  const decompressed = {}
  console.log('dec', node, spec)
  if (Array.isArray(node)) {
    for (let index = 0; index < node.length; index++) {
      const [name, ...subspec] = spec
      if (typeof subspec[index] === 'string') {
        if (Array.isArray(node[index])) {
          debugger
        }
        decompressed[spec[index]] = node[index]
      } else if (Array.isArray(spec[index])) {
        const key = spec[index][0]
        if (key === 'children') {
          debugger
        }
        decompressed[key] = decompress(node[index], spec[index])
      }
    }
  } else {
    debugger
  }
  return decompressed
}

// Define a sample node object
const node = {
  name: 'hellonmame',
  children: [{
    name: 'question 1',
    each: 'answer',
    question: 'What is your name?',
    data: ['Alice', 'Bob', 'Charlie'],
    objective: 'identify',
    type: 'open-ended',
    context: 'personal',
    pattern: 'none',
    cost: 0.5,
    children: [{
      name: 'question 1',
      each: 'answer',
      question: 'What is your name?',
      data: ['Alice', 'Bob', 'Charlie'],
      objective: 'identify',
      type: 'open-ended',
      context: 'personal',
      pattern: 'none',
      cost: 0.5
    }]
  }, {
    name: 'question 2',
    each: 'answer',
    question: 'What is your favorite color?',
    data: ['red', 'green', 'blue'],
    objective: 'explore',
    type: 'multiple-choice',
    context: 'general',
    pattern: 'random',
    cost: 0.25
  }],
  config: {
    data: 'some data',
    objective: 'some objective',
    type: 'some type',
    context: 'some context',
    pattern: 'some pattern',
    cost: 1.0
  }
}
console.log(node, JSON.stringify(node).length)
// Define a sample spec array
// const spec = [
//   'children',
//   ['config', 'data', 'objective', 'type', 'context', 'pattern', 'cost']
// ]
const children = ['children', 'name', 'each', 'question', 'data', 'objective', 'type', 'context', 'pattern', 'cost']
children.push(children)
const spec = [
  'name',
  children,
  ['config', 'data', 'objective', 'type', 'context', 'pattern', 'cost']]

// Compress the node object using the 'compress' function
const compressedNode = compress(node, spec)

// Log the compressed node object
console.log(compressedNode, spec)

// Decompress the compressed node object using the 'decompress' function
const decompressedNode = decompress(compressedNode, spec)

// Log the decompressed node object
console.log(decompressedNode)
// console.log(JSON.stringify(decompressedNode,null,2))
