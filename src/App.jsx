import React from 'react'
import Hero from './components/Hero'
import Services from './components/Services'

function App() {
  return (
    <div className="app">
      {/* We are focusing on making these two sections pixel-perfect matches to the provided mockups */}
      <Hero />
      <Services />
    </div>
  )
}

export default App
