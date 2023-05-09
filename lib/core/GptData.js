import GptQuestion from 'lib/core/GptQuestion'
import { compress, decompress } from '../../utils/compression'
const { Configuration, OpenAIApi } = require('openai')

export const baseNodeSchema = {
  type: 'object',
  properties: {
    input: {
      type: 'object'
    },
    data: {
      type: 'object'
    },
    each: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    question: {
      type: 'string'
    },
    usage: {
      type: 'string'
    },
    variables: {
      type: 'object'
    }
  }
}
export const compressionSchema = {
  definitions: {
    Node: {
      type: 'object',
      properties: {
        children: {
          type: 'array',
          items: {
            $ref: '#/definitions/Node'

          }
        },
        ...baseNodeSchema
      }
    }
  },
  type: 'array',
  items: {
    $ref: '#/definitions/Node'

  }
}
export class GptData {
  constructor ({ config, variables }) {
    this.config = config
    this.questions = config.children
    console.log('config', config)
    let nodes = this.questions
    this.layers = []
    this.layerVariables = []
    while (nodes.length) {
      this.layerVariables.push(nodes.map(({ name, each }) => ({ name, each })))
      this.layers.push(nodes)
      nodes = nodes.reduce((nods, n) => {
        if (n.children) {
          nods.push(...n.children)
        }
        return nods
      }, [])
    }
    this.compiledLayers = [[]]

    this.variables = variables

    const configuration = new Configuration({
      apiKey: this.variables?.apikey || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    })
    this.openai = new OpenAIApi(configuration)
    console.log('layers', this.layers)
    this.finishHooks = []
    this.finishAllHooks = []
    this.finishSublayerHooks = []
    this.getLayer = this.getLayer.bind(this)
    this.getAllLayers = this.getAllLayers.bind(this)
    this.getCompressedData = this.getCompressedData.bind(this)
    this.getData = this.getData.bind(this)
    this.onFinishAllLayers = this.onFinishAllLayers.bind(this)
    this.onFinishLayer = this.onFinishLayer.bind(this)
    this.onFinishSublayer = this.onFinishSublayer.bind(this)
    this.getLayerData = this.getLayerData.bind(this)
  }

  pause () {
    this.paused = true
  }

  async getAllLayers () {
    for (let index = 0; index < this.layers.length; index++) {
      console.log('getLayer ', index)
      if (this.paused) {
        console.log('Paused')
        break
      }
      await this.getLayer(index)
    }
    this.finishAllHooks.forEach((hook) => hook())
  }

  onFinishLayer (func) {
    this.finishHooks.push(func)
  }

  onFinishAllLayers (func) {
    this.finishAllHooks.push(func)
  }

  onFinishSublayer (func) {
    this.finishSublayerHooks.push(func)
  }

  getUsage () {
    const compiledLayers = this.compiledLayers.filter((arr) => arr.length)
    this.compiledLayers = compiledLayers
    this.compiledLayers.map((compiledLayer) => {
      if (Array.isArray(compiledLayer)) {
        compiledLayer.forEach(({ request }) => {})
      }
    })
  }

  getCompressedData () {
    const compiledLayers = this.compiledLayers
    const data = compiledLayers[0].map((sublayer) => {
      const compressed = this.compress(sublayer)
      return compressed
    })

    console.log('Root data', data)
    const compressed = compress(data, compressionSchema)
    console.log('Root data compression', compressed, decompress(compressed, compressionSchema))

    return data
  }

  getLayerData () {
    const layer = this.compiledLayers[0] || this.layers[0]
    console.log(layer)

    return layer?.map((sublayer) => {
      const compressed = this.compress(sublayer)
      return compressed
    })
  }

  compress (node, parent) {
    const { name, each, data, usage, question, input, prompt } = node

    const newNode = { name, each, data, usage, question, input, variables: {}, prompt }

    for (const key in node.variables) {
      if (key !== node.name && node.variables[key]) {
        if (parent) {
          if (parent.variables[key] !== node.variables[key]) {
            newNode.variables[key] = node.variables[key]
          }
        } else {
          newNode.variables[key] = node.variables[key]
        }
      }
    }
    if (node.compiledChildren) {
      newNode.children = node.compiledChildren.map((child) => {
        return this.compress(child, node)
      })
    }
    return newNode
  }

  getData () {
    const flatData = {}
    const compiledLayers = this.compiledLayers.filter((arr) => arr.length)
    this.compiledLayers = compiledLayers
    // console.log(compiledLayers);
    if (Array.isArray(compiledLayers[compiledLayers.length - 1])) {
      compiledLayers[compiledLayers.length - 1].forEach((layer) => {
        const { variables, data, name } = layer
        if (!variables) {
          throw 'no variables'
        }
        let children = {}
        let node = layer
        let parent
        while (node) {
          const { name, each, data, usage, question } = node
          const newNode = { name, each, data, usage, question, variables: {} }
          for (const key in node.variables) {
            if (key !== node.name && node.variables[key]) {
              if (node.parent) {
                if (node.parent.variables[key] !== node.variables[key]) {
                  newNode.variables[key] = node.variables[key]
                }
              } else {
                newNode.variables[key] = node.variables[key]
              }
            }
          }
          parent = node
          children = { ...newNode, children }
          node = node.parent
        }
        this.layerVariables.reduce((path, vars) => {
          for (const { name, each } of vars) {
            if (variables[name]) {
              if (isNaN(variables[`${each}Index`])) {
                flatData[path + name] = variables[name]
                return path + name
              }
              path = path + name + '.' + variables[`${each}Index`] + '.'
              flatData[path + 'value'] = variables[each]
            }
          }

          return path
        }, '')
      })
      this.flatData = flatData
      // unflatten
      const result = {}
      for (var i in flatData) {
        var keys = i.split('.')
        keys.reduce(function (r, e, j) {
          return (
            r[e] ||
            (r[e] = isNaN(Number(keys[j + 1]))
              ? keys.length - 1 === j
                ? flatData[i]
                : {}
              : [])
          )
        }, result)
      }
      this.result = result
      return result
    }
    return null
  }

