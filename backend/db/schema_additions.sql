-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR (additions to existing schema)
-- ============================================================

-- About section content
CREATE TABLE IF NOT EXISTS about_sections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  subtitle VARCHAR(300),
  description TEXT,
  image_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(10) DEFAULT '🎂',
  title VARCHAR(150) NOT NULL,
  description TEXT,
  price_starting VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- City / State outlets
CREATE TABLE IF NOT EXISTS outlets (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  address TEXT,
  phone VARCHAR(30),
  email VARCHAR(150),
  timing VARCHAR(200),
  image_url VARCHAR(500),
  google_maps_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Chefs
CREATE TABLE IF NOT EXISTS chefs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(150),
  bio TEXT,
  image_url VARCHAR(500),
  speciality VARCHAR(200),
  experience_years INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- Achievements / Stats
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(10) DEFAULT '🏆',
  number VARCHAR(50) NOT NULL,
  label VARCHAR(150) NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Festival themes
CREATE TABLE IF NOT EXISTS festival_themes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  emoji VARCHAR(10),
  primary_color VARCHAR(20),
  secondary_color VARCHAR(20),
  accent_color VARCHAR(20),
  bg_color VARCHAR(20),
  text_color VARCHAR(20),
  banner_text VARCHAR(300),
  banner_image_url VARCHAR(500),
  font_style VARCHAR(50) DEFAULT 'normal',
  is_active BOOLEAN DEFAULT false
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO about_sections (title, subtitle, description, image_url, sort_order) VALUES
('Our Story', 'Baking happiness since 2010', 'Cakexotic was born out of a deep love for handcrafted cakes and the joy they bring to every occasion. Founded in Mumbai, we have been serving smiles, one slice at a time, for over a decade. Every cake is made from scratch using the finest local and imported ingredients.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600', 1),
('Our Mission', 'Quality you can taste in every bite', 'We believe every celebration deserves a perfect cake. Our team of passionate bakers works tirelessly to ensure that each creation meets our exacting standards of taste, presentation, and freshness. From intimate gatherings to grand weddings, we craft memories that last a lifetime.', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600', 2)
ON CONFLICT DO NOTHING;

INSERT INTO services (icon, title, description, price_starting, sort_order) VALUES
('🎂', 'Custom Cakes', 'Fully personalized cakes designed to your exact specifications — flavors, tiers, decorations and messages.', '₹699', 1),
('💒', 'Wedding Cakes', 'Elegant multi-tier wedding cakes that become the centerpiece of your special day.', '₹4999', 2),
('🏢', 'Corporate Orders', 'Bulk cake orders for corporate events, team celebrations, and gifting. Special pricing available.', '₹499', 3),
('🚚', 'Home Delivery', 'Fresh cakes delivered to your doorstep across the city. Same-day delivery available.', '₹80', 4),
('🎨', 'Cake Decoration', 'Professional fondant art, edible printing, sculpted cakes and theme decorations.', '₹299', 5),
('📸', 'Photo Cakes', 'Print any photo on an edible sheet and have it placed beautifully on your cake.', '₹399', 6)
ON CONFLICT DO NOTHING;

INSERT INTO outlets (city, state, address, phone, timing, sort_order) VALUES
('Mumbai', 'Maharashtra', '12, Baker Street, Bandra West, Mumbai 400050', '+91 98765 43210', 'Mon–Sat: 9am–9pm, Sun: 10am–7pm', 1),
('Pune', 'Maharashtra', '45, FC Road, Shivajinagar, Pune 411005', '+91 98765 43211', 'Mon–Sat: 9am–9pm, Sun: 10am–7pm', 2),
('Nashik', 'Maharashtra', '8, College Road, Nashik 422005', '+91 98765 43212', 'Mon–Sat: 10am–8pm', 3),
('Aurangabad', 'Maharashtra', '22, Station Road, Aurangabad 431001', '+91 98765 43213', 'Mon–Sat: 10am–8pm', 4)
ON CONFLICT DO NOTHING;

INSERT INTO chefs (name, role, bio, image_url, speciality, experience_years, sort_order) VALUES
('Chef Priya Sharma', 'Head Pastry Chef', 'Trained at Le Cordon Bleu Paris, Chef Priya brings world-class techniques to every creation. Her passion for perfection shows in every layer.', 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400', 'French Pastry & Wedding Cakes', 14, 1),
('Chef Rajan Mehta', 'Chocolate Specialist', 'With 10 years in the finest hotels of Mumbai, Rajan is our master of all things chocolate — from ganaches to showpiece sculptures.', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400', 'Chocolate Artistry', 10, 2),
('Chef Anita Desai', 'Sugar Art Expert', 'Anita''s delicate sugar flowers and fondant sculptures have won regional competitions. She turns every custom cake into a work of art.', 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400', 'Sugar Flowers & Fondant Art', 8, 3)
ON CONFLICT DO NOTHING;

INSERT INTO achievements (icon, number, label, sort_order) VALUES
('🎂', '50,000+', 'Cakes Delivered', 1),
('😊', '98%', 'Happy Customers', 2),
('🏆', '12+', 'Awards Won', 3),
('📍', '4', 'City Outlets', 4),
('👨‍🍳', '15+', 'Expert Chefs', 5),
('📅', '14+', 'Years of Excellence', 6)
ON CONFLICT DO NOTHING;

INSERT INTO festival_themes (name, slug, emoji, primary_color, secondary_color, accent_color, bg_color, text_color, banner_text, font_style) VALUES
('Holi', 'holi', '🎨', '#E91E63', '#FF9800', '#9C27B0', '#FFF8E1', '#4A148C', '🎨 Happy Holi! Colours of joy, sweetness of cake! 20% OFF today!', 'normal'),
('Gudi Padwa', 'gudi-padwa', '🪔', '#FF6F00', '#FDD835', '#E65100', '#FFFDE7', '#3E2723', '🪔 Gudi Padwa Greetings! New year, new sweetness! Special offers inside.', 'normal'),
('Religious / Eid', 'religious', '🌙', '#1B5E20', '#F9A825', '#2E7D32', '#F1F8E9', '#1B5E20', '🌙 Eid Mubarak! Celebrate with our special festive cakes!', 'normal'),
('Maharashtra Day', 'maharashtra-day', '🧡', '#FF6600', '#FFFFFF', '#CC5200', '#FFF3E0', '#3E2723', '🧡 Happy Maharashtra Day! Proud to serve Maharashtra with love!', 'normal'),
('Raksha Bandhan', 'raksha-bandhan', '🪢', '#C62828', '#FFD600', '#AD1457', '#FCE4EC', '#880E4F', '🪢 Happy Raksha Bandhan! Sweeten the bond with our special cakes!', 'normal'),
('Janmashtami', 'janmashtami', '🦚', '#1565C0', '#FFD600', '#0D47A1', '#E3F2FD', '#0D47A1', '🦚 Happy Janmashtami! Celebrate with Makhan Mishri special cakes!', 'normal'),
('Navratri / Durga Puja', 'navratri', '🔴', '#D32F2F', '#FF8F00', '#B71C1C', '#FFF8E1', '#B71C1C', '🔴 Navratri Greetings! Jai Mata Di! Special festive sweets & cakes!', 'normal'),
('Diwali', 'diwali', '✨', '#F57F17', '#E65100', '#FF8F00', '#FFF8E1', '#3E2723', '✨ Happy Diwali! Light up your celebrations with our festive cakes!', 'normal'),
('Christmas', 'christmas', '🎄', '#1B5E20', '#C62828', '#2E7D32', '#F1F8E9', '#1B5E20', '🎄 Merry Christmas! Unwrap joy with our special Xmas cakes!', 'normal'),
('New Year', 'new-year', '🎆', '#1A237E', '#C8102E', '#283593', '#E8EAF6', '#1A237E', '🎆 Happy New Year! Start the year sweetly with us!', 'normal'),
('Independence Day', 'independence-day', '🇮🇳', '#FF6600', '#FFFFFF', '#138808', '#F1F8E9', '#000080', '🇮🇳 Happy Independence Day! Jai Hind! Celebrating with Tricolour specials!', 'normal'),
('Valentine''s Day', 'valentines', '❤️', '#C62828', '#F48FB1', '#AD1457', '#FCE4EC', '#880E4F', '❤️ Happy Valentine''s Day! Share love, share cake! Special heart cakes available!', 'normal'),
('Republic Day', 'republic-day', '🇮🇳', '#000080', '#FF6600', '#138808', '#E8EAF6', '#000080', '🇮🇳 Happy Republic Day! Proud to be Indian! Tricolour specials today!', 'normal')
ON CONFLICT (slug) DO NOTHING;

-- Add new site_settings keys
INSERT INTO site_settings (key, value) VALUES
('hero_slide_1', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1400'),
('hero_slide_2', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1400'),
('hero_slide_3', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1400'),
('hero_slide_4', ''),
('hero_slide_5', ''),
('about_visible', 'true'),
('services_visible', 'true'),
('outlets_visible', 'true'),
('chefs_visible', 'true'),
('achievements_visible', 'true'),
('gallery_visible', 'true'),
('active_festival_theme', '')
ON CONFLICT (key) DO NOTHING;
