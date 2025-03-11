// import React, { useState } from "react";
// import LZoom from "./LZoom";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LZoom from './components/locuszoom'

const App = () => {
  const [start, setStart] = useState(53673256);
  const [end, setEnd] = useState(53831146);
  const [variant, setVariant] = useState(""); // Adjust this if you want to use the variant prop

  const handleStartChange = (e) => setStart(Number(e.target.value));
  const handleEndChange = (e) => setEnd(Number(e.target.value));
  const handleVariantChange = (e) => setVariant(e.target.value);

  return (
    <div>
      <h1>LocusZoom Plot</h1>
      
      <label>
        Start: 
        <input type="number" value={start} onChange={handleStartChange} />
      </label>

      <label>
        End: 
        <input type="number" value={end} onChange={handleEndChange} />
      </label>

      <label>
        Variant: 
        <input type="text" value={variant} onChange={handleVariantChange} />
      </label>

      <LZoom start={start} end={end} variant={variant} />
    </div>
  );
};

export default App;
