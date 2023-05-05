import React from "react";

export class EmptyNode extends React.Component {
  render() {
    return (
      <div {...this.props} onClick={(event) => this.props.onClick(event, this.props.data)}>
        empty              </div>
    );
  }
}
export class NodeView extends React.Component {
  render() {
    const { title, description, styles, id } = this.props;
    return (
      <div style={{ width: '200px', }} id={id}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    );
  }
}
