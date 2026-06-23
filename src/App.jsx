import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Work from './components/Work'
import Studio from './components/Studio'
import Collections from './components/Collections'
import Shop from './components/Shop'
import About from './components/About'
import Ads from './components/Ads'
import Journal from './components/Journal'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Services />
      <Work />
      <Studio />
      <Collections />
      <Shop />
      <About />
      <Ads />
      <Journal />
      <Footer />
    </div>
  )
}

export default App
