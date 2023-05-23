import GptQuestion from "lib/GptQuestion";
import { compress, decompress } from "utils/compression";
import { Configuration, OpenAIApi } from "openai";
export const baseNodeUISchema = {
  parentEach: {
    "ui:widget": "textarea",
  },
  input: {
    type: "object",
  },
  data: {
    "ui:widget": "textarea",
  },
  each: {
    "ui:widget": "textarea",
  },
  name: {
    type: "string",
  },
  question: {
    "ui:widget": "textarea",
  },
  prompt: {
    "ui:widget": "textarea",
  },
  // usage: {
  //   type: 'string'
  // },
  variables: {
    type: "object",
    additionalProperties: true,
    properties: {
      "ui:widget": "textarea",
    },
  },
};
export const baseNodeSchema = {
  type: "object",
  properties: {
    parentEach: {
      type: "string",
    },
    input: {
      type: "object",
    },
    data: {
      type: "string",
      items: {
        type: "string",
      },
    },
    each: {
      type: "string",
    },
    name: {
      type: "string",
    },
    question: {
      type: "string",
    },
    prompt: {
      type: "string",
    },
    usage: {
      type: "string",
    },
    variables: {
      type: "object",
      additionalProperties: true,
    },
  },
};
export const compressionSchema = {
  definitions: {
    Node: {
      type: "object",
      properties: {
        children: {
          type: "array",
          items: {
            $ref: "#/definitions/Node",
          },
        },
        ...baseNodeSchema,
      },
    },
  },
  type: "array",
  items: {
    $ref: "#/definitions/Node",
  },
};
export class GptData {
  constructor({ config, variables }) {
    this.config = config;
    this.questions = config.children;
    console.log("config", config);
    let nodes = this.questions;
    this.layers = [];
    this.layerVariables = [];
    while (nodes.length) {
      this.layerVariables.push(nodes.map(({ name, each }) => ({ name, each })));
      this.layers.push(nodes);
      nodes = nodes.reduce((nods, n) => {
        if (n.children) {
          nods.push(...n.children);
        }
        return nods;
      }, []);
    }
    this.compiledLayers = [[]];

    this.variables = variables;

    const configuration = new Configuration({
      apiKey: this.variables?.apikey || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
    console.log("layers", this.layers);
    this.finishHooks = [];
    this.finishAllHooks = [];
    this.finishSublayerHooks = [];
    this.getLayer = this.getLayer.bind(this);
    this.getAllLayers = this.getAllLayers.bind(this);
    this.getCompressedData = this.getCompressedData.bind(this);
    this.getData = this.getData.bind(this);
    this.onFinishAllLayers = this.onFinishAllLayers.bind(this);
    this.onFinishLayer = this.onFinishLayer.bind(this);
    this.onFinishSublayer = this.onFinishSublayer.bind(this);
    this.getLayerData = this.getLayerData.bind(this);
  }

  async getLayer(num) {
    let index = -1;
    if (!this.compiledLayers[num]?.length) {
      this.compiledLayers[num] = this.layers[num];
    }

    const subLayers = this.compiledLayers[num];

    for (const subLayer of subLayers) {
      if (this.paused) {
        return;
      }
      index++;
      const objective = subLayer.objective || this.config.objective;
      const pattern = subLayer.pattern || this.config.pattern;
      const type = subLayer.type || this.config.type;
      const context = subLayer.context || this.config.context;
      const { name, each } = subLayer;
      const variables = {
        name,
        each,
        ...subLayer.variables,
      };
      try {
        const { data, request, prompt } = await GptQuestion({
          node: subLayer,
          variables,
          openai: this.openai,
        });

        subLayer.variables = {
          ...variables,
          [subLayer.name]: data,
        };

        subLayer.data = data;

        subLayer.compiledChildren = [];
        subLayer.request = request;
        subLayer.prompt = prompt;
        subLayer.compiled = true;
      } catch (err) {
        console.error(err);
      }
      const nextLayer = this.layers[num + 1];
      if (nextLayer && Array.isArray(subLayer.data)) {
        nextLayer.forEach((nextSublayerTemplate) => {
          if (!this.compiledLayers[num + 1]) {
            this.compiledLayers[num + 1] = [];
          }
          const nextCompiledLayer = this.compiledLayers[num + 1];
          const sublayers = subLayer.data.map((value, index) => {
            return {
              objective,
              context,
              type,
              pattern,
              parentEach: subLayer.each,
              ...nextSublayerTemplate,
              compiled: false,
              parent: subLayer,
              compiledChildren: null,
              variables: {
                ...(subLayer.parent?.variables || {}),
                ...subLayer.variables,
                [subLayer.each]: value,
                [subLayer.each + "Index"]: index,
              },
            };
          });
          nextCompiledLayer.push(...sublayers);
          subLayer.compiledChildren.push(...sublayers);
        });
      }

      this.finishSublayerHooks.forEach((hook) => hook(num, index));
    }
    this.finishHooks.forEach((hook) => hook(num));
  }

  pause() {
    this.paused = true;
  }

  getLayerData() {
    const layer = this.compiledLayers[0] || this.layers[0];
    console.log(layer);

    return layer?.map((sublayer) => {
      const compressed = this.compress(sublayer);
      return compressed;
    });
  }

  compress(node, parent) {
    const { name, each, data, usage, question, input, prompt, parentEach } =
      node;

    const newNode = {
      name,
      each,
      data,
      usage,
      question,
      input,
      variables: {},
      prompt,
      parentEach,
    };

    for (const key in node.variables) {
      if (key !== node.name && node.variables[key]) {
        if (parent) {
          if (parent.variables[key] !== node.variables[key]) {
            newNode.variables[key] = node.variables[key];
          }
        } else {
          newNode.variables[key] = node.variables[key];
        }
      }
    }
    newNode.children = [];
    if (node.compiledChildren) {
      newNode.children =
        node.compiledChildren.length &&
        node.compiledChildren.map((child) => {
          return this.compress(child, node);
        });
    }
    return newNode;
  }

  async getAllLayers() {
    for (let index = 0; index < this.layers.length; index++) {
      console.log("getLayer ", index);
      if (this.paused) {
        console.log("Paused");
        break;
      }
      await this.getLayer(index);
    }
    this.finishAllHooks.forEach((hook) => hook());
  }

  onFinishLayer(func) {
    this.finishHooks.push(func);
  }

  onFinishAllLayers(func) {
    this.finishAllHooks.push(func);
  }

  onFinishSublayer(func) {
    this.finishSublayerHooks.push(func);
  }

  getUsage() {
    const compiledLayers = this.compiledLayers.filter((arr) => arr.length);
    this.compiledLayers = compiledLayers;
    this.compiledLayers.map((compiledLayer) => {
      if (Array.isArray(compiledLayer)) {
        compiledLayer.forEach(({ request }) => {});
      }
    });
  }

  getCompressedData() {
    const compiledLayers = this.compiledLayers;
    const data = compiledLayers[0].map((sublayer) => {
      const compressed = this.compress(sublayer);
      return compressed;
    });

    console.log("Root data", data);
    const compressed = compress(data, compressionSchema);
    console.log(
      "Root data compression",
      compressed,
      decompress(compressed, compressionSchema)
    );

    return data;
  }

  getData() {
    const flatData = {};
    const compiledLayers = this.compiledLayers.filter((arr) => arr.length);
    this.compiledLayers = compiledLayers;
    // console.log(compiledLayers);
    if (Array.isArray(compiledLayers[compiledLayers.length - 1])) {
      compiledLayers[compiledLayers.length - 1].forEach((layer) => {
        const { variables, data, name } = layer;
        if (!variables) {
          throw "no variables";
        }
        let children = {};
        let node = layer;
        let parent;
        while (node) {
          const { name, each, data, usage, question } = node;
          const newNode = { name, each, data, usage, question, variables: {} };
          for (const key in node.variables) {
            if (key !== node.name && node.variables[key]) {
              if (node.parent) {
                if (node.parent.variables[key] !== node.variables[key]) {
                  newNode.variables[key] = node.variables[key];
                }
              } else {
                newNode.variables[key] = node.variables[key];
              }
            }
          }
          parent = node;
          children = { ...newNode, children };
          node = node.parent;
        }
        this.layerVariables.reduce((path, vars) => {
          for (const { name, each } of vars) {
            if (variables[name]) {
              if (isNaN(variables[`${each}Index`])) {
                flatData[path + name] = variables[name];
                return path + name;
              }
              path = path + name + "." + variables[`${each}Index`] + ".";
              flatData[path + "value"] = variables[each];
            }
          }

          return path;
        }, "");
      });
      this.flatData = flatData;
      // unflatten
      const result = {};
      for (var i in flatData) {
        var keys = i.split(".");
        keys.reduce(function (r, e, j) {
          return (
            r[e] ||
            (r[e] = isNaN(Number(keys[j + 1]))
              ? keys.length - 1 === j
                ? flatData[i]
                : {}
              : [])
          );
        }, result);
      }
      this.result = result;
      return result;
    }
    return null;
  }
}
