// @ts-nocheck

import React from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
function printIframe(id) {
  var iframe = document.frames
    ? document.frames[id]
    : document.getElementById(id);
  var ifWin = iframe.contentWindow || iframe;

  iframe.focus();
  ifWin.printPage();
  return false;
}
export function Viewer({data, files}) {
  return <div ><Sandpack template="react" options={{
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
    editorHeight: "90%",
  }}
    files={{
    ...files,
      "data.json": JSON.stringify(data, null, 2),
     }}
  />
  </div>
  ;
}