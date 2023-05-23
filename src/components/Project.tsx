/* eslint-disable react/react-in-jsx-scope */
import { Button, Card, CardSection } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconEdit,
  IconHome2,
  IconSquareCheckFilled,
  IconTrash,
} from "@tabler/icons-react";
import { GptData, baseNodeSchema, baseNodeUISchema } from "lib/GptData";
import { useContext, useEffect, useState } from "react";
import generator from "recipes/plants-db-generator";
import { Header } from "./elements/Header";
import { Side } from "./elements/Side";
import FormComponent from "./InputForm";
import { TemplateForm } from "./TemplateForm";

import { addProject } from "../api/Store";
import Finder from "./Finder";
import { RowCard } from "./elements/RowCard";
import UserContext from "./UserContext";
import localforage from "localforage";
const memory = {
  getItem(key) {
    return memory[key];
  },
  setItem(key, value) {
    memory[key] = value;
  },
};
const types = {
  memory,
};
const ls = (type) => {
  return new Proxy(
    {},
    {
      get(_, key) {
        let store = types[type];

        if (typeof window !== "undefined" && !store) {
          store = localStorage;
        }
        const data = JSON.parse(store?.getItem(key) || null);
        return data;
      },
      set(_, key, value) {
        const store = types[type] || localStorage;

        store.setItem(key, JSON.stringify(value));
        return true;
      },
    }
  );
};
const store = ls("memory");
const db = ls();

