import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Ads from './components/Ads'
import Collections from './components/Collections'
import Shop from './components/Shop'
import About from './components/About'
import Journal from './components/Journal'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.body.className = `${theme}-theme`
  }, [theme])

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item])
    setIsCartOpen(true) // Auto-open cart on add
  }

  const removeFromCart = (indexToRemove) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className={`app ${theme}-theme`}>
      <Navbar 
        cartCount={cart.length} 
        setIsCartOpen={setIsCartOpen} 
        theme={theme} 
        setTheme={setTheme} 
      />
      <Hero />
      <Ads />
      <Collections />
      <Shop addToCart={addToCart} />
      <About />
      <Services />
      <Journal />
      <Footer />
      <CartDrawer 
        cart={cart} 
        isCartOpen={isCartOpen} 
        setIsCartOpen={setIsCartOpen} 
        removeFromCart={removeFromCart} 
      />
    </div>
  )
}

export default App
