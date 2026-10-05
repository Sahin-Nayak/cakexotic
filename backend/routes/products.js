import express from 'express';
import supabase from '../db/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    // Flatten category name
    const products = data.map(p => ({ ...p, category_name: p.categories?.name }));
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/all', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const products = data.map(p => ({ ...p, category_name: p.categories?.name }));
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/custom-options', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('custom_options')
      .select('*')
      .eq('is_available', true)
      .order('type')
      .order('price_addition');
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    res.json({ ...data, category_name: data.categories?.name });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, stock_quantity, is_customizable, weight, serving_size } = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert({ name, description, price, category_id, image_url, stock_quantity: stock_quantity || 0, is_customizable: is_customizable || false, weight, serving_size })
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, stock_quantity, is_available, is_customizable, weight, serving_size } = req.body;
    const { data, error } = await supabase
      .from('products')
      .update({ name, description, price, category_id, image_url, stock_quantity, is_available, is_customizable, weight, serving_size, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Fetch current value first
    const { data: current } = await supabase.from('products').select('is_available').eq('id', req.params.id).single();
    const { data, error } = await supabase
      .from('products')
      .update({ is_available: !current.is_available, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
