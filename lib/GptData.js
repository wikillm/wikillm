import GptQuestion  from "./GptQuestion";
const { Configuration, OpenAIApi } = require("openai");

export class GptData {
  constructor({ config, variables }) {
    this.config = config;
    this.questions = config.children;
    console.log("config", config);
    let nodes = this.questions;
    this.layers = [];
    this.compiledLayers = [{}];
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
    this.variables = variables;

    const configuration = new Configuration({
      apiKey: this.variables.apikey || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    });
    this.openai = new OpenAIApi(configuration);
    console.log("layers", this.layers);
    this.finishHooks = [];
    this.getLayer = this.getLayer.bind(this);
    this.getAllLayers = this.getAllLayers.bind(this);
    this.getData = this.getData.bind(this);
    this.onFinishLayer = this.onFinishLayer.bind(this);
  }
  async getAllLayers() {
    for (let index = 0; index < this.layers.length; index++) {
      console.log("getLayer ", index);
      await this.getLayer(index);
    }
  }
  onFinishLayer(func) {
    this.finishHooks.push(func);
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
  getData() {
    const flatData = {};
    const compiledLayers = this.compiledLayers.filter((arr) => arr.length);
    this.compiledLayers = compiledLayers;
    // console.log(compiledLayers);

    if (Array.isArray(compiledLayers[compiledLayers.length - 1])) {
      compiledLayers[compiledLayers.length - 1].forEach(({ variables }) => {
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
      var result = {};
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
  async getLayer(num) {
    const nodes = this.layers[num];
    if (num === 0) {
      let index = -1;
      for (const node of nodes) {
        index++;
        // console.log("node", node);
        node.pattern = node.pattern || this.config.pattern;
        node.objective = node.objective || this.config.objective;
        node.type = node.type || this.config.type;
        this.compiledLayers[num][index] = this.layers[num][index];

        const { data, variables, request, prompt } = await GptQuestion({
          node,
          variables: {
            ...this.variables,
            ...node.variables
            // [previousLayer.each]: v,
            // _parent: previousLayer.each
          },
          openai: this.openai
        });
        // console.log("newvars", variables);
        if (!node.variables) {
          node.variables = {};
        }
        node.variables = { ...variables };

        // console.log(this.layers);
        this.layers[num][index].variables[node.name] = data;
        this.compiledLayers[num][index] = this.layers[num][index];
        this.compiledLayers[num][index].data = data;
        this.compiledLayers[num][index].prompt = prompt;
        // console.log("Added result in current layer", this.layers[num][index]);
        const nextLayerNodes = this.layers[num + 1];
        if (nextLayerNodes && Array.isArray(data)) {
          const nextLayers = [];
          // if (!Array.isArray(nextLayer)) {
          //   layers[num + 1] = [];
          // }

          nextLayerNodes.forEach((nextLayer) => {
            nextLayers.push(
              ...data.map((d, index) => {
                return {
                  ...nextLayer,
                  parent: node,
                  compiled: false,

                  variables: {
                    ...node.variables,
                    ...this.variables,
                    [node.each]: d,
                    [node.name]: data,
                    [node.each + "Index"]: index
                  }
                };
              })
            );
          });
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
          ];

          this.compiledLayers[num + 1] = nextLayers;
        }
        console.log(data);
      }
    } else {
      const nextLayerNodes = this.layers[num + 1];
      if (!nextLayerNodes) {
        console.log("Layer ", num + 1, "not found");
      }
      this.compiledLayers[num + 1] = [];
      let index = -1;
      for (const subLayer of this.compiledLayers[num]) {
        index++;
        console.log("running sublayer", subLayer);
        subLayer.pattern = subLayer.pattern || this.config.pattern;
        subLayer.objective = subLayer.objective || this.config.objective;
        subLayer.type = subLayer.type || this.config.type;
        const { data, request } = await GptQuestion({
          node: subLayer,
          variables: {
            ...subLayer.variables,
            ...this.variables
          },
          openai: this.openai
        });
        subLayer.data = data;
        subLayer.variables[subLayer.name] = data;
        this.compiledLayers[num][index].request = request;
        this.compiledLayers[num][index].compiled = true;
        this.compiledLayers[num][index].variables[subLayer.name] = data;
        // console.log(
        //   "Added result in current sublayer",
        //   this.compiledLayers[num][index]
        // );

        if (nextLayerNodes && Array.isArray(data)) {
          nextLayerNodes.forEach((nextLayer) => {
            this.compiledLayers[num + 1].push(
              ...data.map((d, index) => {
                return {
                  ...nextLayer,
                  compile: true,
                  parent: subLayer,

                  variables: {
                    ...this.variables,
                    [subLayer.each]: d,
                    [subLayer.name]: data,
                    [subLayer.each + "Index"]: index,
                    ...subLayer.variables
                  }
                };
              })
            );
          });
        }
      }
    }
    this.finishHooks.forEach((hook) => hook(num));
    return this.layers[num];
  }
}
