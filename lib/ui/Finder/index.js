import React, { Component } from 'react'
import PropTypes from 'prop-types'
import folder from './assets/folder.svg'
import arrowR from './assets/triangle-arrow-r.svg'
import equal from 'fast-deep-equal'

class FinderRow extends Component {
  constructor (props) {
    super(props)

    this.onChange = this.onChange.bind(this)
  }

  onChange () {
    const { rowIndex, columnIndex, disable, hasChildren, onChange, ...value } = this.props
    if (!disable && onChange) {
      onChange(rowIndex, columnIndex, this.props.item, !hasChildren)
    }
  }

  render () {
    const { name, disable, hasChildren, isSelect, item, Renderer } = this.props
    return (
      <li className={`item ${hasChildren ? 'has-children' : ''} ${disable ? 'disable' : ''} ${isSelect && 'select'}`} onClick={this.onChange} >
        {Renderer
          ? <Renderer value={item} isEnd={!hasChildren} />
          : hasChildren
            ? <>
              <img src={`./${folder}`}></img>
              <span className='label'>{name}</span>
              <span style={{ fontWeight: 'bolder' }}>{'>'}</span>
            </>
            : <span style={{ width: '100%' }}>{name}</span>}

      </li>
    )
  }
}

class FinderColumn extends Component {
  constructor (props) {
    super(props)

    this.onChange = this.onChange.bind(this)
  }

  onChange (rowIndex, columnIndex, value, isEnd) {
    const { onChange } = this.props

    if (onChange) {
      onChange(rowIndex, columnIndex, value, isEnd)
    }
  }

  render () {
    const { id, data, selectIndex, ...value } = this.props

    return (
      <ul className="columns">
        {
          data.map((item, i) => <FinderRow
            key={`${id}-${i}`}
            columnIndex={id}
            rowIndex={i}
            isSelect={selectIndex === i}
            name={item.name}
            item={item}
            disable={item.disable}
            hasChildren={Array.isArray(item.children)}
            onChange={this.onChange}
            Renderer={this.props.Renderer}
          />)
        }
      </ul>
    )
  }
}

class Finder extends Component {
  constructor (props) {
    super(props)
    const { data, dataKeys, defaultSelectIndexes, selectIndexes, value } = props
    const valueIndexes = value && this.getValueIndexes(value, data, dataKeys)
    const { columns, newSelectIndexes } = this.parseData(valueIndexes || selectIndexes || defaultSelectIndexes, data, dataKeys)

    this.state = {
      selectIndexes: newSelectIndexes,
      columns
    }

    this.onChange = this.onChange.bind(this)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { data, dataKeys, defaultSelectIndexes, selectIndexes, value } = nextProps
    const valueIndexes = value && this.getValueIndexes(value, data, dataKeys)

    if (!equal(this.props.data, data) || (valueIndexes && valueIndexes !== this.state.selectIndexes)) {
      const { columns, newSelectIndexes } = this.parseData(valueIndexes || selectIndexes || defaultSelectIndexes, data, dataKeys)
      this.setState({
        columns,
        selectIndexes: newSelectIndexes
      })
    }

    if (Array.isArray(selectIndexes) && selectIndexes.length > 0) {
      this.setState({ selectIndexes })
    }
  }

  getValueIndexes (value, data, dataKeys) {
    const { dataPathByValue } = this.getTreePath(data, dataKeys)
    const valueIndexes = dataPathByValue[value] ? dataPathByValue[value].indexes : []
    return valueIndexes
  }

  getTreePath (data, dataKeys = { children: 'children', value: 'value' }) {
    const dataPathByValue = {}
    const dataWithPathByValue = lookAll(data, dataKeys, [])

    function lookAll (data, dataKeys, indexes) {
      const root = []
      for (const key in data) {
        const item = data[key]; const newIndexes = JSON.parse(JSON.stringify(indexes)) // TODO: remove this
        newIndexes.push(key)
        item.indexes = newIndexes
        if (item[dataKeys.children] && Object.keys(item[dataKeys.children]).length > 0) {
          item.children = lookAll(item[dataKeys.children], dataKeys, newIndexes)
        };
        root.push(item)
        dataPathByValue[item[dataKeys.value]] = item
      }
      return root
    }
    return { dataPathByValue, dataWithPathByValue }
  }

  parseData (selectIndexes = [], data = [], dataKeys = {}) {
    let i = 0; let dataItem = JSON.parse(JSON.stringify(data)); const columns = []; const newSelectIndexes = []

    do {
      columns.push(dataItem)
      const selectIndex = dataItem[selectIndexes[i]] ? selectIndexes[i] : -1
      newSelectIndexes.push(selectIndex)
      dataItem = Array.isArray(dataItem) && dataItem[selectIndex] && dataItem[selectIndex][dataKeys.children]
      i++
    } while (dataItem)

    return { columns, newSelectIndexes }
  }

  onChange (rowIndex, columnIndex, value, isEnd) {
    const { data, dataKeys, disabled, onChange } = this.props
    let { selectIndexes } = this.state
    if (disabled) return

    selectIndexes[columnIndex] = rowIndex
    if (selectIndexes.length > columnIndex + 1) {
      selectIndexes = selectIndexes.slice(0, columnIndex + 1)
    }

    const { columns, newSelectIndexes } = this.parseData(selectIndexes, data, dataKeys)
    selectIndexes = newSelectIndexes

    this.setState({ columns, selectIndexes })

    if (onChange) {
      onChange(value, isEnd, selectIndexes)
    }
  }

  render () {
    const { columns, selectIndexes } = this.state
    console.log(this)
    return (
      <div className="finder">
        {
          columns.map((item, i) => <FinderColumn key={i} id={i} data={item} selectIndex={selectIndexes[i]} onChange={this.onChange} Renderer={this.props.Renderer}/>)
        }
      </div>
    )
  }
}

Finder.propTypes = {
  data: PropTypes.array.isRequired,
  dataKeys: PropTypes.object,
  defaultSelectIndexes: PropTypes.array,
  disabled: PropTypes.bool,
  selectIndexes: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func
}

Finder.defaultProps = {
  data: [],
  dataKeys: {
    name: 'name',
    value: 'value',
    disable: 'disable',
    children: 'children',
    compiled: 'compiled'
  }
}

export default Finder
