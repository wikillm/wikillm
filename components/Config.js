





















import React, { useState } from "react";
import Form from '@rjsf/mui';
const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "inputSchema": {
      "type": "object",
      "properties": {
        "apikey": {
          "type": "string",
          "title": "OpenAI api key"
        }
        // add rest of json schema fields here
      }
    },
    "objective": {
      "type": "string"
    },
    "pattern": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "children": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Layer"
      }
    }
  },
  "definitions": {
    "Layer": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "each": {
          "type": "string"
        },
        "loop": {
          "type": "object",
          "properties": {
            "items": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "name": {
              "type": "string"
            }
          }
        },
        "question": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "pattern": {
          "type": "string"
        },
        "context": {
          "type": "string"
        },
        "children": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Layer"
          }
        }
      },
      "required": ["name"]
    }
  }
}

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
export const ConfigForm = ({ onSubmit,  }) => {
  const [formData, setFormData] = useState(bookGenerator);
  
  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData);
    // console.log(formData);
  };

  return (
    <>
      <Form
        schema={schema}
        formData={formData}
        onChange={({ formData }) => setFormData(formData)}
        onSubmit={handleSubmit}
        validator={{}}
        noValidate={true}
      />
    </>
  );
};

export default ConfigForm;
