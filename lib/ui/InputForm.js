import React, { useState } from "react";
import Form from '@rjsf/core';
import { useEffect } from "react";


const FormComponent = ({ onSubmit, properties, data, customSchema, onChange }) => {
  const [formData, setFormData] = useState(data||{});
  console.log(properties);
  const schema = customSchema ||  {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Config for ai guide generator",
    type: "object",
    properties,
    required: [
 
    ]
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
        id="template-form"
        schema={schema}
        formData={formData}
        onChange={({ formData }) => {
          setFormData(formData)
          onChange(formData)
        }}
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

