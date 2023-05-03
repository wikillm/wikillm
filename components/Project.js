import { useRef, useState } from "react";
import { GptData } from "../lib/GptData";
import FormComponent from "../components/Form";
// import Book from "./components/Book";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography
} from "@mui/material";
import { interpolate } from "../lib/GptQuestion";
import Book from "./Book";
import ConfigForm from "./Config";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
// create a json schema that describes any plant with 200 attributes

const subjectAttributeGenerator = {
  inputSchema: {},
  objective: `create a list of attribute labels that describes any plant `,
  pattern: `'["\${each}1", "\${each}2"]'`,
  type: "a json array of single line strings",
  questions: [
    {
      name: "attributes",
      each: "attribute",
      question: `with the first 100 of 1000 attributes,`
      // children: [
      //   {
      //     name: "plants",
      //     each: "plant",
      //     question: `
      // Provide 3 plants for plant family "\${family}"`,
      //     children: [
      //       {
      //         name: "attributes",
      //         each: "attribute",
      //         question: `Provide 10 attribute labels
      //         combining maximum 2 words for each label
      //          that can describe characteristics of the
      //         "\${plant}" under plant family "\${family}".`,
      //         children: [
      //           {
      //             name: "enums",
      //             each: "enum",
      //             question: `Provide 10 attribute enum values
      //         combining maximum 2 words for each enum value
      //          that can describe the different choices of the
      //          attribute "\${attribute}" that is used for plants
      //          under plant family "\${family}".`
      //           }
      //         ]
      //       }
      //     ]
      //   }
      // ]
    }
  ]
};
const bookGenerator = {
  inputSchema: {
    apikey: {
      title: "OpenAI api key",
      type: "string"
    },
    guide: { type: "string", default: "everything", title: "guide about" },

    chaptersLength: { type: "number", default: 2 },
    maxCategories: { type: "number", default: 700 },
    maxSubCategories: { type: "number", default: 700 },
    subchaptersLength: { type: "number", default: 2 },
    questionsLength: { type: "number", default: 2 },
    paragraphsLength: { type: "number", default: 2 }
  },
  objective: `In an encyclopedia about  
  \${guide}.`,
  pattern: `'["1. \${each}1", "2. \${each}2"]'`,
  type: "a json array of single line strings",
  children: [
    {
      name: "chapters",
      each: "chapter",

      question: `Provide \${chaptersLength} chapter titles for this guide.`,
      children: [
        {
          name: "imageprompts",
          each: "imageprompt",
          type: " ",
          pattern: " ",
          question: `
          Provide a prompt to be given to an image generator like openai dall-e
           for the chapter with title "\${chapter}"
          `
        },
        {
          name: "subchapters",
          each: "subchapter",
          question: `
                 For chapter "\${chapter}" provide \${subchaptersLength} subchapter titles`,
          children: [
            {
              name: "questions",
              each: "question",
              context: `Under the chapter "\${chapter}":`,
              question: `For subchapter "\${subchapter}" provide \${questionsLength} questions`,
              children: [
                {
                  name: "paragraphs",
                  each: "paragraph",
                  question: `Under the chapter "\${chapter}" and the subchapter
                    "\${subchapter}":
                    For question "\${question}" provide a detailed answer split into \${paragraphsLength} paragraphs`,
                  children: [
                    {
                      name: "metrics",
                      each: "metric",
                      context: `Under the chapter "\${chapter}"`,
                      question: `and subchapter "\${subchapter}"
                        and for the question "\${question}"
                        with answer
                        """
                        \${paragraph}
                        """
                        provide all possible key points
                        included in the answer.
                        `
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
  //   {
  //     name: "categories",
  //     each: "category",
  //     loop: {
  //       items: [
  //         "first",
  //         "second",
  //         "third",
  //         "fourth",
  //         "fifth",
  //         "sixth",
  //         "seventh"
  //       ],
  //       name: "position"
  //     },
  //     question: `Provide the \${position} 100 entries in a list
  // of 700 categories for attributes you know sorted in alphabetical order`,
  //     children: [
  //       {
  //         name: "attributes",
  //         each: "attribute",
  //         loop: {
  //           items: [
  //             "first",
  //             "second",
  //             "third",
  //             "fourth",
  //             "fifth",
  //             "sixth",
  //             "seventh"
  //           ],
  //           name: "position"
  //         },

  //         question: `Provide the \${position} 100 entries in a list
  // of 700 attributes under the category \${category} you know sorted in alphabetical order`
  //       }
  //     ]
  //   }
  ]
};
const parametersGenerator = {
  inputSchema: {
    apikey: {
      title: "OpenAI api key",
      type: "string"
    },
    guide: { type: "string", default: "any plant", title: "guide about" },

    chaptersLength: { type: "number", default: 2 },
    maxCategories: { type: "number", default: 700 },
    maxSubCategories: { type: "number", default: 700 },
    subchaptersLength: { type: "number", default: 2 },
    questionsLength: { type: "number", default: 2 },
    paragraphsLength: { type: "number", default: 2 }
  },
  objective: `Create a list of categorized attribute labels that describes
  \${guide}.`,
  pattern: `'["\${each}1", "\${each}2"]'`,
  type: "a json array of single line strings",
  questions: [
    {
      name: "categories",
      each: "category",
      loop: {
        items: [
          "first",
          "second",
          "third",
          "fourth",
          "fifth",
          "sixth",
          "seventh"
        ],
        name: "position"
      },
      question: `Provide the \${position} 100 entries in a list
of 700 categories for attributes you know sorted in alphabetical order`,
      children: [
        {
          name: "attributes",
          each: "attribute",
          loop: {
            items: [
              "first",
              "second",
              "third",
              "fourth",
              "fifth",
              "sixth",
              "seventh"
            ],
            name: "position"
          },

          question: `Provide the \${position} 100 entries in a list
of 700 attributes under the category \${category} you know sorted in alphabetical order`
        }
      ]
    }
  ]
};
export default function Project() {
  const [data, setData] = useState(null);
  const [inputData, setInputData] = useState(null);

  const [layerCosts, setLayerCosts] = useState([]);
  const [layers, setLayers] = useState([]);
  const [compiledLayers, setCompiledLayers] = useState([]);
  const guideRef = useRef(null);
  const [layer, setLayer] = useState(0);
  const [sublayer, setSublayer] = useState(0);

  function getData({
    guide,
    questionsLength,
    paragraphsLength,
    chaptersLength,
    subchaptersLength
  }) {
    const gpt = new GptData({
      config: bookGenerator,
      variables: {
        guide,
        questionsLength,
        paragraphsLength,
        chaptersLength,
        subchaptersLength
      }
    });
    setLayers(gpt.layers);
    gpt.getAllLayers();
    gpt.onFinishLayer((num) => {
      const newData = gpt.getData();
      setCompiledLayers(gpt.compiledLayers);
      console.log("Finished Layer", num, newData);
      const cost = gpt.compiledLayers[num].reduce(
        ({ cost }, layer) => {
          return { cost: cost + layer.request.usage.total_tokens };
        },
        {
          cost: 0
        }
      );
      const newLayerCosts = layerCosts;
      newLayerCosts[num] = cost;
      setLayerCosts(newLayerCosts);
      setData(newData);
    });
  }
  return (
    <>
        
        <FormComponent
        onSubmit={(formData) => {
          setInputData(formData);
          getData(formData);
        }}
        properties={bookGenerator.inputSchema}
      />
      <h1>A book about {inputData?.guide}</h1>
      <h6>Costs</h6>
      <ol>
        {layerCosts.map(({ cost }, index) => {
          return <li>{(cost * 0.0002) / 1000}$</li>;
        })}
      </ol>
      Total:
      {layerCosts.reduce((total, { cost }, index) => {
        return ((total + cost) * 0.0002) / 1000;
      }, 0)}
      <Tabs
        value={layer}
        onChange={(e, v) => {
          setLayer(v);
        }}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {layers.map((sublayers) => {
          return <Tab label={sublayers.map(({ name }) => name).join("&")} />;
        })}
      </Tabs>
      {layers.map((_, layerIndex) => {
        if (
          !compiledLayers?.[layerIndex] ||
          !compiledLayers?.[layerIndex].length
        ) {
          return null;
        }
        return (
          <div>
            <TabPanel value={layer} index={layerIndex}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  height: 224
                }}
              >
                {compiledLayers?.[layerIndex]?.map(
                  (
                    { name, compiled, data, question, variables, prompt },
                    subindex
                  ) => {
                    return (
                      <Accordion>
                        <AccordionSummary
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>
                            {interpolate(question, variables)}
                            {prompt}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <pre>
                            {Array.isArray(data)
                              ? data?.join("\n")
                              : JSON.stringify(data)}
                          </pre>
                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                )}
              </Box>
            </TabPanel>
          </div>
        );
      })}
      {data && <Book data={data} />}
    </>
  );
}
