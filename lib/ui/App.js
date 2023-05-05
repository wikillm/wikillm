/* eslint-disable react/react-in-jsx-scope */
import { Accordion, Button, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconGauge,
  IconHome2,
  IconSettings,
  IconTicket
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Header } from './elements/Header'
import { Side } from './elements/Side'
import { GptData } from 'lib/core/GptData'
import { interpolate } from 'lib/core/GptQuestion'
import bookGenerator from 'recipes/content-generator'
import ConfigForm from './ConfigForm'
import FormComponent from './InputForm'
import { TemplateForm } from './TemplateForm'
const Book = ()=>{}
const ls = () => {
  return new Proxy(
    {},
    {
      get (_, key) {
        return JSON.parse(localStorage.getItem(key) || '{}')
      },
      set (_, key, value) {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      }
    }
  )
}
const store = ls()

export const App = ({ user, template }) => {
  if (typeof window !== 'undefined') {
    if (!template) {
      const t = store.template
      if (!t || !t.children) {
        template = bookGenerator
        store.template = bookGenerator
      } else {
        template = t
      }
      // console.log('zzz', t)
    }
  }
  if (!template) {
    template = bookGenerator
    // store.template =bookGenerator
  }
  const [data, setData] = useState(null)
  const [inputData, setInputData] = useState(
    typeof window !== 'undefined' && store.inputData
  )
  const [currentTemplate, setCurrentTemplate] = useState(template)
  const [layerCosts, setLayerCosts] = useState([])
  const [layers, setLayers] = useState([])
  const [compiledLayers, setCompiledLayers] = useState([])
  const [layer, setLayer] = useState(0)
  const [running, setRunning] = useState(false)
  const [gpt, setGpt] = useState(false)

  useEffect(() => {
    store.inputData = inputData
    // console.log('input')
  }, [inputData])
  useEffect(() => {
    store.template = currentTemplate

    setGpt(
      new GptData({
        config: currentTemplate,
        variables: inputData
      })
    )
    setLayers(gpt.layers)
  }, [currentTemplate])
  function getData (variables) {
    const gptInstance = new GptData({
      config: currentTemplate,
      variables
    })
    setGpt(gptInstance)
    setLayers(gptInstance.layers)
    setRunning(true)
    gptInstance.getAllLayers()
    gptInstance.onFinishSublayer((num, index) => {
      const newData = gptInstance.getData()
      setCompiledLayers(gptInstance.compiledLayers)
      console.log('Finished Layer', num, newData)
      // const cost = gpt.compiledLayers[num].reduce(
      //   ({ cost }, layer) => {
      //     return { cost: cost + layer?.request?.usage.total_tokens };
      //   },
      //   {
      //     cost: 0
      //   }
      // );
      // const newLayerCosts = layerCosts;
      // // newLayerCosts[num] = cost;
      // setLayerCosts(newLayerCosts);
      setData(newData)
    })
    gptInstance.onFinishAllLayers(() => {
      // setRunning(false)
    })
  }
  const [opened, { open, close }] = useDisclosure(false)
  const [menuId, setMenuId] = useState()
  const [innerMenuId, setInnerMenuId] = useState('Input')
  // if(!template){return <div className='flex w-full'>'no template'</div>}
  return (
    <div className="flex w-full">
      <Side
        setMenuId={setMenuId}
        setInnerMenuId={setInnerMenuId}
        innerMenuId={innerMenuId}
        menuId={menuId}
        title={
          <div className="flex">
            <input style={{ width: 164 }} />
            <Button> {'>'} </Button>
          </div>
        }
        menu={[
          { icon: IconHome2, label: 'Home' },
          { icon: IconGauge, label: 'Dashboard' },
          // { icon: IconDeviceDesktopAnalytics, label: 'Analytics' },
          // { icon: IconCalendarStats, label: 'Releases' },
          // { icon: IconUser, label: 'Account' },
          // { icon: IconFingerprint, label: 'Security' },
          { icon: IconSettings, label: 'Settings' }
        ]}
        innerMenu={[
          { icon: IconHome2, label: 'Config' },
          { label: 'Template' },
          { label: 'Input' },

          {
            label: 'Instance'
          },
          {
            component: () => (
              <Group position="center">
                <Button
                  onClick={() => {
                    setInnerMenuId('Input')
                  }}
                >
                  New Instance
                </Button>
              </Group>
            )
          }
        ]}
      />
      <div className="w-full">
        <Header
          {...{
            user: {
              name: 'Jane Spoonfighter',
              email: 'janspoon@fighter.dev',
              image:
                'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80'
            },
            tabs: layers?.length
              ? layers.map((layer) =>
                layer.map(({ name }) => name).join(' &\n')
              )
              : []
          }}
          onTabChange={(index) => {
            // console.log('tab', index)
            setLayer(index)
          }}
        ></Header>
        {innerMenuId === 'Template' && (
          <TemplateForm
            data={{
              template: currentTemplate.children
            }}
            onSubmit={(data) => {
              setCurrentTemplate({
                ...currentTemplate,
                children: data.template
              })
            }}
          />
        )}
        {innerMenuId === 'Config' && (
          <ConfigForm
            data={currentTemplate}
            onSubmit={(data) => {
              setCurrentTemplate({
                ...data,
                children: currentTemplate.children
              })
            }}
          />
        )}
        {innerMenuId === 'Input' && template.inputSchema && (
          <FormComponent
            data={inputData}
            onChange={(formData) => {
              setInputData(formData)
            }}
            onSubmit={(formData) => {
              getData(formData)
            }}
            properties={template.inputSchema}
          />
        )}

        {innerMenuId === 'Instance' && (
          <Accordion defaultValue={'00'}>
            <Button
              onClick={() => {
                gpt.pause()
              }}
            >
              Pause
            </Button>

            {compiledLayers?.[layer]?.map(
              (
                { name, compiled, data, question, variables, prompt, request },
                subindex
              ) => {
                return (
                  <Accordion.Item key={subindex} value={`${layer}${subindex}`}>
                    <Accordion.Control>
                      Name: {name} {compiled && <IconTicket />}
                      <br />
                      Prompt:{' '}
                      {prompt || interpolate(question, variables)}
                    </Accordion.Control>
                    <Accordion.Panel style={{ background: 'gray' }}>
                      {request && <>Cost: {request.usage.total_tokens} </>}
                      <br />
                      Response:
                      {Array.isArray(data)
                        ? (
                            data?.join('\n')
                          )
                        : (
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                          )}
                    </Accordion.Panel>
                  </Accordion.Item>
                )
              }
            )}
          </Accordion>
        )}
        <>{data && <Book data={data} />}</>
      </div>
    </div>
  )
}

export default App