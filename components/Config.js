
















import {JSONEditor} from 'react-json-editor-viewer';





import React, { useState } from "react";
import Form from '@rjsf/core';
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

};

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "inputSchema": {
      "type": "object",
  
    },
    "objective": {
      "type": "string",
      
    },
    "pattern": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
 
  },

}


export const ConfigForm = ({ onSubmit, data }) => {
  const [formData, setFormData] = useState(data);
  
  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData);
    // console.log(formData);
  };

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
        onChange={({ formData }) => {setFormData(formData)
        onSubmit(formData)
        }}
        onSubmit={handleSubmit}
        validator={{}}
        uiSchema={{

          objective: {
            'ui:widget': (props) => {
              return (
                <textarea
                  type='text'
                  rows={3}
                  cols={50}
                  className='custom'
                  value={props.value}
                  required={props.required}
                  onChange={(event) => props.onChange(event.target.value)}
                />
              );
            }
          },
          pattern: {
            'ui:widget': (props) => {
              return (
                <textarea
                  type='text'
                  rows={3}
                  cols={50}
                  className='custom'
                  value={props.value}
                  required={props.required}
                  onChange={(event) => props.onChange(event.target.value)}
                />
              );
            }
          },
          type: {
            'ui:widget': (props) => {
              return (
                <textarea
                  type='text'
                  rows={3}
                  cols={50}
                  className='custom'
                  value={props.value}
                  required={props.required}
                  onChange={(event) => props.onChange(event.target.value)}
                />
              );
            }
          }
        }}
        noValidate={true}
      />
    </>
  );
};

export default ConfigForm;
