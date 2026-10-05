import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

// ── Generic CRUD Table ──
function CrudManager({ title, apiBase, fields, emptyItem, renderRow }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editing, setEditing] = useState(null);

  const load = () => { api.get(`${apiBase}/all`).then(r => setItems(r.data || [])); };
  useEffect(() => { load(); }, [apiBase]);

  const save = async () => {
    try {
      if (editing) { await api.put(`${apiBase}/${editing}`, form); toast.success('Updated!'); }
      else { await api.post(apiBase, form); toast.success('Added!'); }
      setModal(false); setEditing(null); setForm(emptyItem); load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`${apiBase}/${id}`); load(); toast.success('Deleted');
  };

  const openEdit = (item) => { setForm({ ...item }); setEditing(item.id); setModal(true); };
  const openAdd = () => { setForm(emptyItem); setEditing(null); setModal(true); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>{title}</h2>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add New</button>
      </div>
      <div>
        {items.length === 0 ? <div className="empty-state"><p>No items yet. Click "Add New" to start.</p></div>
          : items.map(item => renderRow(item, openEdit, del))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>{editing ? 'Edit' : 'Add'} {title.replace(' Manager', '').replace('Manage ', '')}</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', fontSize: 22, color: 'var(--text-muted)' }}>×</button>
            </div>
            {fields.map(field => (
              <div className="form-group" key={field.key}>
                <label>{field.label}</label>
                {field.type === 'textarea'
                  ? <textarea rows={field.rows || 3} value={form[field.key] || ''} onChange={f(field.key)} placeholder={field.placeholder} />
                  : field.type === 'checkbox'
                  ? <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="checkbox" checked={!!form[field.key]} onChange={f(field.key)} /> {field.checkLabel}
                    </label>
                  : <input type={field.type || 'text'} value={form[field.key] || ''} onChange={f(field.key)} placeholder={field.placeholder} />
                }
                {field.key.includes('image_url') && form[field.key] && (
                  <img src={form[field.key]} alt="preview" style={{ marginTop: 8, width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={e => e.target.style.display = 'none'} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABOUT MANAGER ──
export function AboutManager() {
  const fields = [
    { key: 'title', label: 'Title', placeholder: 'Our Story' },
    { key: 'subtitle', label: 'Subtitle', placeholder: 'Baking happiness since 2010' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 5, placeholder: 'Full description...' },
    { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '1' },
    { key: 'is_visible', label: 'Visible on website', type: 'checkbox', checkLabel: 'Show this section' },
  ];

  const renderRow = (item, edit, del) => (
    <div key={item.id} className="card" style={{ marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {item.image_url && <img src={item.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: 'var(--gold-dark)', marginBottom: 4 }}>{item.subtitle}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.description?.slice(0, 100)}...</div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: item.is_visible ? 'rgba(58,138,74,0.1)' : 'rgba(192,57,43,0.1)', color: item.is_visible ? 'var(--success)' : 'var(--error)' }}>{item.is_visible ? 'Visible' : 'Hidden'}</span>
        <button className="btn btn-sm btn-outline" onClick={() => edit(item)}><Edit2 size={13} /></button>
        <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}><Trash2 size={13} /></button>
      </div>
    </div>
  );
  return <CrudManager title="About Manager" apiBase="/about" fields={fields} emptyItem={{ title: '', subtitle: '', description: '', image_url: '', sort_order: 1, is_visible: true }} renderRow={renderRow} />;
}

// ── SERVICES MANAGER ──
export function ServicesManager() {
  const fields = [
    { key: 'icon', label: 'Icon Emoji', placeholder: '🎂' },
    { key: 'title', label: 'Service Title', placeholder: 'Custom Cakes' },
    { key: 'description', label: 'Description', type: 'textarea', rows: 3, placeholder: 'What this service offers...' },
    { key: 'price_starting', label: 'Starting Price', placeholder: '₹499' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '1' },
    { key: 'is_visible', label: 'Visible', type: 'checkbox', checkLabel: 'Show on website' },
  ];

  const renderRow = (item, edit, del) => (
    <div key={item.id} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.description?.slice(0, 80)}...</div>
        {item.price_starting && <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600, marginTop: 2 }}>Starting {item.price_starting}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: item.is_visible ? 'rgba(58,138,74,0.1)' : 'rgba(192,57,43,0.1)', color: item.is_visible ? 'var(--success)' : 'var(--error)' }}>{item.is_visible ? 'Visible' : 'Hidden'}</span>
        <button className="btn btn-sm btn-outline" onClick={() => edit(item)}><Edit2 size={13} /></button>
        <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}><Trash2 size={13} /></button>
      </div>
    </div>
  );
  return <CrudManager title="Services Manager" apiBase="/services" fields={fields} emptyItem={{ icon: '🎂', title: '', description: '', price_starting: '', sort_order: 1, is_visible: true }} renderRow={renderRow} />;
}

// ── OUTLETS MANAGER ──
export function OutletsManager() {
  const fields = [
    { key: 'city', label: 'City *', placeholder: 'Mumbai' },
    { key: 'state', label: 'State *', placeholder: 'Maharashtra' },
    { key: 'address', label: 'Full Address', type: 'textarea', rows: 2, placeholder: '12, Baker Street, Bandra...' },
    { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
    { key: 'email', label: 'Email', placeholder: 'mumbai@bakery.in' },
    { key: 'timing', label: 'Working Hours', placeholder: 'Mon–Sat: 9am–9pm' },
    { key: 'image_url', label: 'Outlet Photo URL', placeholder: 'https://...' },
    { key: 'google_maps_url', label: 'Google Maps URL', placeholder: 'https://maps.google.com/...' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '1' },
    { key: 'is_active', label: 'Active', type: 'checkbox', checkLabel: 'Show on website' },
  ];

  const renderRow = (item, edit, del) => (
    <div key={item.id} className="card" style={{ marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(212,168,83,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
        {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🏪'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{item.city} <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>— {item.state}</span></div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.address}</div>
        {item.phone && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.phone}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm btn-outline" onClick={() => edit(item)}><Edit2 size={13} /></button>
        <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}><Trash2 size={13} /></button>
      </div>
    </div>
  );
  return <CrudManager title="Outlets Manager" apiBase="/outlets" fields={fields} emptyItem={{ city: '', state: 'Maharashtra', address: '', phone: '', email: '', timing: '', image_url: '', google_maps_url: '', sort_order: 1, is_active: true }} renderRow={renderRow} />;
}

// ── CHEFS MANAGER ──
export function ChefsManager() {
  const fields = [
    { key: 'name', label: 'Chef Name *', placeholder: 'Chef Priya Sharma' },
    { key: 'role', label: 'Role / Title', placeholder: 'Head Pastry Chef' },
    { key: 'bio', label: 'Bio', type: 'textarea', rows: 4, placeholder: 'Brief background...' },
    { key: 'image_url', label: 'Photo URL', placeholder: 'https://...' },
    { key: 'speciality', label: 'Speciality', placeholder: 'Wedding Cakes & Sugar Art' },
    { key: 'experience_years', label: 'Years of Experience', type: 'number', placeholder: '10' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '1' },
    { key: 'is_visible', label: 'Visible', type: 'checkbox', checkLabel: 'Show on website' },
  ];

  const renderRow = (item, edit, del) => (
    <div key={item.id} className="card" style={{ marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--gold)' }}>
        {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: 'var(--cream-dark)' }}>👨‍🍳</div>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 600 }}>{item.role}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.speciality} · {item.experience_years} yrs</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm btn-outline" onClick={() => edit(item)}><Edit2 size={13} /></button>
        <button className="btn btn-sm btn-danger" onClick={() => del(item.id)}><Trash2 size={13} /></button>
      </div>
    </div>
  );
  return <CrudManager title="Chefs Manager" apiBase="/chefs" fields={fields} emptyItem={{ name: '', role: '', bio: '', image_url: '', speciality: '', experience_years: 0, sort_order: 1, is_visible: true }} renderRow={renderRow} />;
}

// ── ACHIEVEMENTS MANAGER ──
export function AchievementsManager() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ icon: '🏆', number: '', label: '', sort_order: 1 });
  const [editing, setEditing] = useState(null);

  const load = () => { api.get('/achievements').then(r => setItems(r.data || [])); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/achievements/${editing}`, form);
      else await api.post('/achievements', form);
      toast.success('Saved!'); setModal(false); setEditing(null); load();
    } catch { toast.error('Failed'); }
  };
  const del = async id => { if (!window.confirm('Delete?')) return; await api.delete(`/achievements/${id}`); load(); };
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Achievements / Stats</h2>
        <button className="btn btn-primary" onClick={() => { setForm({ icon: '🏆', number: '', label: '', sort_order: 1 }); setEditing(null); setModal(true); }}><Plus size={15} /> Add Stat</button>
      </div>
      <div className="grid-3">
        {items.map(a => (
          <div key={a.id} className="card" style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-outline" style={{ padding: '3px 6px' }} onClick={() => { setForm({ ...a }); setEditing(a.id); setModal(true); }}><Edit2 size={11} /></button>
              <button className="btn btn-sm btn-danger" style={{ padding: '3px 6px' }} onClick={() => del(a.id)}><Trash2 size={11} /></button>
            </div>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-dark)' }}>{a.number}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{a.label}</div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400 }}>
            <h3 style={{ marginBottom: 20 }}>{editing ? 'Edit' : 'Add'} Achievement</h3>
            {[{ k: 'icon', l: 'Icon Emoji', ph: '🏆' }, { k: 'number', l: 'Number / Value', ph: '50,000+' }, { k: 'label', l: 'Label', ph: 'Cakes Delivered' }, { k: 'sort_order', l: 'Sort Order', t: 'number', ph: '1' }].map(x => (
              <div className="form-group" key={x.k}><label>{x.l}</label><input type={x.t || 'text'} placeholder={x.ph} value={form[x.k] || ''} onChange={f(x.k)} /></div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FESTIVAL THEMES ──
export function FestivalThemes() {
  const [themes, setThemes] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const { loadTheme } = useTheme();

  const load = () => { api.get('/themes').then(r => setThemes(r.data || [])); };
  useEffect(() => { load(); }, []);

  const activate = async (id) => {
    try {
      await api.patch(`/themes/${id}/activate`);
      await loadTheme();
      load();
      toast.success('Festival theme activated! 🎉');
    } catch { toast.error('Failed'); }
  };

  const deactivateAll = async () => {
    try {
      await api.patch('/themes/deactivate-all');
      await loadTheme();
      load();
      toast.success('Default theme restored');
    } catch { toast.error('Failed'); }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/themes/${editModal.id}`, editModal);
      setEditModal(null); load();
      toast.success('Theme updated!');
    } catch { toast.error('Failed'); }
  };

  const activeTheme = themes.find(t => t.is_active);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Festival Themes</h2>
        {activeTheme && (
          <button className="btn btn-sm btn-outline" onClick={deactivateAll}>Reset to Default Theme</button>
        )}
      </div>

      {activeTheme && (
        <div style={{ background: activeTheme.primary_color, color: '#fff', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{activeTheme.emoji}</span>
          <div>
            <div style={{ fontWeight: 700 }}>Active: {activeTheme.name}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{activeTheme.banner_text?.slice(0, 80)}...</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {themes.map(t => (
          <div key={t.id} style={{ border: `2px solid ${t.is_active ? t.primary_color : 'var(--border)'}`, borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'all 0.2s' }}>
            <div style={{ background: t.primary_color, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{t.emoji}</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{t.name}</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[t.primary_color, t.secondary_color, t.accent_color, t.bg_color].filter(Boolean).map((c, i) => (
                  <div key={i} title={c} style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: '1px solid var(--border)' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>{t.banner_text?.slice(0, 60)}...</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {t.is_active
                  ? <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', background: t.primary_color, color: '#fff' }} disabled><Check size={12} /> Active</button>
                  : <button className="btn btn-sm btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => activate(t.id)}>Activate</button>
                }
                <button className="btn btn-sm btn-outline" style={{ padding: '7px 10px' }} onClick={() => setEditModal({ ...t })}><Edit2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Theme Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3>Edit — {editModal.name} {editModal.emoji}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', fontSize: 22, color: 'var(--text-muted)' }}>×</button>
            </div>
            {[
              { k: 'banner_text', l: 'Banner Text', type: 'textarea' },
              { k: 'banner_image_url', l: 'Banner Image URL', ph: 'https://...' },
              { k: 'primary_color', l: 'Primary Color', type: 'color' },
              { k: 'secondary_color', l: 'Secondary Color', type: 'color' },
              { k: 'accent_color', l: 'Accent Color', type: 'color' },
              { k: 'bg_color', l: 'Background Color', type: 'color' },
              { k: 'text_color', l: 'Text / Dark Color', type: 'color' },
            ].map(x => (
              <div className="form-group" key={x.k}>
                <label>{x.l}</label>
                {x.type === 'textarea'
                  ? <textarea rows={3} value={editModal[x.k] || ''} onChange={e => setEditModal(p => ({ ...p, [x.k]: e.target.value }))} />
                  : x.type === 'color'
                  ? <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={editModal[x.k] || '#000000'} onChange={e => setEditModal(p => ({ ...p, [x.k]: e.target.value }))} style={{ width: 48, height: 36, padding: 2, cursor: 'pointer' }} />
                      <input type="text" value={editModal[x.k] || ''} onChange={e => setEditModal(p => ({ ...p, [x.k]: e.target.value }))} placeholder="#RRGGBB" style={{ flex: 1 }} />
                    </div>
                  : <input type="text" placeholder={x.ph} value={editModal[x.k] || ''} onChange={e => setEditModal(p => ({ ...p, [x.k]: e.target.value }))} />
                }
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SALES LOG ──
export function SalesLog() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity_sold: 1, notes: '' });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const load = () => {
    api.get('/products').then(r => setProducts(r.data));
    api.get(`/sales?date=${date}`).then(r => setLogs(r.data));
  };
  useEffect(load, [date]);

  const submit = async () => {
    if (!form.product_id) { toast.error('Select a product'); return; }
    try {
      await api.post('/sales', form);
      toast.success('Sale logged! Stock updated.');
      setForm({ product_id: '', quantity_sold: 1, notes: '' });
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const dayTotal = logs.reduce((s, l) => s + parseFloat(l.total_amount || 0), 0);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Log a Sale</h2>
      <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Record Offline Sale</h3>
          <div className="form-group"><label>Cake *</label>
            <select value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}>
              <option value="">Select cake...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price} (Stock: {p.stock_quantity})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Quantity Sold</label><input type="number" min={1} value={form.quantity_sold} onChange={e => setForm(p => ({ ...p, quantity_sold: parseInt(e.target.value) || 1 }))} /></div>
          <div className="form-group"><label>Notes (optional)</label><input placeholder="e.g. Birthday party order" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          {form.product_id && (
            <div style={{ background: 'rgba(212,168,83,0.1)', borderRadius: 'var(--radius-sm)', padding: 12, marginBottom: 16, fontSize: 14 }}>
              Total: <strong style={{ color: 'var(--gold-dark)' }}>₹{(parseFloat(products.find(p => p.id == form.product_id)?.price || 0) * form.quantity_sold).toFixed(0)}</strong>
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={submit}>Log Sale & Deduct Stock</button>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1rem' }}>Sales for Date</h3>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
          </div>
          <div className="card">
            {logs.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>No sales for this date</p>
              : (<>
                {logs.map(l => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <div><div style={{ fontWeight: 600 }}>{l.product_name}</div><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>×{l.quantity_sold} · {l.logged_by_name}{l.notes ? ` · ${l.notes}` : ''}</div></div>
                    <div style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>₹{l.total_amount}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 15 }}>
                  <span>Day Total</span><span style={{ color: 'var(--gold-dark)' }}>₹{dayTotal.toFixed(0)}</span>
                </div>
              </>)
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SITE SETTINGS ──
export function SiteSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/settings').then(r => { setSettings(r.data); setLoading(false); }); }, []);

  const save = async () => {
    try { await api.put('/settings', settings); toast.success('Settings saved!'); }
    catch { toast.error('Failed to save'); }
  };

  const fields = [
    { key: 'shop_name', label: 'Shop Name' }, { key: 'tagline', label: 'Tagline' },
    { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', multiline: true },
    { key: 'announcement', label: 'Announcement Bar Text', multiline: true },
    { key: 'hero_title', label: 'Hero Title' }, { key: 'hero_subtitle', label: 'Hero Subtitle', multiline: true },
    { key: 'hero_slide_1', label: 'Hero Slide 1 URL', placeholder: 'https://...' },
    { key: 'hero_slide_2', label: 'Hero Slide 2 URL', placeholder: 'https://...' },
    { key: 'hero_slide_3', label: 'Hero Slide 3 URL', placeholder: 'https://...' },
    { key: 'hero_slide_4', label: 'Hero Slide 4 URL (optional)', placeholder: 'https://...' },
    { key: 'hero_slide_5', label: 'Hero Slide 5 URL (optional)', placeholder: 'https://...' },
  ];

  if (loading) return <p>Loading settings...</p>;
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Website Settings</h2>
      <div className="card" style={{ maxWidth: 640 }}>
        {fields.map(f => (
          <div className="form-group" key={f.key}>
            <label>{f.label}</label>
            {f.multiline
              ? <textarea rows={3} value={settings[f.key] || ''} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} />
              : <input value={settings[f.key] || ''} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} />
            }
            {f.key.startsWith('hero_slide_') && settings[f.key] && (
              <img src={settings[f.key]} alt="preview" style={{ marginTop: 8, width: '100%', height: 90, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
            )}
          </div>
        ))}
        <button className="btn btn-primary" onClick={save}>Save All Settings</button>
      </div>
    </div>
  );
}

// ── REVIEWS MANAGER ──
export function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  useEffect(() => { api.get('/reviews/all').then(r => setReviews(r.data || [])); }, []);
  const toggle = async (id) => {
    const { data } = await api.patch(`/reviews/${id}/approve`);
    setReviews(prev => prev.map(r => r.id === id ? data : r));
  };
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Reviews Manager</h2>
      {reviews.length === 0 ? <div className="empty-state"><p>No reviews yet</p></div>
        : reviews.map(r => (
          <div key={r.id} className="card" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.customer_name}</span>
                <span style={{ color: 'var(--gold)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span style={{ background: r.is_approved ? 'rgba(58,138,74,0.1)' : 'rgba(192,57,43,0.1)', color: r.is_approved ? 'var(--success)' : 'var(--error)', padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>{r.is_approved ? 'Approved' : 'Hidden'}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.comment}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
            <button className={`btn btn-sm ${r.is_approved ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggle(r.id)}>{r.is_approved ? 'Hide' : 'Approve'}</button>
          </div>
        ))}
    </div>
  );
}

// ── STOCK VIEW ──
export function StockView() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get('/products/all').then(r => setProducts(r.data || [])); }, []);
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Stock Overview</h2>
      <div className="grid-3">
        {products.map(p => (
          <div key={p.id} className="card" style={{ borderLeft: `4px solid ${p.stock_quantity === 0 ? 'var(--error)' : p.stock_quantity <= 5 ? 'var(--warning)' : 'var(--success)'}` }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: p.stock_quantity === 0 ? 'var(--error)' : p.stock_quantity <= 5 ? 'var(--warning)' : 'var(--success)' }}>{p.stock_quantity}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.stock_quantity === 0 ? 'OUT OF STOCK' : p.stock_quantity <= 5 ? 'LOW STOCK' : 'In Stock'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{p.is_available ? '✅ Available' : '❌ Hidden'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
