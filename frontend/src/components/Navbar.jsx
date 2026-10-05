import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ settings }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/custom-cake', label: 'Custom Cake' },
    { to: '/track', label: 'Track Order' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/contact', label: 'Contact' },
    { to: '/birthday', label: 'Birthday Card' },
  ];

  const shopName = settings?.shop_name || 'Cakexotic';

  return (
    <>
      {settings?.announcement && (
        <div className="announcement-bar">{settings.announcement}</div>
      )}
      <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎂</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--brown)', fontWeight: 700 }}>{shopName}</span>
          </Link>

          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="desktop-nav">
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{
                fontSize: 14, fontWeight: 500,
                color: location.pathname === l.to ? 'var(--gold-dark)' : 'var(--text-muted)',
                borderBottom: location.pathname === l.to ? '2px solid var(--gold)' : '2px solid transparent',
                paddingBottom: 2, transition: 'all 0.2s'
              }}>{l.label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <ShoppingCart size={22} />
              {count > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: 'var(--gold)', color: 'var(--brown)', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{count}</span>
              )}
            </Link>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Link to="/admin" className="btn btn-sm btn-outline">
                    <LayoutDashboard size={14} /> Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'var(--cream-dark)', color: 'var(--text-muted)' }}>
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-sm btn-primary">
                <User size={14} /> Login
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', padding: 4 }} className="mobile-menu-btn">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background: 'var(--white)', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
            {links.map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', padding: '10px 0', color: 'var(--text)', borderBottom: '1px solid var(--border)', fontSize: 15 }} onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}
          </div>
        )}
      </nav>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
