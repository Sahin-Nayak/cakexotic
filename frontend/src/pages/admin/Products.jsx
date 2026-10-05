import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', price: '', category_id: '', image_url: '', stock_quantity: 0, is_customizable: false, weight: '', serving_size: '', is_available: true };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => {
    api.get('/products/all').then(r => setProducts(r.data));
    api.get('/products/categories').then(r => setCategories(r.data));
  };
  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit = (p) => { setForm({ ...p, category_id: p.category_id || '' }); setEditing(p.id); setModal(true); };

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form);
        toast.success('Product updated');
      } else {
        await api.post('/products', form);
        toast.success('Product added');
      }
      setModal(false);
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const toggle = async (id) => {
    await api.patch(`/products/${id}/toggle`);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: !p.is_available } : p));
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Product Manager</h2>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Cake</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--white)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <thead>
            <tr style={{ background: 'var(--cream-dark)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {['Image', 'Name', 'Category', 'Price', 'Stock', 'Available', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 16px' }}>
                  {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  {p.is_customizable && <span style={{ fontSize: 10, color: 'var(--gold-dark)', fontWeight: 600 }}>CUSTOMIZABLE</span>}
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{p.category_name}</td>
                <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{p.price}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ color: p.stock_quantity <= 5 ? 'var(--error)' : 'var(--success)', fontWeight: 600, fontSize: 14 }}>{p.stock_quantity}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <button onClick={() => toggle(p.id)} style={{ background: 'none', color: p.is_available ? 'var(--success)' : 'var(--error)' }}>
                    {p.is_available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(p.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: 20 }}>{editing ? 'Edit Cake' : 'Add New Cake'}</h3>
            <div className="grid-2">
              <div className="form-group"><label>Name *</label><input value={form.name} onChange={f('name')} placeholder="Cake name" /></div>
              <div className="form-group"><label>Price (₹) *</label><input type="number" value={form.price} onChange={f('price')} placeholder="0" /></div>
            </div>
            <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={f('description')} placeholder="Describe the cake..." /></div>
            <div className="grid-2">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category_id} onChange={f('category_id')}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Stock Quantity</label><input type="number" value={form.stock_quantity} onChange={f('stock_quantity')} /></div>
            </div>
            <div className="form-group"><label>Image URL</label><input value={form.image_url} onChange={f('image_url')} placeholder="https://..." /></div>
            <div className="grid-2">
              <div className="form-group"><label>Weight</label><input value={form.weight} onChange={f('weight')} placeholder="e.g. 1kg" /></div>
              <div className="form-group"><label>Serving Size</label><input value={form.serving_size} onChange={f('serving_size')} placeholder="e.g. 8-10" /></div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_customizable} onChange={f('is_customizable')} /> Customizable
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_available} onChange={f('is_available')} /> Available
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Add Cake'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
