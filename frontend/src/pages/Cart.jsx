import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, Smartphone, Building2, Banknote, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: <Smartphone size={18} />, desc: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={18} />, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={18} />, desc: 'All major banks supported' },
  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={18} />, desc: 'Pay when you receive' },
];

function PaymentModal({ total, method, onSuccess, onClose }) {
  const [step, setStep] = useState('form'); // form | processing | success
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => { setStep('success'); setTimeout(onSuccess, 1500); }, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
            <h3 style={{ marginBottom: 8 }}>Processing Payment...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please wait, do not close this window</p>
            <div style={{ marginTop: 20, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--gold)', borderRadius: 2, animation: 'loading-bar 2s ease-in-out forwards' }} />
            </div>
            <style>{`@keyframes loading-bar { from { width: 0% } to { width: 100% } }`}</style>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: 8, color: 'var(--success)' }}>Payment Successful!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>₹{total.toFixed(0)} paid successfully</p>
          </div>
        )}

        {step === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem' }}>Complete Payment</h3>
              <button onClick={onClose} style={{ background: 'none', fontSize: 20, color: 'var(--text-muted)', padding: 4 }}>×</button>
            </div>
            <div style={{ background: 'rgba(212,168,83,0.1)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Amount to Pay</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold-dark)' }}>₹{total.toFixed(0)}</span>
            </div>

            {method === 'upi' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ width: 120, height: 120, background: 'var(--cream-dark)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 48 }}>📱</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scan QR code or enter UPI ID</p>
                </div>
                <div className="form-group">
                  <label>Enter UPI ID</label>
                  <input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                    <button key={app} onClick={() => setUpiId(`demo@${app.toLowerCase()}`)} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)', background: upiId.includes(app.toLowerCase()) ? 'rgba(212,168,83,0.1)' : 'var(--white)', fontSize: 12, cursor: 'pointer' }}>{app}</button>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay} disabled={!upiId}>Pay ₹{total.toFixed(0)}</button>
              </div>
            )}

            {method === 'card' && (
              <div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input placeholder="1234 5678 9012 3456" maxLength={19} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} />
                </div>
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Expiry</label><input placeholder="MM/YY" maxLength={5} value={cardExp} onChange={e => setCardExp(e.target.value)} /></div>
                  <div className="form-group"><label>CVV</label><input placeholder="•••" maxLength={3} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} /></div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay} disabled={!cardNum || !cardName || !cardExp || !cardCvv}>Pay ₹{total.toFixed(0)}</button>
              </div>
            )}

            {method === 'netbanking' && (
              <div>
                <div className="form-group">
                  <label>Select Your Bank</label>
                  <select value={bank} onChange={e => setBank(e.target.value)}>
                    <option value="">Choose bank...</option>
                    {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'PNB', 'Bank of Baroda', 'Canara Bank', 'Union Bank'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {bank && (
                  <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16, textAlign: 'center' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>You will be redirected to {bank}'s secure portal</p>
                  </div>
                )}
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay} disabled={!bank}>Proceed to {bank || 'Bank'}</button>
              </div>
            )}

            {method === 'cod' && (
              <div>
                <div style={{ background: 'rgba(58,138,74,0.08)', border: '1px solid rgba(58,138,74,0.3)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
                  <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>Pay ₹{total.toFixed(0)} when your order arrives</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Please keep exact change ready</p>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay}>Confirm Order (COD)</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Cart() {
  const { cart, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState('pickup');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const deliveryFee = delivery === 'delivery' && total < 1500 ? 80 : 0;
  const grandTotal = total + deliveryFee;

  const handleCheckout = () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (delivery === 'delivery' && !address.trim()) { toast.error('Enter delivery address'); return; }
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(c => ({ product_id: c.product_id, product_name: c.product_name, quantity: c.quantity, unit_price: c.unit_price, subtotal: c.subtotal, is_custom: c.is_custom || false, custom_details: c.custom_details || null })),
        delivery_type: delivery, delivery_address: address, special_notes: notes, customer_phone: phone,
      });
      clearCart();
      toast.success(`Order placed! #${data.order_number}`);
      navigate(`/track/${data.order_number}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Order failed');
    } finally { setLoading(false); }
  };

  if (cart.length === 0) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Add some delicious cakes to get started!</p>
      <Link to="/menu" className="btn btn-primary">Browse Menu <ArrowRight size={16} /></Link>
    </div>
  );

  return (
    <div>
      <div className="page-header"><h1>Your Cart</h1></div>
      <div className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Cart Items */}
        <div>
          {cart.map(item => (
            <div key={item.id} className="card" style={{ marginBottom: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {item.image_url && <img src={item.image_url} alt={item.product_name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.product_name}</div>
                    {item.is_custom && item.custom_details && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                        {[item.custom_details.flavor, item.custom_details.frosting, item.custom_details.layers, item.custom_details.cake_message && `"${item.custom_details.cake_message}"`].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', color: 'var(--error)', padding: 4 }}><Trash2 size={15} /></button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  {!item.is_custom ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }} onClick={() => updateQty(item.id, item.quantity - 1)}><Minus size={12} /></button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn btn-sm btn-outline" style={{ padding: '4px 8px' }} onClick={() => updateQty(item.id, item.quantity + 1)}><Plus size={12} /></button>
                    </div>
                  ) : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Qty: {item.quantity}</span>}
                  <span style={{ fontWeight: 700, color: 'var(--gold-dark)', fontSize: 15 }}>₹{item.subtotal.toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 18 }}>Order Details</h3>
            <div className="form-group">
              <label>Delivery Type</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['pickup', 'delivery'].map(t => (
                  <button key={t} onClick={() => setDelivery(t)} className={`btn btn-sm ${delivery === t ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, textTransform: 'capitalize' }}>{t === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}</button>
                ))}
              </div>
            </div>
            {delivery === 'delivery' && (
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea rows={3} placeholder="Full address..." value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            )}
            <div className="form-group"><label>Phone Number</label><input type="tel" placeholder="+91 99999 99999" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div className="form-group"><label>Special Notes</label><textarea rows={2} placeholder="Any instructions..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
          </div>

          {/* Payment Method */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Payment Method</h3>
            {PAYMENT_METHODS.map(m => (
              <div key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: `2px solid ${paymentMethod === m.id ? 'var(--gold)' : 'var(--border)'}`, background: paymentMethod === m.id ? 'rgba(212,168,83,0.06)' : 'transparent', cursor: 'pointer', marginBottom: 8, transition: 'all 0.2s' }}>
                <div style={{ color: 'var(--gold-dark)' }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.desc}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === m.id ? 'var(--gold)' : 'var(--border)'}`, background: paymentMethod === m.id ? 'var(--gold)' : 'transparent', flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* Total & Checkout */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{total.toFixed(0)}</span></div>
            {delivery === 'delivery' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${deliveryFee}`}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, margin: '12px 0' }}>
              <span>Total</span><span style={{ color: 'var(--gold-dark)' }}>₹{grandTotal.toFixed(0)}</span>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={handleCheckout} disabled={loading}>
              <ShoppingBag size={16} /> {loading ? 'Placing Order...' : `Pay ₹${grandTotal.toFixed(0)}`}
            </button>
            {!user && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>You need to <Link to="/login" style={{ color: 'var(--gold-dark)' }}>login</Link> to place an order</p>}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal total={grandTotal} method={paymentMethod} onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}
