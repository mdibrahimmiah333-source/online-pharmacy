import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const sections = {
  home: 'home',
  products: 'products',
  cart: 'cart',
  checkout: 'checkout',
  orders: 'orders',
};

const defaultShipping = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Bangladesh',
};

const authInitialState = {
  name: '',
  email: '',
  password: '',
};

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('pharma_auth');
    return raw ? JSON.parse(raw) : { token: '', user: null };
  } catch {
    return { token: '', user: null };
  }
};

function App() {
  const [activeSection, setActiveSection] = useState(sections.home);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(authInitialState);
  const [authMessage, setAuthMessage] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [token, setToken] = useState(() => getStoredAuth().token || '');
  const [user, setUser] = useState(() => getStoredAuth().user || null);

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const [checkoutForm, setCheckoutForm] = useState(defaultShipping);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const categories = useMemo(
    () => ['All', ...new Set(medicines.map((item) => item.category).filter(Boolean))],
    [medicines]
  );

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const matchesCategory = activeCategory === 'All' || medicine.category === activeCategory;
      const term = search.toLowerCase();
      const matchesSearch =
        medicine.name.toLowerCase().includes(term) ||
        medicine.category.toLowerCase().includes(term) ||
        medicine.manufacturer.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, medicines]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),
    [cartItems]
  );

  const authedRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  };

  const fetchMedicines = async () => {
    setCatalogLoading(true);
    setCatalogError('');
    try {
      const data = await authedRequest('/api/medicines');
      setMedicines(data);
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!token) {
      setCartItems([]);
      return;
    }

    setCartLoading(true);
    try {
      const data = await authedRequest('/api/cart');
      setCartItems(data.items || []);
    } catch (error) {
      setCartMessage(error.message);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!token) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    try {
      const data = await authedRequest('/api/orders/my');
      setOrders(data || []);
    } catch (error) {
      setCheckoutMessage(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    localStorage.setItem('pharma_auth', JSON.stringify({ token, user }));
    fetchCart();
    fetchOrders();
  }, [token]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthMessage('');

    try {
      const path = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authMode === 'register'
          ? { name: authForm.name, email: authForm.email, password: authForm.password }
          : { email: authForm.email, password: authForm.password };

      const data = await authedRequest(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setToken(data.token);
      setUser(data.user);
      setAuthMessage(`${authMode === 'register' ? 'Registered' : 'Logged in'} successfully.`);
      setAuthForm(authInitialState);
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setCartItems([]);
    setOrders([]);
    setAuthMessage('Logged out.');
  };

  const addToCart = async (medicineId) => {
    if (!token) {
      setCartMessage('Please login before adding items to cart.');
      return;
    }

    try {
      const data = await authedRequest('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ medicineId, quantity: 1 }),
      });
      setCartItems(data.items || []);
      setCartMessage('Item added to cart.');
    } catch (error) {
      setCartMessage(error.message);
    }
  };

  const updateQuantity = async (medicineId, quantity) => {
    if (quantity < 1) {
      return;
    }

    try {
      const data = await authedRequest(`/api/cart/items/${medicineId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      setCartItems(data.items || []);
    } catch (error) {
      setCartMessage(error.message);
    }
  };

  const removeItem = async (medicineId) => {
    try {
      const data = await authedRequest(`/api/cart/items/${medicineId}`, {
        method: 'DELETE',
      });
      setCartItems(data.items || []);
    } catch (error) {
      setCartMessage(error.message);
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setCheckoutSubmitting(true);
    setCheckoutMessage('');

    try {
      await authedRequest('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: checkoutForm,
          paymentMethod,
        }),
      });

      setCheckoutMessage('Order placed successfully.');
      setCheckoutForm(defaultShipping);
      await fetchCart();
      await fetchOrders();
      setActiveSection(sections.orders);
    } catch (error) {
      setCheckoutMessage(error.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">BD PharmaCare</div>
        <nav>
          <button onClick={() => setActiveSection(sections.home)}>Home</button>
          <button onClick={() => setActiveSection(sections.products)}>Products</button>
          <button onClick={() => setActiveSection(sections.cart)}>Cart ({cartCount})</button>
          <button onClick={() => setActiveSection(sections.checkout)}>Checkout</button>
          <button onClick={() => setActiveSection(sections.orders)}>Orders</button>
        </nav>
      </header>

      <section className="auth-panel">
        {user ? (
          <div className="auth-row">
            <p>
              Logged in as <strong>{user.name}</strong> ({user.email})
            </p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <h3>{authMode === 'register' ? 'Create account' : 'Login'}</h3>
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Full name"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
            />
            <div className="auth-actions">
              <button className="primary" type="submit" disabled={authSubmitting}>
                {authSubmitting ? 'Please wait...' : authMode === 'register' ? 'Register' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))}
              >
                {authMode === 'login' ? 'Need an account?' : 'Already registered?'}
              </button>
            </div>
            {authMessage && <p className="status-message">{authMessage}</p>}
          </form>
        )}
      </section>

      {activeSection === sections.home && (
        <section className="hero">
          <h1>Modern Online Pharmacy for Bangladesh</h1>
          <p>Order trusted medicines and checkout with real backend APIs.</p>
          <button className="primary" onClick={() => setActiveSection(sections.products)}>
            Shop Medicines
          </button>
        </section>
      )}

      {activeSection === sections.products && (
        <section className="products-section">
          <h2>Product Listing</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Search by medicine, category or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={category === activeCategory ? 'active' : ''}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {catalogLoading && <p>Loading medicines...</p>}
          {catalogError && <p className="error">{catalogError}</p>}

          <div className="products-grid">
            {filteredMedicines.map((medicine) => (
              <article className="product-card" key={medicine._id}>
                <p className="pill">{medicine.category || 'General'}</p>
                <h3>{medicine.name}</h3>
                <p className="company">{medicine.manufacturer || 'Unknown manufacturer'}</p>
                <p>{medicine.description || 'No description available.'}</p>
                <p className="price">৳ {medicine.price}</p>
                <p>Stock: {medicine.stock}</p>
                {medicine.requiresPrescription && <small className="rx-label">Prescription required</small>}
                <button className="primary" onClick={() => addToCart(medicine._id)}>
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSection === sections.cart && (
        <section className="cart-section">
          <h2>Your Cart</h2>
          {!token ? (
            <p>Please login to view and manage your cart.</p>
          ) : cartLoading ? (
            <p>Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <p>Your cart is empty. Add medicines from the product page.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div className="cart-item" key={item.medicine._id}>
                  <div>
                    <h4>{item.medicine.name}</h4>
                    <p>৳ {item.priceAtAdd} each</p>
                  </div>
                  <div className="qty-controls">
                    <button onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)}>+</button>
                    <button onClick={() => removeItem(item.medicine._id)}>Remove</button>
                  </div>
                </div>
              ))}
              <h3>Total: ৳ {cartTotal.toFixed(2)}</h3>
            </>
          )}
          {cartMessage && <p className="status-message">{cartMessage}</p>}
        </section>
      )}

      {activeSection === sections.checkout && (
        <section className="checkout-section">
          <h2>Checkout</h2>
          {!token ? (
            <p>Please login to place an order.</p>
          ) : (
            <form className="checkout-form" onSubmit={submitOrder}>
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={checkoutForm.fullName}
                  onChange={(e) =>
                    setCheckoutForm((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </label>
              <label>
                Phone Number
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
              <label>
                Address Line 1
                <input
                  type="text"
                  required
                  value={checkoutForm.addressLine1}
                  onChange={(e) =>
                    setCheckoutForm((prev) => ({ ...prev, addressLine1: e.target.value }))
                  }
                />
              </label>
              <label>
                Address Line 2
                <input
                  type="text"
                  value={checkoutForm.addressLine2}
                  onChange={(e) =>
                    setCheckoutForm((prev) => ({ ...prev, addressLine2: e.target.value }))
                  }
                />
              </label>
              <label>
                City
                <input
                  type="text"
                  required
                  value={checkoutForm.city}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, city: e.target.value }))}
                />
              </label>
              <label>
                State
                <input
                  type="text"
                  required
                  value={checkoutForm.state}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, state: e.target.value }))}
                />
              </label>
              <label>
                Postal Code
                <input
                  type="text"
                  required
                  value={checkoutForm.postalCode}
                  onChange={(e) =>
                    setCheckoutForm((prev) => ({ ...prev, postalCode: e.target.value }))
                  }
                />
              </label>
              <label>
                Country
                <input
                  type="text"
                  required
                  value={checkoutForm.country}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, country: e.target.value }))}
                />
              </label>
              <label>
                Payment Method
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="cod">Cash on Delivery</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
              </label>
              <button type="submit" className="primary" disabled={checkoutSubmitting}>
                {checkoutSubmitting ? 'Placing order...' : 'Place Order'}
              </button>
            </form>
          )}
          {checkoutMessage && <p className="status-message">{checkoutMessage}</p>}
        </section>
      )}

      {activeSection === sections.orders && (
        <section className="cart-section">
          <h2>My Orders</h2>
          {!token ? (
            <p>Please login to view your orders.</p>
          ) : ordersLoading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order._id} className="product-card">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p>Status: {order.status}</p>
                  <p>Total: ৳ {order.total}</p>
                  <p>Items: {order.items.length}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
