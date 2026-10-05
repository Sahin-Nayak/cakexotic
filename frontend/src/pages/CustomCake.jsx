import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Plus, Minus, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Choose Base', 'Layers & Size', 'Flavor & Frost', 'Fillings & Toppings', 'Finishing Touch', 'Review'];

export default function CustomCake() {
  const [step, setStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState({});
  const [selected, setSelected] = useState({
    base_cake: null,
    layers: null,
    size: null,
    shape: null,
    flavor: null,
    frosting: null,
    filling: null,
    toppings: [],
    cake_message: '',
    special_instructions: '',
    quantity: 1,
  });
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.filter(p => p.is_customizable || p.category_name === 'Signature Cakes' || p.category_name === 'Celebration Cakes')));
    api.get('/products/custom-options').then(r => {
      const grouped = {};
      r.data.forEach(o => { if (!grouped[o.type]) grouped[o.type] = []; grouped[o.type].push(o); });
      setOptions(grouped);
    });
  }, []);

  const basePrice = selected.base_cake ? parseFloat(selected.base_cake.price) : 0;
  const addOns = [
    selected.layers, selected.size, selected.shape, selected.flavor,
    selected.frosting, selected.filling, ...selected.toppings
  ].filter(Boolean).reduce((s, o) => s + parseFloat(o.price_addition || 0), 0);
  const unitPrice = basePrice + addOns;
  const totalPrice = unitPrice * selected.quantity;

  const toggleTopping = (t) => {
    setSelected(prev => ({
      ...prev,
      toppings: prev.toppings.find(x => x.id === t.id)
        ? prev.toppings.filter(x => x.id !== t.id)
        : [...prev.toppings, t]
    }));
  };

  const canProceed = () => {
    if (step === 0) return !!selected.base_cake;
    if (step === 1) return !!selected.layers && !!selected.size;
    if (step === 2) return !!selected.flavor && !!selected.frosting;
    return true;
  };

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to place an order'); navigate('/login'); return; }
    const customDetails = {
      base_cake_name: selected.base_cake.name,
      layers: selected.layers?.name,
      size: selected.size?.name,
      shape: selected.shape?.name,
      flavor: selected.flavor?.name,
      frosting: selected.frosting?.name,
      filling: selected.filling?.name,
      toppings: selected.toppings.map(t => t.name),
      cake_message: selected.cake_message,
      special_instructions: selected.special_instructions,
      base_price: basePrice,
      customization_price: addOns,
    };
    addItem({
      product_id: selected.base_cake.id,
      product_name: `Custom ${selected.base_cake.name}`,
      unit_price: unitPrice,
      quantity: selected.quantity,
      subtotal: totalPrice,
      is_custom: true,
      custom_details: customDetails,
    });
    toast.success('Custom cake added to cart!');
    navigate('/cart');
  };

  const opt = (type, item) => setSelected(prev => ({ ...prev, [type]: item }));

  const OptionCard = ({ item, selected: sel, onSelect, multi }) => {
    const isSelected = multi
      ? sel?.find(x => x.id === item.id)
      : sel?.id === item.id;
    return (
      <div onClick={() => onSelect(item)} style={{
        border: `2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 16px',
        cursor: 'pointer',
        background: isSelected ? 'rgba(212,168,83,0.08)' : 'var(--white)',
        transition: 'all 0.2s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
          {item.price_addition > 0 && <div style={{ fontSize: 12, color: 'var(--gold-dark)' }}>+₹{item.price_addition}</div>}
        </div>
        {isSelected && <Check size={16} color="var(--gold-dark)" />}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>🎨 Design Your Dream Cake</h1>
        <p>Build it layer by layer, exactly how you imagined</p>
      </div>

      {/* Step indicator */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '20px 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', maxWidth: 900, margin: '0 auto', padding: '0 24px', gap: 0, minWidth: 600 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div onClick={() => i < step && setStep(i)} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i < step ? 'var(--success)' : i === step ? 'var(--gold)' : 'var(--border)',
                  color: i <= step ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  cursor: i < step ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 11, marginTop: 4, color: i === step ? 'var(--gold-dark)' : 'var(--text-muted)', fontWeight: i === step ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ height: 2, flex: 1, background: i < step ? 'var(--success)' : 'var(--border)', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        {/* MAIN CONTENT */}
        <div>
          {/* STEP 0: Choose Base Cake */}
          {step === 0 && (
            <div>
              <h2 style={{ marginBottom: 8 }}>Choose Your Base Cake</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Start with one of our signature cakes as your foundation</p>
              <div className="grid-2">
                {products.map(p => (
                  <div key={p.id} onClick={() => opt('base_cake', p)} style={{
                    border: `2px solid ${selected.base_cake?.id === p.id ? 'var(--gold)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
                    background: selected.base_cake?.id === p.id ? 'rgba(212,168,83,0.06)' : 'var(--white)',
                    transition: 'all 0.2s',
                  }}>
                    <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    <div style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description?.slice(0, 50)}...</div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>₹{p.price}</div>
                          {selected.base_cake?.id === p.id && <Check size={16} color="var(--gold-dark)" style={{ marginTop: 4 }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Layers & Size */}
          {step === 1 && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Layers & Size</h2>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Number of Layers</h3>
              <div className="grid-2" style={{ marginBottom: 28 }}>
                {(options.layer || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.layers} onSelect={(v) => opt('layers', v)} />
                ))}
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Cake Size</h3>
              <div className="grid-2" style={{ marginBottom: 28 }}>
                {(options.size || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.size} onSelect={(v) => opt('size', v)} />
                ))}
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Shape</h3>
              <div className="grid-2">
                {(options.shape || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.shape} onSelect={(v) => opt('shape', v)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Flavor & Frosting */}
          {step === 2 && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Flavor & Frosting</h2>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Cake Flavor</h3>
              <div className="grid-2" style={{ marginBottom: 28 }}>
                {(options.flavor || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.flavor} onSelect={(v) => opt('flavor', v)} />
                ))}
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Frosting</h3>
              <div className="grid-2">
                {(options.frosting || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.frosting} onSelect={(v) => opt('frosting', v)} />
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Fillings & Toppings */}
          {step === 3 && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Fillings & Toppings</h2>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Filling (between layers)</h3>
              <div className="grid-2" style={{ marginBottom: 28 }}>
                {(options.filling || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.filling} onSelect={(v) => opt('filling', v)} />
                ))}
              </div>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Toppings <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(select multiple)</span></h3>
              <div className="grid-2">
                {(options.topping || []).map(o => (
                  <OptionCard key={o.id} item={o} selected={selected.toppings} onSelect={toggleTopping} multi />
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Finishing Touch */}
          {step === 4 && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Finishing Touch</h2>
              <div className="form-group">
                <label>Message on Cake (optional)</label>
                <input
                  type="text" maxLength={60}
                  placeholder="e.g. Happy Birthday Sarah! 🎂"
                  value={selected.cake_message}
                  onChange={e => setSelected(p => ({ ...p, cake_message: e.target.value }))}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{selected.cake_message.length}/60 characters</div>
              </div>
              <div className="form-group">
                <label>Special Instructions (optional)</label>
                <textarea
                  rows={4}
                  placeholder="Any allergies, special requirements, or design preferences..."
                  value={selected.special_instructions}
                  onChange={e => setSelected(p => ({ ...p, special_instructions: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => setSelected(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}><Minus size={14} /></button>
                  <span style={{ fontSize: 18, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{selected.quantity}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => setSelected(p => ({ ...p, quantity: p.quantity + 1 }))}><Plus size={14} /></button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {step === 5 && (
            <div>
              <h2 style={{ marginBottom: 24 }}>Review Your Custom Cake</h2>
              <div className="card">
                <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                  {selected.base_cake?.image_url && (
                    <img src={selected.base_cake.image_url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                  )}
                  <div>
                    <h3 style={{ marginBottom: 4 }}>Custom {selected.base_cake?.name}</h3>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Made to your specifications</div>
                  </div>
                </div>
                <div className="divider" />
                {[
                  ['Size', selected.size?.name],
                  ['Layers', selected.layers?.name],
                  ['Shape', selected.shape?.name],
                  ['Flavor', selected.flavor?.name],
                  ['Frosting', selected.frosting?.name],
                  ['Filling', selected.filling?.name],
                  ['Toppings', selected.toppings.map(t => t.name).join(', ') || 'None'],
                  ['Message', selected.cake_message || 'None'],
                  ['Instructions', selected.special_instructions || 'None'],
                  ['Quantity', selected.quantity],
                ].map(([k, v]) => v && (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <button className="btn btn-outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ChevronLeft size={16} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddToCart} style={{ padding: '12px 32px' }}>
                <ShoppingCart size={16} /> Add to Cart — ₹{totalPrice.toFixed(0)}
              </button>
            )}
          </div>
        </div>

        {/* PRICE SUMMARY SIDEBAR */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Your Cake Summary</h3>
            {selected.base_cake ? (
              <>
                <img src={selected.base_cake.image_url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{selected.base_cake.name}</div>
              </>
            ) : (
              <div style={{ height: 140, background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: 'var(--text-muted)', fontSize: 13 }}>
                Select a cake to start
              </div>
            )}
            <div className="divider" />
            {[
              ['Base cake', basePrice > 0 ? `₹${basePrice}` : null],
              [selected.size?.name, selected.size?.price_addition > 0 ? `+₹${selected.size.price_addition}` : null],
              [selected.layers?.name, selected.layers?.price_addition > 0 ? `+₹${selected.layers.price_addition}` : null],
              [selected.shape?.name, selected.shape?.price_addition > 0 ? `+₹${selected.shape.price_addition}` : null],
              [selected.flavor?.name, selected.flavor?.price_addition > 0 ? `+₹${selected.flavor.price_addition}` : null],
              [selected.frosting?.name, selected.frosting?.price_addition > 0 ? `+₹${selected.frosting.price_addition}` : null],
              [selected.filling?.name, selected.filling?.price_addition > 0 ? `+₹${selected.filling.price_addition}` : null],
              ...selected.toppings.map(t => [t.name, t.price_addition > 0 ? `+₹${t.price_addition}` : null]),
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: 'var(--text-muted)' }}>
                <span>{k}</span><span>{v}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
              <span>Unit Price</span>
              <span style={{ color: 'var(--gold-dark)' }}>₹{unitPrice.toFixed(0)}</span>
            </div>
            {selected.quantity > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginTop: 8, color: 'var(--gold-dark)' }}>
                <span>Total (×{selected.quantity})</span>
                <span>₹{totalPrice.toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
