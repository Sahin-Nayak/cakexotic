import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Filter } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data));
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category_id === parseInt(activeCategory);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (p) => {
    addItem({ product_id: p.id, product_name: p.name, unit_price: parseFloat(p.price), quantity: 1, subtotal: parseFloat(p.price), image_url: p.image_url });
    toast.success(`${p.name} added!`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Our Menu</h1>
        <p>Handcrafted with love, baked fresh daily</p>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input placeholder="Search cakes..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory('all')}>All</button>
            {categories.map(c => (
              <button key={c.id} className={`btn btn-sm ${activeCategory === c.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveCategory(c.id)}>{c.name}</button>
            ))}
          </div>
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No cakes found</p></div>
        ) : (
          <div className="grid-3">
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
                    {p.is_customizable && <span style={{ background: 'var(--gold)', color: 'var(--brown)', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>CUSTOMIZABLE</span>}
                    {p.stock_quantity === 0 && <span style={{ background: 'var(--error)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>SOLD OUT</span>}
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <p style={{ fontSize: 11, color: 'var(--gold-dark)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.category_name}</p>
                  <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{p.description?.slice(0, 65)}...</p>
                  {p.serving_size && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Serves {p.serving_size} · {p.weight}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{p.price}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => handleAdd(p)} disabled={p.stock_quantity === 0}>
                      <ShoppingCart size={13} /> {p.stock_quantity === 0 ? 'Sold Out' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
