import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Clock, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard').then(r => setData(r.data)).catch(() => {}); }, []);

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard...</div>;

  const statCards = [
    { label: "Today's Revenue", value: `₹${parseFloat(data.todayRevenue || 0).toFixed(0)}`, icon: <TrendingUp size={22} />, color: 'var(--gold-dark)' },
    { label: "Today's Orders", value: data.todayOrders, icon: <ShoppingBag size={22} />, color: 'var(--info)' },
    { label: 'Pending Orders', value: data.pendingOrders, icon: <Clock size={22} />, color: 'var(--warning)' },
    { label: 'Low Stock Items', value: data.lowStockCount, icon: <AlertTriangle size={22} />, color: 'var(--error)' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24, fontFamily: 'var(--font-display)' }}>Dashboard Overview</h2>
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Recent Orders</h3>
          {data.recentOrders?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No orders yet</p>
          ) : data.recentOrders?.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.order_number}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{o.customer_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
                <div style={{ fontWeight: 700, marginTop: 4, color: 'var(--gold-dark)' }}>₹{o.total_amount}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Top Selling Cakes</h3>
          {data.topProducts?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sales data yet</p>
          ) : data.topProducts?.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(212,168,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'var(--gold-dark)' }}>{i + 1}</div>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>{p.sold} sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
