import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'baking', 'ready', 'delivered', 'cancelled'];
const STATUS_NEXT = { pending: 'confirmed', confirmed: 'baking', baking: 'ready', ready: 'delivered' };

export default function AdminOrders({ role }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Order updated to ${status}`);
    } catch { toast.error('Failed to update'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)' }}>Order Management</h2>
        <button className="btn btn-sm btn-outline" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize' }}>
            {s} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading orders...</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No orders found</p></div>
      ) : (
        <div>
          {filtered.map(order => (
            <div key={order.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{order.order_number}</span>
                    <span className={`badge badge-${order.status}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                    {order.order_type === 'custom' && <span style={{ background: 'rgba(212,168,83,0.15)', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Custom Cake</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {order.customer_name} · {order.customer_email} · {order.customer_phone || 'No phone'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(order.created_at).toLocaleString('en-IN')} · {order.delivery_type === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-dark)', marginBottom: 8 }}>₹{order.total_amount}</div>

                  {/* Status update */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {STATUS_NEXT[order.status] && (
                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(order.id, STATUS_NEXT[order.status])} style={{ textTransform: 'capitalize' }}>
                          → {STATUS_NEXT[order.status]}
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => updateStatus(order.id, 'cancelled')}>Cancel</button>
                    </div>
                  )}
                  {(order.status === 'delivered' || order.status === 'cancelled') && (
                    <select onChange={e => updateStatus(order.id, e.target.value)} value={order.status} style={{ width: 'auto', fontSize: 12, padding: '4px 8px' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Items */}
              {order.items?.filter(Boolean).length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {order.items.filter(Boolean).map((item, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                      • {item.product_name} ×{item.quantity} = ₹{item.subtotal}
                      {item.is_custom && item.custom_details && (
                        <span style={{ marginLeft: 8, color: 'var(--gold-dark)' }}>
                          [{item.custom_details.flavor}, {item.custom_details.frosting}, {item.custom_details.layers}
                          {item.custom_details.cake_message ? `, msg: "${item.custom_details.cake_message}"` : ''}]
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {order.delivery_address && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>📍 {order.delivery_address}</div>
              )}
              {order.special_notes && (
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>📝 {order.special_notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
