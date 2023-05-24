// @ts-nocheck
/* eslint-disable */
import Form from '@rjsf/core';
import React from 'react';

const FormComponent = ({
  onSubmit,
  properties,
  uiSchema,
  data,
  customSchema,
  onChange,
  Actions,
}:any) => {
  console.log(properties);
  const schema = customSchema || {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Config for ai guide generator',
    type: 'object',
    properties,
    required: [],
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
        uiSchema={uiSchema}
        formData={data}
        onChange={({ formData }) => {
          onChange(formData);
        }}
        templates={{
          ButtonTemplates: {
            SubmitButton: () => {
              return <button type="submit">Run</button>;
            },
          },
        }}
        onSubmit={handleSubmit}
        validator={{}}
        focusOnFirstError={false}
        noHtml5Validate
        noValidate
      >
        {Actions && <Actions />}
      </Form>
    </>
  );
};

export default FormComponent;
