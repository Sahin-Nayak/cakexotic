import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Settings, MessageSquare, LogOut, ChevronRight, TrendingUp, Users, Info, Wrench, MapPin, ChefHat, Trophy, Palette, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './Dashboard';
import AdminOrders from './Orders';
import AdminProducts from './Products';
import { SalesLog, SiteSettings, ReviewsManager, StockView, AboutManager, ServicesManager, OutletsManager, ChefsManager, AchievementsManager, FestivalThemes } from './Misc';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    navigate('/login'); return null;
  }

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} />, adminOnly: true },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={17} /> },
    { id: 'products', label: 'Products', icon: <Package size={17} />, adminOnly: true },
    { id: 'sales', label: 'Log Sales', icon: <TrendingUp size={17} /> },
    { id: 'stock', label: 'Stock View', icon: <BarChart2 size={17} /> },
    { id: 'divider1', divider: true, label: 'WEBSITE', adminOnly: true },
    { id: 'about', label: 'About Sections', icon: <Info size={17} />, adminOnly: true },
    { id: 'services', label: 'Services', icon: <Wrench size={17} />, adminOnly: true },
    { id: 'outlets', label: 'Outlets', icon: <MapPin size={17} />, adminOnly: true },
    { id: 'chefs', label: 'Chefs', icon: <ChefHat size={17} />, adminOnly: true },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={17} />, adminOnly: true },
    { id: 'divider2', divider: true, label: 'TOOLS', adminOnly: true },
    { id: 'themes', label: 'Festival Themes', icon: <Palette size={17} />, adminOnly: true },
    { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={17} />, adminOnly: true },
    { id: 'settings', label: 'Site Settings', icon: <Settings size={17} />, adminOnly: true },
  ];

  const navItems = user.role === 'admin' ? adminNav : adminNav.filter(n => !n.adminOnly);

  const renderPage = () => {
    switch (active) {
      case 'dashboard': return <AdminDashboard />;
      case 'orders': return <AdminOrders role={user.role} />;
      case 'products': return <AdminProducts />;
      case 'sales': return <SalesLog />;
      case 'stock': return <StockView />;
      case 'about': return <AboutManager />;
      case 'services': return <ServicesManager />;
      case 'outlets': return <OutletsManager />;
      case 'chefs': return <ChefsManager />;
      case 'achievements': return <AchievementsManager />;
      case 'themes': return <FestivalThemes />;
      case 'reviews': return <ReviewsManager />;
      case 'settings': return <SiteSettings />;
      default: return <AdminDashboard />;
    }
  };

  const NavContent = () => (
    <>
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold-light)', marginBottom: 2 }}>🎂 CakeShop</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{user.role} Panel</div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{user.name}</div>
      </div>
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {navItems.map((n, idx) => {
          if (n.divider) return (
            <div key={idx} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '14px 10px 4px', marginTop: 4 }}>{n.label}</div>
          );
          return (
            <button key={n.id} onClick={() => { setActive(n.id); setSideOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 9, width: '100%',
              padding: '9px 10px', borderRadius: 7, marginBottom: 2,
              background: active === n.id ? 'rgba(212,168,83,0.18)' : 'transparent',
              color: active === n.id ? 'var(--gold-light)' : 'rgba(255,255,255,0.5)',
              border: active === n.id ? '1px solid rgba(212,168,83,0.25)' : '1px solid transparent',
              fontSize: 13, fontWeight: active === n.id ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
            }}>
              {n.icon} {n.label}
              {active === n.id && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px', borderRadius: 7, background: 'transparent', color: 'rgba(255,255,255,0.35)', border: 'none', fontSize: 12, cursor: 'pointer', marginBottom: 4 }}>← Back to Website</button>
        <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px', borderRadius: 7, background: 'rgba(192,57,43,0.12)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.25)', fontSize: 12, cursor: 'pointer' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ width: 220, background: 'var(--brown)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }} className="admin-sidebar">
        <NavContent />
      </div>

      {sideOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setSideOpen(false)} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, background: 'var(--brown)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <NavContent />
          </div>
        </div>
      )}

      <div style={{ flex: 1, marginLeft: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="admin-main">
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setSideOpen(true)} style={{ display: 'none', background: 'none', padding: 4 }} className="mobile-menu-btn"><Menu size={22} /></button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{navItems.find(n => n.id === active)?.label || 'Dashboard'}</span>
        </div>
        <div style={{ padding: '28px 24px', flex: 1 }}>{renderPage()}</div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
