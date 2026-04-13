import { useMemo, useState } from 'react';

const medicines = [
  {
    id: 1,
    name: 'Napa Extra',
    category: 'Pain Relief',
    company: 'Beximco Pharma',
    price: 55,
    stock: 'In Stock',
    description: 'Fast pain and fever relief tablets.',
    prescriptionRequired: false,
  },
  {
    id: 2,
    name: 'Seclo 20',
    category: 'Gastric',
    company: 'Square Pharma',
    price: 78,
    stock: 'In Stock',
    description: 'Omeprazole capsules for acidity management.',
    prescriptionRequired: false,
  },
  {
    id: 3,
    name: 'Amdocal 5',
    category: 'Cardiac',
    company: 'Renata',
    price: 120,
    stock: 'Prescription Needed',
    description: 'Blood pressure management medicine.',
    prescriptionRequired: true,
  },
  {
    id: 4,
    name: 'Azithrol 500',
    category: 'Antibiotic',
    company: 'Incepta',
    price: 180,
    stock: 'Prescription Needed',
    description: 'Azithromycin antibiotic tablets.',
    prescriptionRequired: true,
  },
  {
    id: 5,
    name: 'Orsaline-N',
    category: 'Family Care',
    company: 'ACME',
    price: 25,
    stock: 'In Stock',
    description: 'Oral saline for hydration support.',
    prescriptionRequired: false,
  },
  {
    id: 6,
    name: 'Histacin',
    category: 'Allergy',
    company: 'Opsonin',
    price: 42,
    stock: 'In Stock',
    description: 'Anti-allergy tablets for seasonal relief.',
    prescriptionRequired: false,
  },
];

const categories = ['All', ...new Set(medicines.map((item) => item.category))];

function App() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [activeSection, setActiveSection] = useState('home');
  const [prescriptionFile, setPrescriptionFile] = useState('');

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const matchesCategory = activeCategory === 'All' || medicine.category === activeCategory;
      const term = search.toLowerCase();
      const matchesSearch =
        medicine.name.toLowerCase().includes(term) ||
        medicine.category.toLowerCase().includes(term) ||
        medicine.company.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.qty, 0);

  const addToCart = (medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) => (item.id === medicine.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...medicine, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="brand">BD PharmaCare</div>
        <nav>
          <button onClick={() => setActiveSection('home')}>Home</button>
          <button onClick={() => setActiveSection('products')}>Products</button>
          <button onClick={() => setActiveSection('cart')}>Cart ({cart.length})</button>
          <button onClick={() => setActiveSection('checkout')}>Checkout</button>
          <button onClick={() => setActiveSection('prescription')}>Prescription</button>
        </nav>
      </header>

      {activeSection === 'home' && (
        <section className="hero">
          <h1>Modern Online Pharmacy for Bangladesh</h1>
          <p>Order trusted medicines, healthcare essentials, and upload prescriptions from anywhere in Bangladesh.</p>
          <button className="primary" onClick={() => setActiveSection('products')}>
            Shop Medicines
          </button>
        </section>
      )}

      {activeSection === 'products' && (
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

          <div className="products-grid">
            {filteredMedicines.map((medicine) => (
              <article className="product-card" key={medicine.id}>
                <p className="pill">{medicine.category}</p>
                <h3>{medicine.name}</h3>
                <p className="company">{medicine.company}</p>
                <p>{medicine.description}</p>
                <p className="price">৳ {medicine.price}</p>
                {medicine.prescriptionRequired && <small className="rx-label">Prescription required</small>}
                <button className="primary" onClick={() => addToCart(medicine)}>
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'cart' && (
        <section className="cart-section">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty. Add medicines from the product page.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>৳ {item.price} each</p>
                  </div>
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item.id, -1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}
              <h3>Total: ৳ {cartTotal}</h3>
            </>
          )}
        </section>
      )}

      {activeSection === 'checkout' && (
        <section className="checkout-section">
          <h2>Checkout</h2>
          <form className="checkout-form">
            <label>
              Full Name
              <input type="text" placeholder="Enter your full name" required />
            </label>
            <label>
              Phone Number
              <input type="tel" placeholder="01XXXXXXXXX" required />
            </label>
            <label>
              Delivery Address
              <textarea rows="3" placeholder="House, Road, Area, District" required />
            </label>
            <label>
              Payment Method
              <select defaultValue="">
                <option value="" disabled>
                  Choose payment option
                </option>
                <option>bKash</option>
                <option>Nagad</option>
                <option>Cash on Delivery</option>
              </select>
            </label>
            <button type="submit" className="primary">
              Place Order
            </button>
          </form>
        </section>
      )}

      {activeSection === 'prescription' && (
        <section className="prescription-section">
          <h2>Upload Prescription</h2>
          <p>Upload a clear image/PDF of your prescription for pharmacist verification.</p>
          <label className="upload-box">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setPrescriptionFile(e.target.files?.[0]?.name || '')}
            />
            <span>{prescriptionFile ? `Selected: ${prescriptionFile}` : 'Click to select prescription file'}</span>
          </label>
          <button className="primary" disabled={!prescriptionFile}>
            Submit Prescription
          </button>
        </section>
      )}
    </div>
  );
}

export default App;
