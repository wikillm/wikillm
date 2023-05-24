// @ts-nocheck
/* eslint-disable */
import React, { Component } from 'react';

import Finder from '.';

export class FinderDemo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectIndexs: [],
      value: null,
      isEnd: true,
      data: [
        {
          name: 'A1',
          value: 'A1',
          children: [
            {
              name: 'A11',
              value: 'A11',
              other: 'prop',
              and: 'one',
              more: '.',
              children: [
                {
                  name: 'A111',
                  value: 'A111',
                },
                {
                  name: 'A112',
                  value: 'A112',
                },
                {
                  name: 'A113',
                  value: 'A113',
                },
                {
                  name: 'A114',
                  value: 'A114',
                },
                {
                  name: 'A115',
                  value: 'A115',
                },
                {
                  name: 'A116',
                  value: 'A116',
                },
              ],
            },
            {
              name: 'A12',
              value: 'A12',
            },
            {
              name: 'A13',
              value: 'A13',
            },
            {
              name: 'A14',
              value: 'A14',
            },
            {
              name: 'A15',
              value: 'A15',
            },
          ],
        },
        {
          name: 'B1',
          value: 'B1',
          disable: true,
          children: [
            {
              name: 'B11',
              value: 'B11',
              children: [
                {
                  name: 'B111',
                  value: 'B111',
                },
                {
                  name: 'B112',
                  value: 'B112',
                },
                {
                  name: 'B113',
                  value: 'B113',
                },
              ],
            },
            {
              name: 'B12',
              value: 'B12',
            },
            {
              name: 'B13',
              value: 'B13',
            },
          ],
        },
        {
          name: 'C1',
          value: 'C1',
          children: [
            {
              name: 'C11',
              value: 'C11',
              children: [
                {
                  name: 'C111',
                  value: 'C111',
                },
                {
                  name: 'C112',
                  value: 'C112',
                  children: [],
                },
                {
                  name: 'C113',
                  value: 'C113',
                },
                {
                  name: 'C114',
                  value: 'C114',
                },
                {
                  name: 'C115',
                  value: 'C115',
                },
                {
                  name: 'C116',
                  value: 'C116',
                },
              ],
            },
            {
              name: 'C12',
              value: 'C12',
              disable: true,
              children: [
                {
                  name: 'C121',
                  value: 'C121',
                },
              ],
            },
            {
              name: 'C13',
              value: 'C13',
            },
            {
              name: 'C14',
              value: 'C14',
            },
            {
              name: 'C15',
              value: 'C15',
            },
          ],
        },
      ],
    };
  }

  render() {
    const { data, selectIndexs, value, isEnd } = this.state;
    return (
      <>
        <div className="finder-demo">
          <Finder
            value={value}
            data={data}
            onChange={(value, isEnd, selectIndexs) => {
              this.setState({ value, isEnd, selectIndexs });
            }}
          />
        </div>

        <ul className="value-list">
          <li>
            selectIndexs:
            {`[${selectIndexs.join(',')}]`}
          </li>
          <li>
            value：
            <input
              value={value}
              onChange={(e) => {
                this.setState({ value: e.target.value });
              }}
            />
          </li>
          <li>
            isEndNode:
            {`${isEnd}`}
          </li>
        </ul>
      </>
    );
  }
}
export default FinderDemo;
