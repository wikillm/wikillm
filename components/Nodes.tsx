import React, { useState } from "react";
import TreeView, { TreeNode, TreeViewProps } from "./Tree";

// import { TreeView, TreeViewProps, TreeNode } from 'treeview-component'
// import NodeView from './components/NodeView'
// import EmptyNode from './components/EmptyNode'
const styles = {}
class EmptyNode extends React.Component {
  render() {
    return (
      <div {...this.props} onClick={(event) => this.props.onClick(event, this.props.data)}>
        empty              </div>
    )
  }
}

class NodeView extends React.Component {
  render() {
    const { title, description, styles, id } = this.props
    return (
      <div style={{width: '200px', }} id={id}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    )
  }
}

export const Nodes = () => {
  const [tree, setTree] = useState<TreeNode>({
    node: '00',
    parent_node: null,
    title: 'First node',
    description: 'Some description for node.',
    children: [
      {
        node: '10',
        parent_node: '00',
        title: 'Second node',
        description: 'Some description for node.',
        children: [null]
      },
      {
        node: '11',
        parent_node: '00',
        title: 'Third node',
        description: 'Some description for node.',
        children: [null, null]
      }
    ]

  });

  const addCardFunc = (node: TreeNode, newTree: TreeNode) => {
    let tree = { ...newTree };
    const walker = (cell: TreeNode | null) => {
      if (!cell) {
        return
      }
      cell.children.forEach((child: TreeNode | null, id: number) => {
        if (child?.node === node.node) {
          cell.children[id] = {
            node: child.node,
            parent_node: cell.node,
            title: 'Added node',
            description: 'This node was added by click',
            children: [null, null],
          }
        }
        walker(child)
      })
    }
    walker(tree)
    setTree(tree)
  }

  const addCard = (event: React.MouseEvent<HTMLElement, MouseEvent>, data: { node: TreeNode, newTree: TreeNode }) => {
    addCardFunc(data.node, data.newTree);
  }



  const treeProps: TreeViewProps = {
    autoCenter: true,
    nodeView: NodeView,
    nodeViewClasses: styles,
    showEmptyNodes: true,
    emptyNode: EmptyNode,
    emptyNodeProps: {
      onClick: addCard,
      // className: styles.add_card
    },
    tree,
    style: {
      cursor: 'auto',
      outline: 'none'
    }
  }
  console.log('props',treeProps)
  return <TreeView {...treeProps} />
}
export default Nodes