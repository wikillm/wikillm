import React, { useState } from "react";
import Form from "@rjsf/core";
const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    template: {
      type: "array",
      items: {
        $ref: "#/definitions/Layer",
      },
    },
  },
  definitions: {
    Layer: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        question: {
          type: "string",
        },

        hasOverrides: {
          enum: ["Yes"],
        },
        hasLoop: {
          enum: ["Yes"],
        },
        hasChildren: {
          enum: ["Yes"],
        },
      },
      required: ["name", "question"],
      dependencies: {
        hasChildren: {
          properties: {
            each: {
              type: "string",
            },
            children: {
              type: "array",
              items: {
                $ref: "#/definitions/Layer",
              },
            },
          },
        },
        hasOverrides: {
          properties: {
            type: {
              type: "string",
            },
            pattern: {
              type: "string",
            },
            context: {
              type: "string",
            },
          },
        },
        hasLoop: {
          properties: {
            loop: {
              type: "object",
              properties: {
                items: {
                  additionalProperties: true,
                },
                name: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  },
};

const bookGenerator = {
  template: [
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
          `,
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
                        `,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
          "seventh",
        ],
        name: "position",
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
              "seventh",
            ],
            name: "position",
          },

          question: `Provide the \${position} 100 entries in a list
  of 700 attributes under the category \${category} you know sorted in alphabetical order`,
        },
      ],
    },
  ],
};
function AddButton(props) {
  const { icon, iconType, ...btnProps } = props;
  return <button {...btnProps}>{icon} Add</button>;
}
const addDepth = (obj, field, depth) => {
  let innerObj = obj;
  for (let index = 0; index < depth; index++) {
    let innerinnerObj = innerObj;
    innerObj[field] = {
      items: {
        ...innerinnerObj,
      },
    };
    innerObj = innerinnerObj;
  }
  return obj;
};
const uiSchema = {
  "ui:order": [
    "name",
    "each",
    "question",
    "hasLoop",
    "loop",
    "hasOverrides",
    "objective",
    "context",
    "type",
    "pattern",
    "hasChildren",
    "children",
  ],

  name: {
    classNames: "child-name",
    "ui:placeholder": "Enter name",
  },
  each: {
    classNames: "child-each",
    "ui:placeholder": "Enter each",
  },
  question: {
    classNames: "child-question",
    "ui:placeholder": "Enter question",
    "ui:widget": (props) => {
      return (
        <textarea
          type="text"
          rows={5}
          cols={50}
          className="custom"
          value={props.value}
          required={props.required}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    },
  },
  hasChildren: {
    "ui:widget": (props) => {
      console.log("ppp", props);

      const data = props.formContext;
      const path = props.id.split("_");
      const hasField = path.pop();
      path.push("children");
      let currentData = data;
      for (const key of path) {
        if (!currentData || !currentData[key]) {
          break;
        }
        console.log("ppp", currentData, key);
        currentData = currentData[key];
      }
      if (currentData && currentData.length) {
        return props.value !== "Yes" && props.onChange("Yes");
      }
      return <input {...props} />;
    },
  },
  children: {
    classNames: "child-children",
    "ui:options": {
      addButtonText: "Add child",
      orderable: false,
      removable: false,
    },
    items: {},
  },
  type: {
    classNames: "child-type",
    "ui:placeholder": "Enter type",
    "ui:widget": (props) => {
      return (
        <textarea
          type="text"
          rows={3}
          cols={50}
          className="custom"
          value={props.value}
          required={props.required}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    },
  },
  pattern: {
    classNames: "child-pattern",
    "ui:placeholder": "Enter pattern",
    "ui:widget": (props) => {
      return (
        <textarea
          type="text"
          rows={3}
          cols={50}
          className="custom"
          value={props.value}
          required={props.required}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    },
  },
  context: {
    classNames: "child-context",
    "ui:placeholder": "Enter context",
    "ui:widget": (props) => {
      return (
        <textarea
          type="text"
          rows={3}
          cols={50}
          className="custom"
          value={props.value}
          required={props.required}
          onChange={(event) => props.onChange(event.target.value)}
        />
      );
    },
  },
  loop: {
    classNames: "child-loop",
    "ui:order": ["name", "items"],

    items: {
      classNames: "child-loop-item",
      name: {
        classNames: "child-loop-item-name",
        "ui:placeholder": "Enter name",
        "ui:widget": (props) => {
          return (
            <textarea
              type="text"
              rows={1}
              cols={50}
              className="custom"
              value={props.value}
              required={props.required}
              onChange={(event) => props.onChange(event.target.value)}
            />
          );
        },
      },
      items: {
        classNames: "child-loop-item-items",
        "ui:options": {
          addButtonText: "Add item",
          orderable: false,
          removable: false,
        },
      },
    },
  },
};
function ArrayFieldTitleTemplate(props) {
  const { description, idSchema } = props;
  console.log("scs", idSchema);
  // const id = titleId(idSchema);
  // return <h1 >Layer </h1>;
}
function TitleFieldTemplate(props) {
  const { id, required, title } = props;
  console.log("props", props);
  return <header id={id}></header>;
}
export const TemplateForm = ({ onSubmit, data }) => {
  const [formData, setFormData] = useState(data || bookGenerator);
  console.log(data, "sdsdsd");
  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData);
    // console.log(formData);
  };
  console.log(addDepth(uiSchema, "children", 2));
  return (
    <>
      {/* <JSONEditor
  data={formData}
  collapsible
  onChange={()=>{}}
/> */}
      <Form
        schema={schema}
        formData={formData}
        onChange={({ formData }) => {
          setFormData(formData);
          onSubmit(formData);
        }}
        onSubmit={handleSubmit}
        validator={{}}
        formContext={{ root: formData }}
        templates={{
          ButtonTemplates: { AddButton },
          ArrayFieldTitleTemplate,
          TitleFieldTemplate,
        }}
        uiSchema={{
          template: {
            "ui:classNames": "child-template",
            "ui:options": {
              addButtonText: "Add child",
              orderable: false,
              removable: false,
            },
            items: addDepth(uiSchema, "children", 2),
          },
        }}
        noValidate={true}
      />
    </>
  );
};

export default TemplateForm;
console.log(JSON.stringify(schema, null, 2));
