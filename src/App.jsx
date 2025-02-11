import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import LZoom from './components/locuszoom'
import LZoomLocal from './components/lzLocal'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LZoomLocal />
    </>
  )
}

export default App
