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
import CheckoutDrawer from './components/CheckoutDrawer'
import Loader from './components/Loader'
import ContactDrawer from './components/ContactDrawer'
import { AudioProvider } from './contexts/AudioContext'

function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isShopArchiveOpen, setIsShopArchiveOpen] = useState(false)
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
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(cartItem => cartItem.id === item.id && cartItem.size === item.size);
      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex] = { ...newCart[existingIndex], quantity: (newCart[existingIndex].quantity || 1) + 1 };
        return newCart;
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true) // Auto-open cart on add
  }

  const updateCartQuantity = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const newQuantity = (newCart[index].quantity || 1) + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((_, i) => i !== index);
      }
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      return newCart;
    });
  }

  const removeFromCart = (indexToRemove) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove))
  }

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }

  const clearCart = () => {
    setCart([]);
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
        cartCount={cart.reduce((total, item) => total + (item.quantity || 1), 0)} 
        onCartClick={() => setIsCartOpen(true)} 
        onSearchClick={() => setIsSearchOpen(true)}
        onAccountClick={() => setIsAccountOpen(true)}
        onContactClick={() => setIsContactOpen(true)}
        theme={theme} 
        setTheme={setTheme} 
      />
      <Hero />
      <Collections />
      <Shop addToCart={addToCart} isArchiveOpen={isShopArchiveOpen} setIsArchiveOpen={setIsShopArchiveOpen} />
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
        updateCartQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
      />
      <SearchDrawer isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} onSelect={handleSearchSelect} />
      <AccountDrawer isOpen={isAccountOpen} setIsOpen={setIsAccountOpen} />
      <ContactDrawer isOpen={isContactOpen} setIsOpen={setIsContactOpen} />
      <CheckoutDrawer isOpen={isCheckoutOpen} setIsOpen={setIsCheckoutOpen} cart={cart} clearCart={clearCart} />
      <DetailView 
        item={activeDetailView} 
        onClose={() => setActiveDetailView(null)} 
        addToCart={addToCart} 
        setItem={setActiveDetailView} 
        openShopArchive={() => setIsShopArchiveOpen(true)}
      />
    </div>
  )
}

export default App
