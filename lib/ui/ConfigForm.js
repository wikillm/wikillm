import Form from '@rjsf/core'
import React, { useState } from 'react'


const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    inputSchema: {
      type: 'object'

    },
    objective: {
      type: 'string'

    },
    pattern: {
      type: 'string'
    },
    type: {
      type: 'string'
    }

  }

}

export const ConfigForm = ({ onSubmit, data }) => {
  const [formData, setFormData] = useState(data)

  const handleSubmit = ({ formData }) => {
    onSubmit(formData)
  }

  return (
    <>

      <Form
        schema={schema}
        formData={formData}
        onChange={({ formData }) => {
          setFormData(formData)
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
              )
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
              )
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
              )
            }
          }
        }}
        noValidate={true}
      />
    </>
  )
}

export default ConfigForm
