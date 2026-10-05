import express from 'express';
import supabase from '../db/db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

const genOrderNumber = () => 'CSB' + Date.now().toString().slice(-8);

router.post('/', authenticate, async (req, res) => {
  try {
    const { items, delivery_type, delivery_address, special_notes, customer_phone } = req.body;
    const user = req.user;
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const order_number = genOrderNumber();
    const isCustom = items.some(i => i.is_custom);

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number, customer_id: user.id, customer_name: user.name,
        customer_email: user.email, customer_phone: customer_phone || null,
        total_amount: total, delivery_type: delivery_type || 'pickup',
        delivery_address: delivery_address || null,
        special_notes: special_notes || null,
        order_type: isCustom ? 'custom' : 'regular',
      })
      .select().single();
    if (orderErr) throw orderErr;

    for (const item of items) {
      const { data: oi, error: oiErr } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id, product_id: item.product_id,
          product_name: item.product_name, quantity: item.quantity,
          unit_price: item.unit_price, subtotal: item.subtotal,
          is_custom: item.is_custom || false,
          custom_details: item.custom_details || null,
        })
        .select().single();
      if (oiErr) throw oiErr;

      // Custom cake details
      if (item.is_custom && item.custom_details) {
        const c = item.custom_details;
        await supabase.from('custom_cake_orders').insert({
          order_item_id: oi.id, base_cake_id: item.product_id,
          layers: c.layers ? parseInt(c.layers) : 1,
          size: c.size || null, shape: c.shape || null,
          flavor: c.flavor || null, frosting: c.frosting || null,
          filling: c.filling || null, toppings: c.toppings || [],
          cake_message: c.cake_message || null,
          special_instructions: c.special_instructions || null,
          base_price: c.base_price || 0,
          customization_price: c.customization_price || 0,
          total_price: item.subtotal,
        });
      }

      // Deduct stock for regular items
      if (!item.is_custom) {
        const { data: prod } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
        const newQty = Math.max(0, (prod?.stock_quantity || 0) - item.quantity);
        await supabase.from('products').update({ stock_quantity: newQty }).eq('id', item.product_id);
      }
    }

    res.json({ order, order_number: order.order_number });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', req.params.orderNumber)
      .single();
    if (error || !order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/status', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','baking','ready','delivered','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
