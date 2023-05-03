import React, { useState } from "react";
import Form from '@rjsf/mui';


const FormComponent = ({ onSubmit, properties, customSchema }) => {
  const [formData, setFormData] = useState({});
  console.log(properties);
  const schema = customSchema ||  {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Config for ai guide generator",
    type: "object",
    properties,
    required: [
 
    ]
  };

  const definitions = {};
  definitions.question = {
    title: "GPT request",
    type: "object",
    properties: {
      name: {
        type: "string"
      },
      each: {
        type: "string"
      },
      pattern: {
        type: "string"
      },
      loop: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "string"
            }
          },
          name: {
            type: "string"
          }
        },
        required: ["items", "name"]
      },
      question: {
        type: "string"
      },
      children: {
        type: "array",
        items: {
          $ref: "#/definitions/question"
        }
      }
    },
    required: ["name", "each", "question"]
  };
  definitions.request = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Question",
    type: "object",
    properties: {
      inputSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            type: {
              type: "string"
            }
          }
        }
      },
      objective: {
        type: "string"
      },
      pattern: {
        type: "string"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/definitions/question"
        }
      }
    },
    required: ["inputSchema", "objective", "pattern"]
  };
  const appSchema = {
    definitions,
    properties: {
      app: {
        $ref: "#/definitions/request"
      }
    }
  };

  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData);
    // console.log(formData);
  };

  return (
    <>
      <Form
        className="config-form"
        schema={schema}
        formData={formData}
        onChange={({ formData }) => setFormData(formData)}
        onSubmit={handleSubmit}
        validator={{}}
        focusOnFirstError={false}
        noHtml5Validate
        noValidate={true}
      />
    </>
  );
};

export default FormComponent;

