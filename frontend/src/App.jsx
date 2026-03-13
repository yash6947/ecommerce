import { useEffect, useMemo, useState } from 'react'
import './App.css'

function App() {
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [savingProfile, setSavingProfile] = useState(false)

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
  }, [])

  const categories = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category)))
    return ['All', ...names]
  }, [products])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((item) => item.id)),
    [wishlist],
  )

  async function addToCart(productId) {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    const cartRes = await fetch('/api/cart')
    setCart(await cartRes.json())
  }

  async function removeFromCart(productId) {
    await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
    const cartRes = await fetch('/api/cart')
    setCart(await cartRes.json())
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

    const cartRes = await fetch('/api/cart')
    setCart(await cartRes.json())
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

    const wishlistRes = await fetch('/api/wishlist')
    setWishlist(await wishlistRes.json())
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
      <header className="top-nav">
        <p className="brand">cloground</p>
        <nav>
          <button type="button" className="nav-item active">MEN</button>
          <button type="button" className="nav-item">WOMEN</button>
          <button type="button" className="nav-item">KIDS</button>
          <button type="button" className="nav-item">HOME</button>
          <button type="button" className="nav-item">BEAUTY</button>
        </nav>
        <div className="nav-badges">
          <span>Wishlist: {wishlist.length}</span>
          <span>Cart: {cart.items.length}</span>
        </div>
      </header>

      <section className="campaign-wrap">
        <article className="sale-hero">
          <p className="pill">SPRING DROP 2026</p>
          <h1>Street-ready looks. Everyday prices. Only at cloground.</h1>
          <p>
            Explore premium trends inspired by top fashion marketplaces with your own
            personalized cart and wishlist flow.
          </p>
        </article>
        <article className="deals-card">
          <p className="small-head">TODAY DEALS</p>
          <h2>Up to 55% Off</h2>
          <p>Best-rated styles refreshed daily at 8 PM.</p>
          <div className="deal-tags">
            <span>FAST DELIVERY</span>
            <span>EASY RETURN</span>
            <span>TREND PICKS</span>
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
              onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profile?.email || ''}
              onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
            />

            <label htmlFor="city">City</label>
            <input
              id="city"
              value={profile?.city || ''}
              onChange={(e) => setProfile((prev) => ({ ...prev, city: e.target.value }))}
            />

            <button className="btn-main" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </aside>

        <section className="panel products-panel">
          <div className="panel-head products-head">
            <h2>Trending Products</h2>
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
            </div>
          </div>

          <div className="products-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <img src={product.image} alt={product.title} />
                <div className="product-body">
                  <p className="category">{product.category}</p>
                  <h3>{product.title}</h3>
                  <p className="meta">INR {product.price.toLocaleString()}</p>
                  <p className="rating">Rating {product.rating}</p>
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
            ))}
          </div>
        </section>

        <aside className="panel side-panel">
          <section>
            <div className="panel-head compact">
              <h2>Cart</h2>
              <p>{cart.items.length} items</p>
            </div>
            <div className="stack-list">
              {cart.items.length === 0 ? (
                <p className="empty-text">Your cart is empty.</p>
              ) : (
                cart.items.map((item) => (
                  <article key={item.productId} className="row-card">
                    <div>
                      <h4>{item.product.title}</h4>
                      <p>INR {item.product.price.toLocaleString()}</p>
                    </div>
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
                  </article>
                ))
              )}
            </div>
            <p className="total">Total INR {cart.total.toLocaleString()}</p>
          </section>

          <section>
            <div className="panel-head compact">
              <h2>Wishlist</h2>
              <p>{wishlist.length} saved</p>
            </div>
            <div className="stack-list">
              {wishlist.length === 0 ? (
                <p className="empty-text">No items in wishlist.</p>
              ) : (
                wishlist.map((item) => (
                  <article key={item.id} className="row-card">
                    <div>
                      <h4>{item.title}</h4>
                      <p>INR {item.price.toLocaleString()}</p>
                    </div>
                    <button type="button" className="btn-link" onClick={() => toggleWishlist(item.id)}>
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}

export default App
