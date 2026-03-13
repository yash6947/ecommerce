import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

function formatPrice(value) {
  return `INR ${value.toLocaleString()}`
}

function originalPrice(product) {
  const discountPercent = product.discountPercent || 20
  const raw = product.price / (1 - discountPercent / 100)
  return Math.round(raw)
}

function App() {
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [savingProfile, setSavingProfile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [minRating, setMinRating] = useState(0)
  const [onlyAssured, setOnlyAssured] = useState(false)
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [notice, setNotice] = useState('')
  const noticeTimerRef = useRef(null)

  function showNotice(message) {
    setNotice(message)

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current)
    }

    noticeTimerRef.current = setTimeout(() => {
      setNotice('')
    }, 2200)
  }

  async function fetchData() {
    setLoading(true)
    try {
      const [profileRes, productsRes, cartRes, wishlistRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/products'),
        fetch('/api/cart'),
        fetch('/api/wishlist'),
      ])

      const [profileData, productsData, cartData, wishlistData] = await Promise.all([
        profileRes.json(),
        productsRes.json(),
        cartRes.json(),
        wishlistRes.json(),
      ])

      setProfile(profileData)
      setProducts(productsData)
      setCart(cartData)
      setWishlist(wishlistData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    return () => {
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current)
      }
    }
  }, [])

  const categories = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category)))
    return ['All', ...names]
  }, [products])

  const visibleProducts = useMemo(() => {
    let nextProducts = [...products]

    if (activeCategory !== 'All') {
      nextProducts = nextProducts.filter((product) => product.category === activeCategory)
    }

    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (normalizedSearch) {
      nextProducts = nextProducts.filter((product) => {
        const titleMatch = product.title.toLowerCase().includes(normalizedSearch)
        const categoryMatch = product.category.toLowerCase().includes(normalizedSearch)
        return titleMatch || categoryMatch
      })
    }

    if (minRating > 0) {
      nextProducts = nextProducts.filter((product) => product.rating >= minRating)
    }

    if (onlyAssured) {
      nextProducts = nextProducts.filter((product) => product.assured)
    }

    if (fastDeliveryOnly) {
      nextProducts = nextProducts.filter((product) => (product.deliveryDays || 4) <= 2)
    }

    if (sortBy === 'price-low') {
      nextProducts.sort((a, b) => a.price - b.price)
    }

    if (sortBy === 'price-high') {
      nextProducts.sort((a, b) => b.price - a.price)
    }

    if (sortBy === 'rating') {
      nextProducts.sort((a, b) => b.rating - a.rating)
    }

    return nextProducts
  }, [products, activeCategory, searchTerm, minRating, sortBy, onlyAssured, fastDeliveryOnly])

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.id)),
    [wishlist],
  )

  const cartItemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items],
  )

  const bagMRP = useMemo(
    () => cart.items.reduce((sum, item) => sum + originalPrice(item.product) * item.quantity, 0),
    [cart.items],
  )

  const productDiscount = bagMRP - cart.total

  const couponDiscount = useMemo(() => {
    if (couponCode === 'CLOG10') {
      return Math.min(Math.round(cart.total * 0.1), 1200)
    }

    if (couponCode === 'SAVE200' && cart.total >= 1500) {
      return 200
    }

    return 0
  }, [cart.total, couponCode])

  const pricing = useMemo(() => {
    const subtotal = cart.total
    const platformFee = subtotal > 0 ? 29 : 0
    const deliveryFee = subtotal === 0 || subtotal >= 3000 ? 0 : 99
    const finalTotal = subtotal + deliveryFee + platformFee - couponDiscount

    return {
      subtotal,
      platformFee,
      deliveryFee,
      finalTotal,
    }
  }, [cart.total, couponDiscount])

  async function refreshCart() {
    const cartRes = await fetch('/api/cart')
    setCart(await cartRes.json())
  }

  async function refreshWishlist() {
    const wishlistRes = await fetch('/api/wishlist')
    setWishlist(await wishlistRes.json())
  }

  async function addToCart(productId) {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    await refreshCart()
    showNotice('Added to cart')
  }

  async function removeFromCart(productId) {
    await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
    await refreshCart()
    showNotice('Item removed from cart')
  }

  async function updateQuantity(productId, nextQuantity) {
    if (nextQuantity <= 0) {
      await removeFromCart(productId)
      return
    }

    await fetch(`/api/cart/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: nextQuantity }),
    })

    await refreshCart()
  }

  async function toggleWishlist(productId) {
    if (wishlistIds.has(productId)) {
      await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
    }

    await refreshWishlist()

    if (wishlistIds.has(productId)) {
      showNotice('Removed from wishlist')
    } else {
      showNotice('Saved to wishlist')
    }
  }

  async function moveWishlistToCart(productId) {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
    await Promise.all([refreshCart(), refreshWishlist()])
    showNotice('Moved from wishlist to cart')
  }

  async function clearCart() {
    await fetch('/api/cart', { method: 'DELETE' })
    await refreshCart()
    setCouponCode('')
    setCouponInput('')
    showNotice('Cart cleared')
  }

  async function handleCheckout() {
    if (cart.items.length === 0) return
    await fetch('/api/cart', { method: 'DELETE' })
    await refreshCart()
    setCouponCode('')
    setCouponInput('')
    showNotice('Order placed successfully')
  }

  async function moveAllWishlistToCart() {
    if (wishlist.length === 0) return

    await Promise.all(
      wishlist.map((item) =>
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.id }),
        }),
      ),
    )

    await Promise.all(
      wishlist.map((item) => fetch(`/api/wishlist/${item.id}`, { method: 'DELETE' })),
    )

    await Promise.all([refreshCart(), refreshWishlist()])
    showNotice('All wishlist items moved to cart')
  }

  function applyCoupon() {
    const normalized = couponInput.trim().toUpperCase()

    if (!normalized) {
      showNotice('Enter coupon code')
      return
    }

    if (normalized !== 'CLOG10' && normalized !== 'SAVE200') {
      showNotice('Invalid coupon')
      return
    }

    if (normalized === 'SAVE200' && cart.total < 1500) {
      showNotice('SAVE200 requires cart total above INR 1,500')
      return
    }

    setCouponCode(normalized)
    showNotice(`Coupon ${normalized} applied`)
  }

  function removeCoupon() {
    setCouponCode('')
    setCouponInput('')
    showNotice('Coupon removed')
  }

  async function saveProfile(event) {
    event.preventDefault()
    if (!profile) return

    setSavingProfile(true)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSavingProfile(false)
    showNotice('Profile updated')
  }

  if (loading) {
    return (
      <main className="loading-screen app-bg">
        <h1>Loading cloground...</h1>
      </main>
    )
  }

  return (
    <main className="app-bg">
      <header className="top-nav sticky-head">
        <p className="brand">cloground</p>
        <input
          className="search-global"
          placeholder="Search for products, brands and more"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <nav className="route-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Home
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Wishlist
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Cart
          </NavLink>
        </nav>
        <div className="nav-badges">
          <span>Wishlist: {wishlist.length}</span>
          <span>Cart: {cartItemCount}</span>
        </div>
      </header>

      {notice ? <p className="floating-notice">{notice}</p> : null}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              profile={profile}
              setProfile={setProfile}
              savingProfile={savingProfile}
              saveProfile={saveProfile}
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              minRating={minRating}
              setMinRating={setMinRating}
              onlyAssured={onlyAssured}
              setOnlyAssured={setOnlyAssured}
              fastDeliveryOnly={fastDeliveryOnly}
              setFastDeliveryOnly={setFastDeliveryOnly}
              visibleProducts={visibleProducts}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
              wishlistIds={wishlistIds}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              searchTerm={searchTerm}
              toggleWishlist={toggleWishlist}
              moveWishlistToCart={moveWishlistToCart}
              moveAllWishlistToCart={moveAllWishlistToCart}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              cartItemCount={cartItemCount}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              bagMRP={bagMRP}
              productDiscount={productDiscount}
              couponDiscount={couponDiscount}
              couponInput={couponInput}
              setCouponInput={setCouponInput}
              couponCode={couponCode}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
              pricing={pricing}
              clearCart={clearCart}
              handleCheckout={handleCheckout}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

function HomePage({
  profile,
  setProfile,
  savingProfile,
  saveProfile,
  categories,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  onlyAssured,
  setOnlyAssured,
  fastDeliveryOnly,
  setFastDeliveryOnly,
  visibleProducts,
  addToCart,
  toggleWishlist,
  wishlistIds,
}) {
  return (
    <>
      <section className="offers-strip">
        <p>MEGA FASHION DAYS: Extra 10% off with CLOG10</p>
        <p>FREE DELIVERY above INR 3,000</p>
        <p>NEW STYLES added every evening</p>
      </section>

      <section className="campaign-wrap">
        <article className="sale-hero">
          <p className="pill">FASHION CARNIVAL 2026</p>
          <h1>Curated looks, fast delivery, and offer-rich shopping in one place.</h1>
          <p>
            Browse by category, compare ratings, save styles to wishlist, and checkout with coupons.
          </p>
        </article>
        <article className="deals-card">
          <p className="small-head">TRENDING OFFERS</p>
          <h2>Up to 60% Off</h2>
          <p>Grab best-selling products with assured quality tags.</p>
          <div className="deal-tags">
            <span>ASSURED</span>
            <span>2-DAY DELIVERY</span>
            <span>TOP RATED</span>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <aside className="panel profile-panel">
          <div className="panel-head">
            <h2>Your Profile</h2>
          </div>
          <form onSubmit={saveProfile}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={profile?.name || ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profile?.email || ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
            />

            <label htmlFor="city">City</label>
            <input
              id="city"
              value={profile?.city || ''}
              onChange={(event) => setProfile((prev) => ({ ...prev, city: event.target.value }))}
            />

            <button className="btn-main" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </aside>

        <section className="panel products-panel">
          <div className="panel-head products-head">
            <h2>Products</h2>
            <div className="controls-block">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <select
                value={String(minRating)}
                onChange={(event) => setMinRating(Number(event.target.value))}
              >
                <option value="0">All Ratings</option>
                <option value="4">4+ Rating</option>
                <option value="4.5">4.5+ Rating</option>
              </select>
            </div>
          </div>

          <div className="chips">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'chip active' : 'chip'}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
            <button
              type="button"
              className={onlyAssured ? 'chip active' : 'chip'}
              onClick={() => setOnlyAssured((prev) => !prev)}
            >
              Assured
            </button>
            <button
              type="button"
              className={fastDeliveryOnly ? 'chip active' : 'chip'}
              onClick={() => setFastDeliveryOnly((prev) => !prev)}
            >
              2-Day Delivery
            </button>
          </div>

          {visibleProducts.length === 0 ? (
            <p className="empty-text products-empty">No products match this filter.</p>
          ) : (
            <div className="products-grid">
              {visibleProducts.map((product) => {
                const mrp = originalPrice(product)
                return (
                  <article className="product-card" key={product.id}>
                    <img src={product.image} alt={product.title} />
                    <div className="product-body">
                      <p className="category">{product.category}</p>
                      <h3>{product.title}</h3>
                      <p className="brand-line">{product.brand || 'cloground label'}</p>
                      <p className="meta-row">
                        <span className="meta">{formatPrice(product.price)}</span>
                        <span className="strike">{formatPrice(mrp)}</span>
                        <span className="off-tag">{product.discountPercent || 20}% OFF</span>
                      </p>
                      <p className="rating">Rating {product.rating} | {product.deliveryDays || 4} day delivery</p>
                    </div>
                    <div className="product-actions">
                      <button type="button" className="btn-main" onClick={() => addToCart(product.id)}>
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className={wishlistIds.has(product.id) ? 'btn-soft active' : 'btn-soft'}
                        onClick={() => toggleWishlist(product.id)}
                      >
                        {wishlistIds.has(product.id) ? 'Wishlisted' : 'Wishlist'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </>
  )
}

function WishlistPage({ wishlist, searchTerm, toggleWishlist, moveWishlistToCart, moveAllWishlistToCart }) {
  const filtered = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) return wishlist

    return wishlist.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(normalized)
      const inCategory = item.category.toLowerCase().includes(normalized)
      return inTitle || inCategory
    })
  }, [wishlist, searchTerm])

  return (
    <section className="route-page panel">
      <div className="panel-head">
        <h2>My Wishlist</h2>
        <button type="button" className="btn-main" onClick={moveAllWishlistToCart} disabled={wishlist.length === 0}>
          Move All To Cart
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-text">No wishlist items found for current search.</p>
      ) : (
        <div className="wishlist-grid">
          {filtered.map((item) => (
            <article key={item.id} className="product-card">
              <img src={item.image} alt={item.title} />
              <div className="product-body">
                <p className="category">{item.category}</p>
                <h3>{item.title}</h3>
                <p className="meta">{formatPrice(item.price)}</p>
              </div>
              <div className="product-actions">
                <button type="button" className="btn-main" onClick={() => moveWishlistToCart(item.id)}>
                  Move To Cart
                </button>
                <button type="button" className="btn-soft" onClick={() => toggleWishlist(item.id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function CartPage({
  cart,
  cartItemCount,
  updateQuantity,
  removeFromCart,
  bagMRP,
  productDiscount,
  couponDiscount,
  couponInput,
  setCouponInput,
  couponCode,
  applyCoupon,
  removeCoupon,
  pricing,
  clearCart,
  handleCheckout,
}) {
  return (
    <section className="route-page cart-layout">
      <div className="panel">
        <div className="panel-head compact">
          <h2>Shopping Bag</h2>
          <p>{cartItemCount} items</p>
        </div>

        <div className="stack-list">
          {cart.items.length === 0 ? (
            <p className="empty-text">Your cart is empty.</p>
          ) : (
            cart.items.map((item) => (
              <article key={item.productId} className="row-card cart-line">
                <img src={item.product.image} alt={item.product.title} />
                <div className="line-body">
                  <h4>{item.product.title}</h4>
                  <p>{item.product.brand || 'cloground label'}</p>
                  <p>{formatPrice(item.product.price)}</p>
                  <div className="qty-actions">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button type="button" className="btn-link" onClick={() => removeFromCart(item.productId)}>
                  Remove
                </button>
              </article>
            ))
          )}
        </div>
      </div>

      <aside className="panel summary-panel">
        <h3>Coupon</h3>
        <div className="coupon-row">
          <input
            value={couponInput}
            onChange={(event) => setCouponInput(event.target.value)}
            placeholder="Use CLOG10 or SAVE200"
          />
          <button type="button" className="btn-main" onClick={applyCoupon}>
            Apply
          </button>
        </div>
        {couponCode ? (
          <p className="coupon-applied">
            Applied: {couponCode}
            <button type="button" className="btn-link" onClick={removeCoupon}>
              Remove
            </button>
          </p>
        ) : null}

        <h3>Price Details</h3>
        <div className="price-breakdown">
          <p>
            Total MRP <span>{formatPrice(bagMRP)}</span>
          </p>
          <p>
            Product Discount <span>- {formatPrice(productDiscount)}</span>
          </p>
          <p>
            Coupon Discount <span>- {formatPrice(couponDiscount)}</span>
          </p>
          <p>
            Platform Fee <span>{formatPrice(pricing.platformFee)}</span>
          </p>
          <p>
            Delivery Fee <span>{pricing.deliveryFee === 0 ? 'FREE' : formatPrice(pricing.deliveryFee)}</span>
          </p>
          <p className="final-total">
            Total Amount <span>{formatPrice(pricing.finalTotal)}</span>
          </p>
        </div>

        <div className="checkout-actions">
          <button type="button" className="btn-soft" onClick={clearCart} disabled={cart.items.length === 0}>
            Clear Cart
          </button>
          <button type="button" className="btn-main" onClick={handleCheckout} disabled={cart.items.length === 0}>
            Place Order
          </button>
        </div>
      </aside>
    </section>
  )
}

export default App
