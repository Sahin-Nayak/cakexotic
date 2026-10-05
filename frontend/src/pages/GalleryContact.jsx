import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import api from '../utils/api';

export function Gallery() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get('/products').then(r => setProducts(r.data)); }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Our Gallery</h1>
        <p>A feast for the eyes before a feast for the palate</p>
      </div>
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ columns: 3, gap: 16 }}>
          {products.filter(p => p.image_url).map(p => (
            <div key={p.id} style={{ breakInside: 'avoid', marginBottom: 16, borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}
              onMouseEnter={e => e.currentTarget.querySelector('.overlay').style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector('.overlay').style.opacity = 0}>
              <img src={p.image_url} alt={p.name} style={{ width: '100%', display: 'block' }} />
              <div className="overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,31,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s', color: 'white' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: 'var(--gold-light)', fontSize: 15, fontWeight: 700 }}>₹{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Contact({ settings }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you</p>
      </div>
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="grid-2" style={{ gap: 48 }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 24 }}>Contact Details</h2>
            {[
              { icon: <MapPin size={20} />, label: 'Address', value: settings?.address || '12, Baker Street, Mumbai' },
              { icon: <Phone size={20} />, label: 'Phone', value: settings?.phone || '+91 98765 43210' },
              { icon: <Mail size={20} />, label: 'Email', value: settings?.email || 'hello@cakexotic.in' },
              { icon: <Clock size={20} />, label: 'Hours', value: 'Mon–Sat: 9am–9pm · Sun: 10am–7pm' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(212,168,83,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-dark)', flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontWeight: 500 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3>Message Sent!</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handle}>
                <h3 style={{ marginBottom: 20 }}>Send a Message</h3>
                {[
                  { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
                  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 99999 99999' },
                ].map(f => (
                  <div className="form-group" key={f.key}>
                    <label>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required />
                  </div>
                ))}
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={4} placeholder="How can we help?" value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