export const Project = ({ template, project }) => {
  console.log("project", project);
  if (typeof window !== "undefined") {
    if (!template) {
      const t = store.template;
      if (!t || !t.children) {
        template = generator;
        store.template = generator;
      } else {
        template = t;
      }
      // console.log('zzz', t)
    }
  }
  if (!template) {
    template = generator;
    // store.template =bookGenerator
  }
  const [data, setData] = useState(null);
  const [inputData, setInputData] = useState(
    typeof window !== "undefined" && store.inputData
  );
  const [currentTemplate, setCurrentTemplate] = useState(template);
  const [layerCosts, setLayerCosts] = useState([]);
  const [layers, setLayers] = useState([]);
  const [layerData, setLayerData] = useState(db.lastLayerData);
  const [compiledLayers, setCompiledLayers] = useState([]);
  const [layer, setLayer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gpt, setGpt] = useState(null);
  console.log(layerData);
  useEffect(() => {
    store.inputData = inputData;
    // console.log('input')
  }, [inputData]);
  useEffect(() => {
    store.template = currentTemplate;
    const instance = new GptData({
      config: currentTemplate,
      variables: inputData,
    });
    setGpt(instance);
    setLayers(instance.layers);
  }, [currentTemplate]);
  function getData(variables) {
    const gptInstance = new GptData({
      config: currentTemplate,
      variables,
    });
    setGpt(gptInstance);
    setLayers(gptInstance.layers);
    setRunning(true);
    gptInstance.getAllLayers();
    gptInstance.onFinishSublayer((num, index) => {
      console.log("finishSublayer", gptInstance.compiledLayers[num][index]);
      // const newData = gptInstance.getCompressedData()
      // setCompiledLayers(gptInstance.compiledLayers)
      // console.log('Finished Layer', num, newData)
      const data = gptInstance.getLayerData();
      setLayerData(data);
      db.lastLayerData = data;
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
      // setData(newData)
    });
    // gptInstance.onFinishAllLayers(() => {
    //   // setRunning(false)
    // })
  }
  const user = useContext(UserContext);
  const [opened, { open, close }] = useDisclosure(false);
  const [menuId, setMenuId] = useState();
  const [innerMenuId, setInnerMenuId] = useState("Runner");
  // if(!template){return <div className='flex w-full'>'no template'</div>}
  return (
    <div className="flex w-full h-fit">
      <Side
        setMenuId={setMenuId}
        setInnerMenuId={setInnerMenuId}
        innerMenuId={innerMenuId}
        menuId={menuId}
        title={
          <form
            onSubmit={(e) => {
              console.log(e.target);
              e.preventDefault();
              addProject(e.target.name);
            }}
            className="flex"
          >
            <input name={"name"} style={{ width: 50 }} />
            <Button type="submit"> {">"} </Button>
          </form>
        }
        menu={[{ icon: IconHome2, label: "Home" }]}
        innerMenu={[
          { label: "Template" },

          { label: "Runner" },
          {
            label: "Viewer",
          },
        ]}
      />
      <div className="w-full">
        <Header
          {...{
            ...user,
            tabs: [],
          }}
          onTabChange={(index) => {
            // console.log('tab', index)
            // setLayer(index)
          }}
        ></Header>
        {/* <FinderDemo /> */}
        {innerMenuId === "Template" && (
          <TemplateForm
            data={{
              template: currentTemplate.children,
            }}
            onSubmit={(data) => {
              setCurrentTemplate({
                ...currentTemplate,
                children: data.template,
              });
            }}
          />
        )}

        {innerMenuId === "Runner" && (
          <>
            <FormComponent
              data={inputData}
              onChange={(formData) => {
                setInputData(formData);
              }}
              onSubmit={(formData) => {
                getData(formData);
              }}
              properties={template.input}
            />
            {layerData && (
              <div className="flex">
                <Finder
                  data={layerData}
                  // value={value}
                  selectIndexes={layer.path}
                  Renderer={({ onClick, value, isEnd, path }) => {
                    console.log(value, isEnd);
                    return (
                      <div>
                        <RowCard
                          subtitle={value.name}
                          title={
                            (value.parentEach || "Root") +
                            (value.variables[value.parentEach]
                              ? ":" + value.variables[value.parentEach]
                              : "")
                          }
                          content={value.question}
                          menu={[
                            {
                              label: "Edit",
                              onClick: () => {},
                              icon: <IconEdit />,
                            },
                            {
                              label: "Delete",
                              onClick: () => {},
                              icon: <IconTrash />,
                            },
                          ]}
                          onClick={onClick}
                          {...value}
                        />
                      </div>
                    );
                  }}
                  onChange={(value, isEnd, path) => {
                    console.log(value, isEnd, path);
                    setLayer({
                      path,
                      value,
                    });
                  }}
                />

                {layer?.value && (
                  <div style={{ width: "30vw" }}>
                    <FormComponent
                      data={layer.value}
                      onChange={(formData) => {
                        setInputData(formData);
                      }}
                      onSubmit={(formData) => {
                        getData(formData);
                      }}
                      uiSchema={baseNodeUISchema}
                      properties={baseNodeSchema.properties}
                      Actions={() => {
                        return (
                          <>
                            {" "}
                            <Button onClick={() => {}}>Delete</Button>{" "}
                          </>
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Project;

// {innerMenuId === 'Runner' && template.inputSchema && (
//   <>
//     <FormComponent
//       data={inputData}
//       onChange={(formData) => {
//         setInputData(formData)
//       }}
//       onSubmit={(formData) => {
//         getData(formData)
//       }}
//       properties={template.inputSchema}
//     />
//     <Button
//       onClick={() => {
//         gpt.pause()
//       }}
//     >
//       Pause
//     </Button>
//     <Accordion defaultValue={'00'}>
//       {compiledLayers?.[layer]?.map(
//         (
//           {
//             name,
//             compiled,
//             data,
//             question,
//             variables,
//             prompt,
//             request
//           },
//           subindex
//         ) => {
//           return (
//             <Accordion.Item
//               key={subindex}
//               value={`${layer}${subindex}`}
//             >
//               <Accordion.Control>
//                 Name: {name} {compiled && <IconTicket />}
//                 <br />
//                 Prompt: {prompt || interpolate(question, variables)}
//               </Accordion.Control>
//               <Accordion.Panel style={{ background: 'gray' }}>
//                 {request && <>Cost: {request.usage.total_tokens} </>}
//                 <br />
//                 Response:
//                 {Array.isArray(data)
//                   ? (
//                     data?.join('\n')
//                   )
//                   : (
//                     <pre>{JSON.stringify(data, null, 2)}</pre>
//                   )}
//               </Accordion.Panel>
//             </Accordion.Item>
//           )
//         }
//       )}
//     </Accordion>
//   </>
// )}
