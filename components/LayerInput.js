import { useState } from 'react'

const LayerInput = ({ onSubmit }) => {
  const [layerText, setLayerText] = useState('')

  const submitOnEnter = (event) => {
    // Watch for enter key
    if (event.keyCode === 13) {
      onSubmit(layerText)
      setLayerText('')
    }
  }

  return (
    <>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Send a layer"
        value={layerText}
        onChange={(e) => setLayerText(e.target.value)}
        onKeyDown={(e) => submitOnEnter(e)}
      />
    </>
  )
}

export default LayerInput
