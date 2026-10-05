import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import CustomCake from './pages/CustomCake';
import Cart from './pages/Cart';
import TrackOrder from './pages/TrackOrder';
import { Login, Register } from './pages/Auth';
import { Gallery, Contact } from './pages/GalleryContact';
import AdminPanel from './pages/admin/AdminPanel';
import SocialFloat from './components/SocialFloat';
import BirthdayCreator from './pages/birthday/BirthdayCreator';
import BirthdayView from './pages/birthday/BirthdayView';
import api from './utils/api';
import './index.css';

function AppInner() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Loader />;
  return (
    
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-body)', fontSize: 14 } }} />
      <Routes>
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/birthday/view" element={<BirthdayView />} />
        <Route path="*" element={
          <div>
            <Navbar settings={settings} />
            <Routes>
              <Route path="/" element={<Home settings={settings} />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/custom-cake" element={<CustomCake />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/track" element={<TrackOrder />} />
              <Route path="/track/:orderNumber" element={<TrackOrder />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact settings={settings} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/birthday" element={<BirthdayCreator />} />
            </Routes>
          </div>
        } />
      </Routes>
      <SocialFloat />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
