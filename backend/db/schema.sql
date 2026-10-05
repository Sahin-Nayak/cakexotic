-- ============================================================
-- CAKE SHOP DATABASE SCHEMA FOR NEON DB
-- Run this entire file in your Neon SQL Editor
-- ============================================================

-- Users table (admin, manager, customer)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'customer')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products (cakes) table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_url VARCHAR(500),
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_customizable BOOLEAN DEFAULT false,
  weight VARCHAR(50),
  serving_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Custom cake options
CREATE TABLE IF NOT EXISTS custom_options (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('layer', 'flavor', 'frosting', 'filling', 'topping', 'message', 'size', 'shape')),
  name VARCHAR(100) NOT NULL,
  price_addition DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES users(id),
  customer_name VARCHAR(100),
  customer_email VARCHAR(150),
  customer_phone VARCHAR(20),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','baking','ready','delivered','cancelled')),
  order_type VARCHAR(20) DEFAULT 'regular' CHECK (order_type IN ('regular','custom')),
  delivery_type VARCHAR(20) DEFAULT 'pickup' CHECK (delivery_type IN ('pickup','delivery')),
  delivery_address TEXT,
  special_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(150),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  is_custom BOOLEAN DEFAULT false,
  custom_details JSONB
);

-- Custom cake orders detail
CREATE TABLE IF NOT EXISTS custom_cake_orders (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  base_cake_id INTEGER REFERENCES products(id),
  layers INTEGER DEFAULT 1,
  size VARCHAR(50),
  shape VARCHAR(50),
  flavor VARCHAR(100),
  frosting VARCHAR(100),
  filling VARCHAR(100),
  toppings TEXT[],
  cake_message VARCHAR(255),
  special_instructions TEXT,
  reference_image_url VARCHAR(500),
  base_price DECIMAL(10,2),
  customization_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
);

-- Sales log (for manager)
CREATE TABLE IF NOT EXISTS sales_log (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(150),
  quantity_sold INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  logged_by INTEGER REFERENCES users(id),
  sale_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(id),
  customer_name VARCHAR(100),
  product_id INTEGER REFERENCES products(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2),
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default admin (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin Owner', 'admin@cakeshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Store Manager', 'manager@cakeshop.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (name, description) VALUES
('Celebration Cakes', 'Perfect for birthdays and special occasions'),
('Wedding Cakes', 'Elegant multi-tier wedding cakes'),
('Signature Cakes', 'Our bestselling house specialties'),
('Cupcakes', 'Individual bite-sized delights'),
('Custom Cakes', 'Made exactly to your specifications')
ON CONFLICT DO NOTHING;

-- Products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_available, is_customizable, weight, serving_size) VALUES
('Choco Lava Cake', 'Warm molten chocolate cake with a gooey center', 349, 3, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 20, true, false, '200g', '1-2'),
('Classic Black Forest', 'Layers of chocolate sponge, cherries and whipped cream', 899, 1, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400', 15, true, true, '1kg', '8-10'),
('Strawberry Dream', 'Fresh strawberry cake with cream cheese frosting', 799, 1, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 12, true, true, '1kg', '8-10'),
('Red Velvet Royale', 'Classic red velvet with cream cheese frosting', 950, 3, 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400', 10, true, true, '1kg', '8-10'),
('Mango Tropical', 'Fresh alphonso mango cake with mirror glaze', 1099, 3, 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=400', 8, true, true, '1kg', '8-10'),
('Butterscotch Bliss', 'Rich butterscotch cake with caramel drip', 849, 1, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400', 18, true, true, '1kg', '8-10'),
('Vanilla Bean Classic', 'Light vanilla sponge with Swiss meringue buttercream', 699, 1, 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400', 25, true, true, '1kg', '8-10'),
('Chocolate Truffle', 'Dense chocolate cake with ganache and chocolate shavings', 1199, 3, 'https://images.unsplash.com/photo-1572490122747-3a4bee534c3d?w=400', 10, true, true, '1.5kg', '12-15')
ON CONFLICT DO NOTHING;

-- Custom options
INSERT INTO custom_options (type, name, price_addition) VALUES
('size', '500g (4-6 people)', 0),
('size', '1kg (8-10 people)', 200),
('size', '1.5kg (12-15 people)', 400),
('size', '2kg (18-20 people)', 600),
('layer', '1 layer', 0),
('layer', '2 layers', 150),
('layer', '3 layers', 300),
('layer', '4 layers', 500),
('flavor', 'Chocolate', 0),
('flavor', 'Vanilla', 0),
('flavor', 'Strawberry', 50),
('flavor', 'Red Velvet', 50),
('flavor', 'Butterscotch', 50),
('flavor', 'Mango', 100),
('flavor', 'Lemon', 50),
('frosting', 'Whipped Cream', 0),
('frosting', 'Buttercream', 50),
('frosting', 'Cream Cheese', 100),
('frosting', 'Fondant', 200),
('frosting', 'Mirror Glaze', 300),
('filling', 'None', 0),
('filling', 'Chocolate Ganache', 100),
('filling', 'Fresh Strawberry Jam', 80),
('filling', 'Caramel', 100),
('filling', 'Nutella', 150),
('filling', 'Lemon Curd', 80),
('topping', 'Fresh Fruits', 150),
('topping', 'Chocolate Shavings', 100),
('topping', 'Sprinkles', 50),
('topping', 'Edible Flowers', 200),
('topping', 'Macarons', 250),
('topping', 'Caramel Drip', 100),
('topping', 'Chocolate Drip', 100),
('shape', 'Round', 0),
('shape', 'Square', 0),
('shape', 'Heart', 150),
('shape', 'Hexagon', 200)
ON CONFLICT DO NOTHING;

-- Site settings
INSERT INTO site_settings (key, value) VALUES
('shop_name', 'Cakexotic'),
('tagline', 'Baked with love, delivered with joy'),
('phone', '+91 98765 43210'),
('email', 'hello@cakexotic.in'),
('address', '12, Baker Street, Mumbai, Maharashtra 400001'),
('announcement', 'Free delivery on orders above ₹1500! Use code SWEET10 for 10% off'),
('primary_color', '#D4A853'),
('hero_title', 'Every Slice Tells a Story'),
('hero_subtitle', 'Handcrafted cakes made with finest ingredients and lots of love')
ON CONFLICT DO NOTHING;
