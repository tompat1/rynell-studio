import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Navbar />
      {/* We are focusing on making these two sections pixel-perfect matches to the provided mockups */}
      <Hero />
      <Services />
      <Footer />
    </div>
  )
}

export default App
