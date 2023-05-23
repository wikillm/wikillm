import React from "react";

function Chapter({ value, subchapters }) {
  return (
    <div>
      <h1>{value}</h1>
      {subchapters?.map((subchapter, index) => (
        <Subchapter key={index} {...subchapter} />
      ))}
    </div>
  );
}

function Subchapter({ value, questions }) {
  return (
    <div>
      <h2>{value}</h2>
      {questions?.map((question, index) => (
        <Question key={index} {...question} />
      ))}
    </div>
  );
}

function Question({ value, paragraphs }) {
  return (
    <div>
      <h3>{value}</h3>
      {paragraphs?.map(({ value, metrics }) => (
        <p>{value}</p>
      ))}
      <ul>
        {paragraphs
          ?.map(({ metrics }) =>
            metrics?.map((metric, index) => <li key={index}>{metric}</li>)
          )
          .flat()}
      </ul>
    </div>
  );
}

function Book({ data }) {
  return (
    <div>
      {data.chapters.map((chapter, index) => (
        <Chapter key={index} {...chapter} />
      ))}
    </div>
  );
}

export default Book;
