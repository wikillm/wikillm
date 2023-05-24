// @ts-nocheck
/* eslint-disable */

import { Sandpack } from '@codesandbox/sandpack-react';
import React from 'react';

function printIframe(id) {
  const iframe = document.frames
    ? document.frames[id]
    : document.getElementById(id);
  const ifWin = iframe.contentWindow || iframe;

  iframe.focus();
  ifWin.printPage();
  return false;
}
export function Viewer({ data, files }) {
  return (
    <div>
      <Sandpack
        template="react"
        options={{
          showConsole: true,
          showNavigator: true,
          showConsoleButton: true,
          showLineNumbers: true,
          showTabs: true,
          showRefreshButton: true,
          resizablePanels: true,
          closableTabs: true,
          wrapContent: true,
          editorWidthPercentage: 49,
          editorHeight: '90%',
        }}
        files={{
          ...files,
          'data.json': JSON.stringify(data, null, 2),
        }}
      />
    </div>
  );
}
