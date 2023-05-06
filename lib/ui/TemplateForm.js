import React, { useState } from 'react'
import Form from '@rjsf/core'
import bookGenerator from 'recipes/content-generator'

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    template: {
      type: 'array',
      items: {
        $ref: '#/definitions/Layer'
      }
    }
  },
  definitions: {
    Layer: {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        question: {
          type: 'string'
        },

        hasOverrides: {
          enum: ['Yes']
        },
        hasLoop: {
          enum: ['Yes']
        },
        hasChildren: {
          enum: ['Yes']
        }
      },
      required: ['name', 'question'],
      dependencies: {
        hasChildren: {
          properties: {
            each: {
              type: 'string'
            },
            children: {
              type: 'array',
              items: {
                $ref: '#/definitions/Layer'
              }
            }
          }
        },
        hasOverrides: {
          properties: {
            type: {
              type: 'string'
            },
            pattern: {
              type: 'string'
            },
            context: {
              type: 'string'
            }
          }
        },
        hasLoop: {
          properties: {
            loop: {
              type: 'object',
              properties: {
                items: {
                  additionalProperties: true
                },
                name: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  }
}


function AddButton (props) {
  const { icon, iconType, ...btnProps } = props
  return <button {...btnProps}>{icon} Add</button>
}
const addDepth = (obj, field, depth) => {
  let innerObj = obj
  for (let index = 0; index < depth; index++) {
    const innerinnerObj = innerObj
    innerObj[field] = {
      items: {
        ...innerinnerObj
      }
    }
    innerObj = innerinnerObj
  }
  return obj
}
const HasField = (props) => {

  const data = props.formContext
  const path = props.id.split('_')
  const hasField = path.pop()
  const fieldName = hasField.split('has')[1].toLowerCase()
  path.push(fieldName)
  let currentData = data
  console.log(data)
  for (const key of path) {
    if (!currentData || !currentData[key]) {
      break
    }
    currentData = currentData[key]
  }
  if (currentData && currentData.length) {
    props.value !== 'Yes' && props.onChange('Yes')
  }
  return <select onChange={(e)=>{props.onChange(e.target.value)}} value={props.value} >
    <option ></option>
    <option value="Yes">Yes</option>
  </select>
}

const uiSchema = {
  'ui:order': [
    'name',
    'each',
    'question',
    'hasLoop',
    'loop',
    'hasOverrides',
    'objective',
    'context',
    'type',
    'pattern',
    'hasChildren',
    'children'
  ],

  name: {
    classNames: 'child-name',
    'ui:placeholder': 'Enter name'
  },
  each: {
    classNames: 'child-each',
    'ui:placeholder': 'Enter each'
  },
  question: {
    classNames: 'child-question',
    'ui:placeholder': 'Enter question',
    'ui:widget': (props) => {
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
      )
    }
  },
  hasOverrides: {
    'ui:widget': HasField

  },
  hasLoop: {
    'ui:widget': HasField

  },
  hasChildren: {
    'ui:widget': HasField
  },
  children: {
    classNames: 'child-children',
    'ui:options': {
      addButtonText: 'Add child',
      orderable: false,
      removable: false
    },
    items: {}
  },
  type: {
    classNames: 'child-type',
    'ui:placeholder': 'Enter type',
    'ui:widget': (props) => {
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
      )
    }
  },
  pattern: {
    classNames: 'child-pattern',
    'ui:placeholder': 'Enter pattern',
    'ui:widget': (props) => {
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
      )
    }
  },
  context: {
    classNames: 'child-context',
    'ui:placeholder': 'Enter context',
    'ui:widget': (props) => {
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
      )
    }
  },
  loop: {
    classNames: 'child-loop',
    'ui:order': ['name', 'items'],

    items: {
      classNames: 'child-loop-item',
      name: {
        classNames: 'child-loop-item-name',
        'ui:placeholder': 'Enter name',
        'ui:widget': (props) => {
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
          )
        }
      },
      items: {
        classNames: 'child-loop-item-items',
        'ui:options': {
          addButtonText: 'Add item',
          orderable: false,
          removable: false
        }
      }
    }
  }
}
function ArrayFieldTitleTemplate (props) {
  const { description, idSchema } = props
  console.log('scs', idSchema)
  // const id = titleId(idSchema);
  // return <h1 >Layer </h1>;
}
function TitleFieldTemplate (props) {
  const { id, required, title } = props
  console.log('props', props)
  return <header id={id}></header>
}
export const TemplateForm = ({ onSubmit, data }) => {
  const [formData, setFormData] = useState(data || bookGenerator)
  console.log(data, 'sdsdsd')
  // console.log(JSON.stringify(schemas));
  const handleSubmit = ({ formData }) => {
    onSubmit(formData)
    // console.log(formData);
  }
  console.log(addDepth(uiSchema, 'children', 2))
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
          setFormData(formData)
          onSubmit(formData)
        }}
        onSubmit={handleSubmit}
        validator={{}}
        formContext={{ root: formData }}
        templates={{
          ButtonTemplates: { AddButton },
          ArrayFieldTitleTemplate,
          TitleFieldTemplate
        }}
        uiSchema={{
          template: {
            'ui:classNames': 'child-template',
            'ui:options': {
              addButtonText: 'Add child',
              orderable: false,
              removable: false
            },
            items: addDepth(uiSchema, 'children', 2)
          }
        }}
        noValidate={true}
      />
    </>
  )
}

export default TemplateForm
console.log(JSON.stringify(schema, null, 2))