  async getLayer (num) {
    const nodes = this.layers[num]
    if (num === 0) {
      let index = -1
      for (const node of nodes) {
        index++
        // console.log("node", node);
        node.pattern = node.pattern || this.config.pattern
        node.objective = node.objective || this.config.objective
        node.type = node.type || this.config.type
        this.compiledLayers[num][index] = this.layers[num][index]
        const { data, variables, request, prompt } = await GptQuestion({
          node,
          variables: {
            ...this.variables,
            ...node.variables
            // [previousLayer.each]: v,
            // _parent: previousLayer.each
          },
          openai: this.openai
        })
        // console.log("newvars", variables);
        if (!node.variables) {
          node.variables = {}
        }
        node.variables = { ...variables }

        // console.log(this.layers);
        this.layers[num][index].variables[node.name] = data
        this.compiledLayers[num][index].compiledChildren = []
        this.compiledLayers[num][index] = this.layers[num][index]
        this.compiledLayers[num][index].data = data
        this.compiledLayers[num][index].prompt = prompt
        // console.log("Added result in current layer", this.layers[num][index]);
        const nextLayerNodes = this.layers[num + 1]
        if (nextLayerNodes && Array.isArray(data)) {
          const nextLayers = []
          // if (!Array.isArray(nextLayer)) {
          //   layers[num + 1] = [];
          // }
          const { objective, context, type, pattern } = this.compiledLayers[num][index]

          nextLayerNodes.forEach((nextLayer) => {
            const sublayers = data.map((d, index) => {
              return {
                objective,
                context,
                type,
                pattern,
                ...this.layers[num][index],
                input: null,
                ...nextLayer,
                parent: node,
                compiled: false,
                compiledChildren: null,

                variables: {
                  ...node.variables,
                  ...this.variables,
                  [node.each]: d,
                  [node.name]: data,
                  [node.each + 'Index']: index
                }
              }
            })
            this.compiledLayers[num][index].compiledChildren.push(...sublayers)
            nextLayers.push(
              ...sublayers
            )
          })
          // console.log("Adding first layer variables");
          this.compiledLayers[0] = [
            {
              ...node,
              compiled: true,
              variables: {
                ...node.variables,
                ...this.variables,
                [node.name]: data
              },
              request
            }
          ]

          this.compiledLayers[num + 1] = nextLayers
        }
        this.finishSublayerHooks.forEach((hook) => hook(num, index))

        console.log(data)
      }
    } else {
      const nextLayerNodes = this.layers[num + 1]
      if (!nextLayerNodes) {
        console.log('Layer ', num + 1, 'not found')
      }
      this.compiledLayers[num + 1] = []
      let index = -1
      for (const subLayer of this.compiledLayers[num]) {
        index++
        console.log('running sublayer', subLayer)
        subLayer.pattern = subLayer.pattern || this.config.pattern
        subLayer.objective = subLayer.objective || this.config.objective
        subLayer.type = subLayer.type || this.config.type
        if (this.paused) {
          return
        }

        try {
          const { data, request, prompt } = await GptQuestion({
            node: subLayer,
            variables: {
              ...subLayer.variables,
              ...this.variables
            },
            openai: this.openai
          })
          subLayer.data = data
          subLayer.variables[subLayer.name] = data
          this.compiledLayers[num][index].compiledChildren = []
          this.compiledLayers[num][index].request = request
          this.compiledLayers[num][index].prompt = prompt
          this.compiledLayers[num][index].compiled = true
          this.compiledLayers[num][index].variables[subLayer.name] = data
        } catch (err) {
          console.error(err)
        }

        // console.log(
        //   "Added result in current sublayer",
        //   this.compiledLayers[num][index]
        // );
        const { objective, context, type, pattern } = this.compiledLayers[num][index]

        if (nextLayerNodes && Array.isArray(subLayer.data)) {
          nextLayerNodes.forEach((nextLayer) => {
            if (!this.compiledLayers[num + 1]) {
              this.compiledLayers[num + 1] = []
            }
            const sublayers = subLayer.data.map((d, index) => {
              return {
                objective,
                context,
                type,
                pattern,
                ...nextLayer,
                compile: true,
                parent: subLayer,
                compiledChildren: null,

                variables: {
                  [subLayer.each]: d,
                  [subLayer.name]: subLayer.data,
                  [subLayer.each + 'Index']: index,
                  ...(subLayer.parent?.variables || {}),
                  ...subLayer.variables
                }
              }
            })
            this.compiledLayers[num + 1].push(
              ...sublayers
            )
            this.compiledLayers[num][index].compiledChildren.push(...sublayers)
          })
        }

        this.finishSublayerHooks.forEach((hook) => hook(num, index))
      }
    }
    this.finishHooks.forEach((hook) => hook(num))
    return this.layers[num]
  }
}
