import React, { useState, useEffect } from 'react'
import Form from '@rjsf/core'

const FormComponent = ({ onSubmit, properties, data, customSchema, onChange, Actions }) => {
  console.log(properties)
  const schema = customSchema || {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Config for ai guide generator',
    type: 'object',
    properties,
    required: [

    ]
  }

  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData)
    // console.log(formData);
  }

  return (
    <>
      <Form
        className="config-form"
        id="template-form"
        schema={schema}
        formData={data}
        onChange={({ formData }) => {
          onChange(formData)
        }}
        templates={{
          ButtonTemplates: {
            SubmitButton: () => {
              return (
              <button type='submit'>
                Run
              </button>
              )
            }
          }
        }}
        onSubmit={handleSubmit}
        validator={{}}
        focusOnFirstError={false}
        noHtml5Validate
        noValidate={true}
      >{Actions && <Actions/>}</Form>
    </>
  )
}

export default FormComponent
