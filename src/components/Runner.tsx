// @ts-nocheck
/* eslint-disable */

import { Button } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import React from 'react';
import Finder from '../elements/Finder';
import FormComponent from '../elements/InputForm';
import { RowCard } from '../elements/RowCard';
import { baseNodeSchema, baseNodeUISchema } from '../lib/GptData';

export function Runner({
  inputData, setInputData, getData, template, layerData, layer, setLayer,
}: {
  inputData: any;
  setInputData: React.Dispatch<any>;
  getData: (variables: any) => void;
  template: any;
  layerData: any;
  layer: number;
  setLayer: React.Dispatch<React.SetStateAction<number>>;
}): React.ReactNode {
  return (
    <>
      <FormComponent
        data={inputData}
        onChange={(formData) => {
          setInputData(formData);
        }}
        onSubmit={(formData) => {
          getData(formData);
        }}
        properties={template.input} />
      {Boolean(layerData) && (
        <div className="flex">
          <Finder
            data={layerData}
            // value={value}
            selectIndexes={layer.path}
            Renderer={({ onClick, value, isEnd, path }) => {
              // console.log(value, isEnd);
              return (
                <div>
                  <RowCard
                    subtitle={value.name}
                    title={Boolean(value.parentEach) || 'Root'}
                    content={value.question}
                    menu={[
                      {
                        label: 'Edit',
                        onClick: () => { },
                        icon: <IconEdit />,
                      },
                      {
                        label: 'Delete',
                        onClick: () => { },
                        icon: <IconTrash />,
                      },
                    ]}
                    onClick={onClick}
                    {...value} />
                </div>
              );
            }}
            onChange={(value, isEnd, path) => {
              // console.log(value, isEnd, path);
              setLayer({
                path,
                value,
              });
            }} />

          {Boolean(layer?.value) && (
            <div style={{ width: '30vw' }}>
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
                      {' '}
                      <Button onClick={() => { }}>Delete</Button>{' '}
                    </>
                  );
                }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
