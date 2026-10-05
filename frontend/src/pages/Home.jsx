import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Truck, Award, Clock, Heart, MapPin, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Home({ settings }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aboutSections, setAboutSections] = useState([]);
  const [services, setServices] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  const timerRef = useRef(null);
  const { addItem } = useCart();
  const { theme } = useTheme();

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.slice(0, 6)));
    api.get('/reviews').then(r => setReviews(r.data.slice(0, 3)));
    api.get('/about').then(r => setAboutSections(r.data || []));
    api.get('/services').then(r => setServices(r.data || []));
    api.get('/outlets').then(r => setOutlets(r.data || []));
    api.get('/chefs').then(r => setChefs(r.data || []));
    api.get('/achievements').then(r => setAchievements(r.data || []));
  }, []);

  useEffect(() => {
    if (!settings) return;
    const slides = [];
    for (let i = 1; i <= 5; i++) {
      if (settings[`hero_slide_${i}`]) slides.push(settings[`hero_slide_${i}`]);
    }
    setHeroSlides(slides.length ? slides : ['']);
  }, [settings]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    timerRef.current = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 4500);
    return () => clearInterval(timerRef.current);
  }, [heroSlides]);

  const handleAdd = (p) => {
    addItem({ product_id: p.id, product_name: p.name, unit_price: parseFloat(p.price), quantity: 1, subtotal: parseFloat(p.price), image_url: p.image_url });
    toast.success(`${p.name} added to cart!`);
  };

  const heroTitle = settings?.hero_title || 'Every Slice Tells a Story';
  const heroSubtitle = settings?.hero_subtitle || 'Handcrafted cakes made with finest ingredients';
  const shopName = settings?.shop_name || 'Cakexotic';

  const SectionHeader = ({ label, title }) => (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <p style={{ color: 'var(--gold-dark)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
      <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>{title}</h2>
      <div style={{ width: 50, height: 3, background: 'var(--gold)', margin: '12px auto 0', borderRadius: 2 }} />
    </div>
  );

  return (
    <div>
      {/* FESTIVAL BANNER */}
      {theme?.banner_text && (
        <div style={{ background: theme.primary_color, color: '#fff', textAlign: 'center', padding: '10px 16px', fontSize: 14, fontWeight: 600 }}>
          {theme.banner_text}
        </div>
      )}

      {/* HERO SLIDER */}
      <section style={{ position: 'relative', overflow: 'hidden', height: 'clamp(360px, 52vw, 500px)' }}>
        {(heroSlides.length ? heroSlides : ['']).map((slide, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0, transition: 'opacity 0.9s ease-in-out', opacity: i === heroIndex ? 1 : 0,
            background: slide
              ? `linear-gradient(rgba(20,10,3,0.52),rgba(20,10,3,0.52)),url(${slide}) center/cover no-repeat`
              : 'linear-gradient(135deg,var(--brown) 0%,#5C3D2E 100%)',
          }} />
        ))}
        {heroSlides.length > 1 && (
          <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 10 }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{ width: i === heroIndex ? 28 : 8, height: 8, borderRadius: 4, border: 'none', background: i === heroIndex ? 'var(--gold)' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        )}
        {heroSlides.length > 1 && (<>
          <button onClick={() => { clearInterval(timerRef.current); setHeroIndex(i => (i - 1 + heroSlides.length) % heroSlides.length); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
          <button onClick={() => { clearInterval(timerRef.current); setHeroIndex(i => (i + 1) % heroSlides.length); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
        </>)}
        <div className="container" style={{ position: 'relative', zIndex: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--gold-light)' }}>
          <p style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14, opacity: 0.85 }}>✦ Artisan Bakery ✦</p>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.8rem)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 18, lineHeight: 1.2 }}>{heroTitle}</h1>
          <p style={{ fontSize: '1rem', opacity: 0.78, maxWidth: 500, margin: '0 auto 36px' }}>{heroSubtitle}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/menu" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 30px' }}>Explore Menu <ArrowRight size={17} /></Link>
            <Link to="/custom-cake" className="btn btn-outline" style={{ color: 'var(--gold-light)', borderColor: 'var(--gold)', fontSize: 15, padding: '13px 30px' }}>Custom Cake 🎨</Link>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
      <section style={{ background: 'var(--cream-dark)', padding: '36px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-4">
            {[{ icon: <Award size={22} />, title: 'Premium Quality', desc: 'Finest ingredients only' }, { icon: <Clock size={22} />, title: 'Fresh Daily', desc: 'Baked every morning' }, { icon: <Truck size={22} />, title: 'Fast Delivery', desc: 'Same day delivery' }, { icon: <Heart size={22} />, title: 'Made with Love', desc: 'Every cake is special' }].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px' }}>
                <div style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
                <div><div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{f.title}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <section style={{ background: 'var(--brown)', padding: '60px 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(achievements.length, 6)}, 1fr)`, gap: 16 }}>
              {achievements.map(a => (
                <div key={a.id} style={{ textAlign: 'center', padding: '20px 8px' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{a.number}</div>
                  <div style={{ fontSize: 11, color: 'rgba(242,212,144,0.6)', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABOUT */}
      {aboutSections.length > 0 && (
        <section style={{ padding: '90px 0' }}>
          <div className="container">
            {aboutSections.map((ab, i) => (
              <div key={ab.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: i < aboutSections.length - 1 ? 80 : 0 }}>
                {i % 2 === 0 ? (<>
                  <div>
                    <p style={{ color: 'var(--gold-dark)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>✦ {ab.subtitle}</p>
                    <h2 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-display)', marginBottom: 18, lineHeight: 1.3 }}>{ab.title}</h2>
                    <div style={{ width: 50, height: 3, background: 'var(--gold)', marginBottom: 18, borderRadius: 2 }} />
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 15 }}>{ab.description}</p>
                  </div>
                  {ab.image_url && <img src={ab.image_url} alt={ab.title} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', height: 340, boxShadow: 'var(--shadow-lg)' }} />}
                </>) : (<>
                  {ab.image_url && <img src={ab.image_url} alt={ab.title} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', height: 340, boxShadow: 'var(--shadow-lg)' }} />}
                  <div>
                    <p style={{ color: 'var(--gold-dark)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>✦ {ab.subtitle}</p>
                    <h2 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-display)', marginBottom: 18, lineHeight: 1.3 }}>{ab.title}</h2>
                    <div style={{ width: 50, height: 3, background: 'var(--gold)', marginBottom: 18, borderRadius: 2 }} />
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 15 }}>{ab.description}</p>
                  </div>
                </>)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MENU CAKES */}
      <section style={{ padding: '80px 0', background: 'var(--cream-dark)' }}>
        <div className="container">
          <SectionHeader label="Our Specialties" title="Bestselling Cakes" />
          <div className="grid-3">
            {products.map(p => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.stock_quantity <= 5 && p.stock_quantity > 0 && <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--warning)', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Only {p.stock_quantity} left</span>}
                  {p.stock_quantity === 0 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: 600 }}>Sold Out</span></div>}
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.category_name}</p>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{p.description?.slice(0, 65)}...</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{p.price}</span>
                    <button className="btn btn-sm btn-primary" onClick={() => handleAdd(p)} disabled={p.stock_quantity === 0}>{p.stock_quantity === 0 ? 'Sold Out' : 'Add to Cart'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/menu" className="btn btn-outline">View Full Menu <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {services.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <SectionHeader label="What We Offer" title="Our Services" />
            <div className="grid-3">
              {services.map(s => (
                <div key={s.id} className="card" style={{ textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                  <div style={{ fontSize: 42, marginBottom: 16 }}>{s.icon}</div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>{s.description}</p>
                  {s.price_starting && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)' }}>Starting {s.price_starting}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CUSTOM CAKE CTA */}
      <section style={{ background: 'var(--brown)', color: 'var(--gold-light)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Dream Cake? We'll Create It!</h2>
          <p style={{ fontSize: '1rem', opacity: 0.75, maxWidth: 500, margin: '0 auto 32px' }}>Choose your base, layers, flavors, frostings, toppings and a personal message. Your perfect cake is just clicks away.</p>
          <Link to="/custom-cake" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>Design Your Cake <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* GALLERY */}
      {products.filter(p => p.image_url).length > 0 && (
        <section style={{ padding: '80px 0', background: 'var(--cream-dark)' }}>
          <div className="container">
            <SectionHeader label="Visual Delights" title="Cake Gallery" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {products.filter(p => p.image_url).slice(0, 8).map(p => (
                <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', height: 180, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.querySelector('.gal-overlay').style.opacity = 1; }}
                  onMouseLeave={e => { e.currentTarget.querySelector('.gal-overlay').style.opacity = 0; }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="gal-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(61,43,31,0.75)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
                    <div style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>{p.name}</div>
                    <div style={{ color: 'var(--gold)', fontSize: 13 }}>₹{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/gallery" className="btn btn-outline">View Full Gallery <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* CHEFS */}
      {chefs.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <SectionHeader label="The Talent Behind" title="Meet Our Chefs" />
            <div className="grid-3">
              {chefs.map(c => (
                <div key={c.id} className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                  <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--gold)' }}>
                    <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{c.name}</h3>
                  <p style={{ color: 'var(--gold-dark)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{c.role}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{c.bio}</p>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(212,168,83,0.12)', color: 'var(--gold-dark)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>⭐ {c.speciality}</span>
                    <span style={{ background: 'var(--cream-dark)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, fontSize: 11 }}>{c.experience_years} yrs exp</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section style={{ padding: '80px 0', background: 'var(--cream-dark)' }}>
          <div className="container">
            <SectionHeader label="Happy Customers" title="What They Say" />
            <div className="grid-3">
              {reviews.map(r => (
                <div key={r.id} className="card">
                  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>{[...Array(5)].map((_, i) => <Star key={i} size={15} fill={i < r.rating ? 'var(--gold)' : 'none'} color={i < r.rating ? 'var(--gold)' : 'var(--border)'} />)}</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic', lineHeight: 1.6 }}>"{r.comment}"</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>— {r.customer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OUTLETS */}
      {outlets.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div className="container">
            <SectionHeader label="Find Us Near You" title="Our Outlets" />
            <div className="grid-2">
              {outlets.map(o => (
                <div key={o.id} className="card" style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  {o.image_url
                    ? <img src={o.image_url} alt={o.city} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                    : <div style={{ width: 90, height: 90, background: 'rgba(212,168,83,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🏪</div>
                  }
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{o.city}</h3>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--cream-dark)', padding: '2px 8px', borderRadius: 10 }}>{o.state}</span>
                    </div>
                    {o.address && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 4, alignItems: 'flex-start' }}><MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />{o.address}</div>}
                    {o.phone && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', gap: 4 }}><Phone size={13} style={{ flexShrink: 0, marginTop: 2 }} />{o.phone}</div>}
                    {o.timing && <div style={{ fontSize: 12, color: 'var(--gold-dark)', fontWeight: 500 }}>🕐 {o.timing}</div>}
                    {o.google_maps_url && <a href={o.google_maps_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--gold-dark)', textDecoration: 'underline' }}>View on Maps →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ background: 'var(--brown)', color: 'rgba(242,212,144,0.55)', padding: '50px 0 28px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-light)', marginBottom: 10 }}>🎂 {shopName}</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{settings?.tagline}</p>
              <p style={{ fontSize: 13 }}>📍 {settings?.address}</p>
            </div>
            <div>
              <p style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Quick Links</p>
              {[['/', 'Home'], ['/menu', 'Menu'], ['/custom-cake', 'Custom Cake'], ['/gallery', 'Gallery'], ['/track', 'Track Order'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link key={to} to={to} style={{ display: 'block', fontSize: 13, marginBottom: 7, color: 'rgba(242,212,144,0.5)' }}>{label}</Link>
              ))}
            </div>
            <div>
              <p style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Contact Us</p>
              <p style={{ fontSize: 13, marginBottom: 8 }}>📞 {settings?.phone}</p>
              <p style={{ fontSize: 13, marginBottom: 8 }}>✉️ {settings?.email}</p>
              <p style={{ fontSize: 13 }}>🕐 Mon–Sat: 9am–9pm</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(212,168,83,0.15)', paddingTop: 18, textAlign: 'center' }}>
            <p style={{ fontSize: 12 }}>© {new Date().getFullYear()} {shopName}. All rights reserved. Made with ❤️ in India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
