import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle, Clock, Truck, Star } from 'lucide-react';
import api from '../utils/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'baking', label: 'Baking', icon: '🔥' },
  { key: 'ready', label: 'Ready', icon: '🎂' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

export default function TrackOrder() {
  const { orderNumber: paramOrder } = useParams();
  const [input, setInput] = useState(paramOrder || '');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paramOrder) fetchOrder(paramOrder);
  }, [paramOrder]);

  const fetchOrder = async (num) => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get(`/orders/track/${num}`);
      setOrder(data);
    } catch { setError('Order not found. Please check the order number.'); setOrder(null); }
    finally { setLoading(false); }
  };

  const currentStepIdx = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : -1;

  const statusColors = {
    pending: { bg: '#FFF3E0', color: '#E65100' },
    confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
    baking: { bg: '#FFF8E1', color: '#F57F17' },
    ready: { bg: '#E3F2FD', color: '#1565C0' },
    delivered: { bg: '#F3E5F5', color: '#6A1B9A' },
    cancelled: { bg: '#FFEBEE', color: '#C62828' },
  };

  return (
    <div>
      <div className="page-header">
        <h1>Track Your Order</h1>
        <p>Enter your order number to see live status</p>
      </div>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 700 }}>
        {/* Search */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              placeholder="Enter order number e.g. CSB12345678"
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && fetchOrder(input)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={() => fetchOrder(input)} disabled={loading}>
              <Search size={16} /> {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
          {error && <p style={{ color: 'var(--error)', fontSize: 13, marginTop: 10 }}>{error}</p>}
        </div>

        {order && (
          <div>
            {/* Order Header */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>ORDER NUMBER</p>
                  <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>{order.order_number}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...statusColors[order.status], padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, display: 'inline-block', textTransform: 'capitalize' }}>
                    {STATUS_STEPS.find(s => s.key === order.status)?.icon} {order.status}
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-dark)', marginTop: 8 }}>₹{order.total_amount}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            {order.status !== 'cancelled' && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 24, fontSize: '1rem' }}>Order Progress</h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                  {STATUS_STEPS.map((s, i) => {
                    const isDone = i < currentStepIdx;
                    const isActive = i === currentStepIdx;
                    return (
                      <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Line */}
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{ position: 'absolute', top: 20, left: '50%', right: '-50%', height: 3, background: isDone ? 'var(--success)' : 'var(--border)', zIndex: 0, transition: 'background 0.5s' }} />
                        )}
                        {/* Dot */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', zIndex: 1,
                          background: isDone ? 'var(--success)' : isActive ? 'var(--gold)' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, border: isActive ? '3px solid var(--gold-dark)' : 'none',
                          boxShadow: isActive ? '0 0 0 4px rgba(212,168,83,0.2)' : 'none',
                          transition: 'all 0.5s',
                        }}>
                          {s.icon}
                        </div>
                        <p style={{ fontSize: 11, marginTop: 8, textAlign: 'center', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--gold-dark)' : isDone ? 'var(--success)' : 'var(--text-muted)' }}>{s.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div style={{ background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20, textAlign: 'center' }}>
                <p style={{ color: '#C62828', fontWeight: 600, fontSize: 16 }}>❌ This order has been cancelled</p>
              </div>
            )}

            {/* Order Items */}
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Items Ordered</h3>
              {order.items?.filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{item.product_name}</span>
                    {item.is_custom && <span style={{ marginLeft: 8, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>Custom</span>}
                    <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>×{item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{item.subtotal}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 12 }}>
                <span>Total</span>
                <span style={{ color: 'var(--gold-dark)' }}>₹{order.total_amount}</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card">
              <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Delivery Details</h3>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                <p><strong style={{ color: 'var(--text)' }}>Type:</strong> {order.delivery_type === 'pickup' ? '🏪 Store Pickup' : '🚚 Home Delivery'}</p>
                {order.delivery_address && <p style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>Address:</strong> {order.delivery_address}</p>}
                {order.special_notes && <p style={{ marginTop: 6 }}><strong style={{ color: 'var(--text)' }}>Notes:</strong> {order.special_notes}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Help text */}
        {!order && !error && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>Enter your order number above to track your cake</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Your order number starts with CSB followed by 8 digits</p>
          </div>
        )}
      </div>
    </div>
  );
}
