import express from 'express';
import supabase from '../db/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ── SALES LOG ──
router.post('/sales', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { product_id, quantity_sold, notes } = req.body;
    const { data: product } = await supabase.from('products').select('*').eq('id', product_id).single();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const total = product.price * quantity_sold;
    const { data: log, error } = await supabase.from('sales_log')
      .insert({ product_id, product_name: product.name, quantity_sold, unit_price: product.price, total_amount: total, logged_by: req.user.id, notes: notes || null })
      .select().single();
    if (error) throw error;
    const newQty = Math.max(0, product.stock_quantity - quantity_sold);
    await supabase.from('products').update({ stock_quantity: newQty }).eq('id', product_id);
    res.json(log);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/sales', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase.from('sales_log').select('*, users(name)').order('created_at', { ascending: false });
    if (date) query = query.eq('sale_date', date); else query = query.limit(100);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data.map(l => ({ ...l, logged_by_name: l.users?.name })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── DASHBOARD ──
router.get('/dashboard', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayOrders } = await supabase.from('orders').select('total_amount, status').gte('created_at', today);
    const todayRevenue = todayOrders?.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total_amount), 0) || 0;
    const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: lowStockCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).lte('stock_quantity', 5).eq('is_available', true);
    const { data: recentOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: orderItems } = await supabase.from('order_items').select('product_name, quantity');
    const productTotals = {};
    orderItems?.forEach(oi => { productTotals[oi.product_name] = (productTotals[oi.product_name] || 0) + oi.quantity; });
    const topProducts = Object.entries(productTotals).map(([name, sold]) => ({ name, sold })).sort((a, b) => b.sold - a.sold).slice(0, 5);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: weekOrders } = await supabase.from('orders').select('created_at, total_amount, status').gte('created_at', weekAgo).neq('status', 'cancelled');
    const weekMap = {};
    weekOrders?.forEach(o => { const d = o.created_at.split('T')[0]; weekMap[d] = (weekMap[d] || 0) + parseFloat(o.total_amount); });
    const weekRevenue = Object.entries(weekMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
    res.json({ todayRevenue, todayOrders: todayOrders?.length || 0, pendingOrders, lowStockCount, topProducts, recentOrders, weekRevenue });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── REVIEWS ──
router.post('/reviews', authenticate, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const { data, error } = await supabase.from('reviews').insert({ customer_id: req.user.id, customer_name: req.user.name, product_id, rating, comment }).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/reviews', async (req, res) => {
  try {
    const { data } = await supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(20);
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/reviews/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.patch('/reviews/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data: cur } = await supabase.from('reviews').select('is_approved').eq('id', req.params.id).single();
    const { data, error } = await supabase.from('reviews').update({ is_approved: !cur.is_approved }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SITE SETTINGS ──
router.get('/settings', async (req, res) => {
  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    const obj = {};
    (data || []).forEach(s => obj[s.key] = s.value);
    res.json(obj);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/settings', authenticate, requireRole('admin'), async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── STAFF ──
router.get('/staff', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('users').select('id, name, email, role, phone, created_at').in('role', ['admin', 'manager']).order('created_at', { ascending: false });
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/staff/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('users').delete().eq('id', req.params.id).eq('role', 'manager');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ABOUT ──
router.get('/about', async (req, res) => {
  try {
    const { data } = await supabase.from('about_sections').select('*').eq('is_visible', true).order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/about/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('about_sections').select('*').order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/about', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('about_sections').insert(req.body).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/about/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('about_sections').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/about/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('about_sections').delete().eq('id', req.params.id); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── SERVICES ──
router.get('/services', async (req, res) => {
  try {
    const { data } = await supabase.from('services').select('*').eq('is_visible', true).order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/services/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('services').select('*').order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/services', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('services').insert(req.body).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/services/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('services').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/services/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('services').delete().eq('id', req.params.id); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── OUTLETS ──
router.get('/outlets', async (req, res) => {
  try {
    const { data } = await supabase.from('outlets').select('*').eq('is_active', true).order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/outlets/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('outlets').select('*').order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/outlets', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('outlets').insert(req.body).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/outlets/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('outlets').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/outlets/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('outlets').delete().eq('id', req.params.id); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CHEFS ──
router.get('/chefs', async (req, res) => {
  try {
    const { data } = await supabase.from('chefs').select('*').eq('is_visible', true).order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/chefs/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data } = await supabase.from('chefs').select('*').order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/chefs', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('chefs').insert(req.body).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/chefs/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('chefs').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/chefs/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('chefs').delete().eq('id', req.params.id); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── ACHIEVEMENTS ──
router.get('/achievements', async (req, res) => {
  try {
    const { data } = await supabase.from('achievements').select('*').order('sort_order');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/achievements', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('achievements').insert(req.body).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/achievements/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('achievements').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/achievements/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('achievements').delete().eq('id', req.params.id); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── FESTIVAL THEMES ──
router.get('/themes', async (req, res) => {
  try {
    const { data } = await supabase.from('festival_themes').select('*').order('id');
    res.json(data || []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/themes/active', async (req, res) => {
  try {
    const { data } = await supabase.from('festival_themes').select('*').eq('is_active', true).limit(1);
    res.json(data?.[0] || null);
  } catch (e) { res.json(null); }
});
router.patch('/themes/:id/activate', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('festival_themes').update({ is_active: false }).neq('id', 0);
    const { data, error } = await supabase.from('festival_themes').update({ is_active: true }).eq('id', req.params.id).select().single();
    if (error) throw error;
    await supabase.from('site_settings').upsert({ key: 'active_festival_theme', value: data.slug }, { onConflict: 'key' });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.patch('/themes/deactivate-all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await supabase.from('festival_themes').update({ is_active: false }).neq('id', 0);
    await supabase.from('site_settings').upsert({ key: 'active_festival_theme', value: '' }, { onConflict: 'key' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/themes/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('festival_themes').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
