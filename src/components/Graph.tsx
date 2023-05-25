// @ts-nocheck
/* eslint-disable */
import 'reactflow/dist/style.css';

import { createPrompt } from '@wikillm/lib/GptQuestion';
import { memo, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  useEdgesState,
  useNodesState,
  useStore,
} from 'reactflow';

const rColor = () =>
  `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)}`;

const DISTANCE = 500;
const WIDTH = 400;
const Prompt = ({ objective, context, question, type, pattern }) => (
  <>
    {[objective, context, question, type, pattern].map((part) => {
      return (
        <>
          <span style={{ background: rColor() }}>{part}</span>
        </>
      );
    })}
  </>
);
const CustomNode = memo(function CustomNode({ id, data }) {
  // console.log("id", id, "handleId", data.edge.handleId);
  const { pattern, type, objective, context, question } = createPrompt(data);
  console.log('datasss', data, { pattern, type, objective, context, question });

  return (
    <div style={{ width: `${WIDTH}px` }}>
      <Handle
        type="target"
        // style={{ display: "none" }}
        position={Position.Top}
        isConnectable={true}
      />

      <div>
        <h1>
          {data.name}
          {/* <sup>{data.each}</sup> */}
        </h1>
        <h3>
          <Prompt
            pattern={pattern}
            type={type}
            objective={objective}
            context={context}
            question={question}
          />
        </h3>
        <p>
          {Array.isArray(data.data)
            ? data.data.map((d) => <li>{d}</li>)
            : data.data}
        </p>
      </div>
      <Handle
        type="source"
        // style={{ padding:1 }}
        position={Position.Bottom}
        id={id}
        isConnectable={true}
      />
    </div>
  );
});

const nodeTypes = {
  custom: CustomNode,
};

const minimapStyle = {
  height: 120,
};

const onInit = (reactFlowInstance) =>
  console.log('flow loaded:', reactFlowInstance);

const Graph = ({ data }) => {
  const { nodes: initialNodes, edges: initialEdges } =
    generateNodesAndEdges(data);
  console.log('initialNodes', initialNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // we are using a bit of a shortcut here to adjust the edge type
  // this could also be done with a custom edge for example
  const edgesWithUpdatedTypes = edges.map((edge) => {
    if (edge.sourceHandle) {
      // edge.type = "custom";
    }

    return edge;
  });

  return (
    <ReactFlow
      nodes={nodes}
      edges={edgesWithUpdatedTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={onInit}
      fitView
      attributionPosition="top-right"
      nodeTypes={nodeTypes}
    >
      <MiniMap style={minimapStyle} zoomable pannable />
      <Controls />
      <Background color="#aaa" gap={16} />
      <SetMinZoom />
    </ReactFlow>
  );
};
const SetMinZoom = memo(function SetMinZoom() {
  console.log('set min zoom');
  const store = useStore((s) => s);

  useEffect(() => {
    store.setMinZoom(0.0001);
  }, []);
  return null;
});
export default Graph;

const computeMaxItems = (layer) => {
  const { children = [] } = layer;
  if (children.length === 0) {
    return 1;
  }
  const childWidths = children.map(computeMaxItems);
  return Math.max(...childWidths) + 1;
};

const computePositionX = (zeroPoint, childrenIndex, offset = DISTANCE) => {
  return zeroPoint + childrenIndex * offset;
};
function getZeroPoint(childrenLength, parentX) {
  if (childrenLength === 1) {
    return parentX;
  }
  const totalLength = childrenLength * DISTANCE;
  const zeroPoint = parentX - totalLength / 2;
  return zeroPoint;
}

function generateNodesAndEdges(data) {
  let nodeCounter = 1;
  const nodes = [];
  const edges = [];
  const maxItems = computeMaxItems(data);
  const maxWidth = maxItems * WIDTH + DISTANCE * (maxItems - 1);
  const buildNodesAndEdges = (layer, parent = null, x = 0, y = 0) => {
    const { name, children = [], each } = layer;
    const nodeId = `${name}-${nodeCounter++}`;

    // Create the node
    nodes.push({
      type: 'custom',
      id: nodeId,
      targetPosition: 'top',

      data: layer,
      position: { x, y },
    });

    // Connect to parent node
    if (parent) {
      edges.push({
        id: `${parent}-${nodeId}`,
        source: parent,
        target: nodeId,
        sourceHandle: parent,
        // targetHandle: nodeId
      });
    }
    if (Array.isArray(children)) {
      children.forEach((child, index) => {
        console.log('c', child);
        const childY = y + DISTANCE;
        const zeroPoint = getZeroPoint(children.length, x);
        const childX = computePositionX(zeroPoint, index, DISTANCE);
        buildNodesAndEdges(child, nodeId, childX, childY);
      });
    }
  };

  data.forEach((layer, index) => {
    console.log('l', layer);
    const childrenLength = layer.length;
    const zeroPoint = getZeroPoint(childrenLength, 0 + index * maxWidth);

    buildNodesAndEdges(layer);
    // nodes.push(...layerNodes);
    // edges.push(...layerEdges);
  });

  return { nodes, edges };
}
