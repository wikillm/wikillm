// @ts-nocheck
/* eslint-disable */
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2 } from '@tabler/icons-react';
import { addProject } from '@wikillm/api/Store';
import React, { useContext, useEffect, useState } from 'react';

import UserContext from '../contexts/UserContext';
import { Header } from '../elements/Header';
import { Side } from '../elements/Side';
import { GptData } from '../lib/GptData';
import generator from '../recipes/content-generator';
import { Runner } from './Runner';
import { Template } from './Template';
import { Viewer } from './Viewer';

const memory = {
  getItem(key: any): any {
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

        if (typeof window !== 'undefined' && !store) {
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
const store = ls('memory');
const db = ls();

export const Project = ({ template, project }) => {
  // console.log("project", project);
  if (typeof window !== 'undefined') {
    if (!template) {
      const t = store.template;
      if (!t || !t.children) {
        template = generator;
        store.template = generator;
      } else {
        template = t;
      }
      // // console.log('zzz', t)
    }
  }
  if (!template) {
    template = generator;
    // store.template =bookGenerator
  }
  const [data, setData] = useState(null);
  const [inputData, setInputData] = useState(
    typeof window !== 'undefined' && db.inputData
  );
  const [currentTemplate, setCurrentTemplate] = useState(template);
  const [layerCosts, setLayerCosts] = useState([]);
  const [layers, setLayers] = useState([]);
  const [layerData, setLayerData] = useState(db.lastLayerData);
  const [compiledLayers, setCompiledLayers] = useState([]);
  const [layer, setLayer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gpt, setGpt] = useState(null);
  // console.log(layerData);
  useEffect(() => {
    db.inputData = inputData;
    // // console.log('input')
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
    gptInstance.getAllLayers().catch((err) => {
      console.error(err);
    });
    gptInstance.onFinishSublayer((num, index) => {
      // console.log("finishSublayer", gptInstance.compiledLayers[num][index]);
      // const newData = gptInstance.getCompressedData()
      // setCompiledLayers(gptInstance.compiledLayers)
      // // console.log('Finished Layer', num, newData)
      const ldata = gptInstance.getLayerData();
      setLayerData(ldata);
      db.lastLayerData = ldata;
      setData(gptInstance.getData());
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
  const [innerMenuId, setInnerMenuId] = useState('Runner');
  // if(!template){return <div className='flex w-full'>'no template'</div>}
  return (
    <div className="flex h-fit w-full">
      <Side
        setMenuId={setMenuId}
        setInnerMenuId={setInnerMenuId}
        innerMenuId={innerMenuId}
        menuId={menuId}
        title={
          <form
            onSubmit={(e) => {
              // console.log(e.target);
              e.preventDefault();
              addProject(e.target.name);
            }}
            className="flex"
          >
            <input name="name" style={{ width: 50 }} />
            <Button type="submit"> {'>'} </Button>
          </form>
        }
        menu={[{ icon: IconHome2, label: 'Home' }]}
        innerMenu={[
          { label: 'Template' },

          { label: 'Runner' },
          {
            label: 'Viewer',
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
            // // console.log('tab', index)
            // setLayer(index)
          }}
        />
        {/* <FinderDemo /> */}
        {innerMenuId === 'Template' && (
          <Template
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

        {innerMenuId === 'Runner' && (
          <Runner
            inputData={inputData}
            setInputData={setInputData}
            getData={getData}
            template={template}
            layerData={layerData}
            layer={layer}
            setLayer={setLayer}
          />
        )}

        {innerMenuId === 'Viewer' && Boolean(data) && (
          <div className="viewer">
            <Viewer data={data} files={template.viewer} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Project;


