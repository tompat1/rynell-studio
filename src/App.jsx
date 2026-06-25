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
import SearchDrawer from './components/SearchDrawer'
import AccountDrawer from './components/AccountDrawer'
import DetailView from './components/DetailView'
import Loader from './components/Loader'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [activeDetailView, setActiveDetailView] = useState(null)
  const [theme, setTheme] = useState('dark')
  const [isLoading, setIsLoading] = useState(true)
  const [showScroll, setShowScroll] = useState(false)

  useEffect(() => {
    document.body.className = `${theme}-theme`
  }, [theme])

  const handleSearchSelect = (item) => {
    setIsSearchOpen(false)
    setActiveDetailView(item)
  }

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.scrollY > 400) {
        setShowScroll(true);
      } else if (showScroll && window.scrollY <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item])
    setIsCartOpen(true) // Auto-open cart on add
  }

  const removeFromCart = (indexToRemove) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`app ${theme}-theme`}>
      <button 
        className={`scroll-top-btn ${showScroll ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Back to top"
      >
        ↑
      </button>

      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      <Navbar 
        cartCount={cart.length} 
        setIsCartOpen={setIsCartOpen} 
        setIsSearchOpen={setIsSearchOpen}
        setIsAccountOpen={setIsAccountOpen}
        theme={theme} 
        setTheme={setTheme} 
      />
      <Hero />
      <Collections />
      <Shop addToCart={addToCart} />
      <Ads />
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
      <SearchDrawer isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} onSelect={handleSearchSelect} />
      <AccountDrawer isOpen={isAccountOpen} setIsOpen={setIsAccountOpen} />
      <DetailView item={activeDetailView} onClose={() => setActiveDetailView(null)} />
    </div>
  )
}

export default App
