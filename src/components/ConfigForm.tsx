import Form from "@rjsf/core";
import React, { useState } from "react";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    inputSchema: {
      "ui:widget": (props) => {
        console.log("ui", props);
        return props.children;
      },
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["string", "number", "boolean", "array", "object"],
          },
          default: {
            type: "string",
          },
          enum: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
    objective: {
      type: "string",
    },
    pattern: {
      type: "string",
    },
    type: {
      type: "string",
    },
  },
};

export const ConfigForm = ({ onSubmit, data }) => {
  // const [formData, setFormData] = useState(data)

  const handleSubmit = ({ formData }) => {
    onSubmit(formData);
  };

  return (
    <>
      <Form
        schema={schema}
        formData={data}
        onChange={({ formData }) => {
          // setFormData(formData)
          onSubmit(formData);
        }}
        onSubmit={handleSubmit}
        validator={{}}
        uiSchema={{
          objective: {
            "ui:widget": "textarea",
          },
          pattern: {
            "ui:widget": "textarea",
          },
          type: {
            "ui:widget": "textarea",
          },
        }}
        noValidate={true}
      />
    </>
  );
};

export default ConfigForm;
