import { useState } from 'react';
import toast from 'react-hot-toast';
import { CURRENCY_CONFIG } from '../constants';
import '../styles/CatalogView.css';

function ItemDetailView({ item, onBack, cart, setCart }) {
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [comments, setComments] = useState([
    { id: 1, user: 'Dr. Sarah K.', date: '2 days ago', text: 'Used these in the field clinic last week. Extremely durable and well-packaged.' },
    { id: 2, user: 'John M. (OSL)', date: '5 days ago', text: 'Confirming expiry window is 24 months for current batch.' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const currentCurrency = item.currentCurrency || 'USD';

  if (!item) return null;

  const config = CURRENCY_CONFIG[currentCurrency] || CURRENCY_CONFIG.USD;
  const unitPriceConverted = parseFloat(item.price) * config.rate;
  // A small handling fee like in the HTML snippet
  const handling = Math.max(8, Math.round(unitPriceConverted * 0.08));
  const total = (unitPriceConverted * quantity) + handling;

  const formatPrice = (val) => `${config.symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const getShapeClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('kit') || cat.includes('emergency')) return 'kit';
    if (cat.includes('mask') || cat.includes('ppe')) return 'mask';
    if (cat.includes('glove')) return 'glove';
    return '';
  };
  const shapeClass = getShapeClass(item.category);
  const imageSrc = (item.image || '').replace('/images/real/', '/images/');

  const handleAddToCart = () => {
    const existing = cart.find(c => c.commodity.id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.commodity.id === item.id ? { ...c, qty: c.qty + quantity, notes: orderNotes } : c
      ));
      toast.success(`Updated ${item.name} in your request configuration`);
    } else {
      setCart([...cart, { commodity: item, qty: quantity, notes: orderNotes }]);
      toast.success(`${quantity} ${item.name} added to order request`);
    }
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: 'Me',
      date: 'Just now',
      text: newComment
    };
    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Comment posted successfully');
  };

  const handleSubmitRequest = () => {
    toast.success('Procurement request submitted successfully!');
    setShowOrderForm(false);
    onBack();
  };

  return (
    <div className="catalog-view" style={{ padding: '0 18px 18px' }}>
      <section className="topbar mb-2" style={{ marginTop: '18px' }}>
        <div className="page-title">
          <button 
            onClick={onBack}
            className="ghost-btn" style={{ height: '36px', minWidth: 'auto', padding: '0 16px', marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            ← Back to products
          </button>
          <h1 style={{ fontSize: '28px' }}>Item Detail</h1>
        </div>
      </section>

      <section className="products-detail-page">
        <div className="detail-visual">
          <div className="eyebrow" style={{ position: 'absolute', left: '20px', top: '20px', color: 'var(--blue)', background: 'rgba(15,91,255,0.08)' }}>Item detail</div>
          {shapeClass && <div className={`product-shape ${shapeClass}`}></div>}
          <img 
            src={imageSrc} 
            alt={item.name}
            className="detail-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder.svg';
            }}
          />
        </div>
        
        <div className="order-panel">
          <div className="detail-summary">
            <div className="detail-title">
              <h2>{item.name}</h2>
              <p>{item.description || item.usedFor || 'Comprehensive medical item packed for rapid deployment in clinics, ambulances, and field teams.'}</p>
            </div>
            
            <div className="products-head" style={{ padding: 0 }}>
              <div className="price-block" style={{ textAlign: 'left' }}>
                <strong>{formatPrice(unitPriceConverted)}</strong>
                <span>per {String(item.unit).toLowerCase().replace(/s$/, '')} • tax excluded</span>
              </div>
              <span className="chip">{item.category}</span>
            </div>
            
            <div className="detail-grid">
              <div className="detail-cell">
                <span>Usage</span>
                <strong>{item.usedFor || 'General procedural work and examination.'}</strong>
              </div>
              <div className="detail-cell">
                <span>Verification</span>
                <strong>{item.verification_status || 'WHO PQS Standardized'}</strong>
              </div>
              <div className="detail-cell">
                <span>Storage</span>
                <strong>{item.storage_requirements || 'Store in a cool dry area.'}</strong>
              </div>
              <div className="detail-cell">
                <span>Shelf Life</span>
                <strong>{item.shelf_life || '12-36 months'}</strong>
              </div>
            </div>

            <div>
              <div className="filter-title" style={{ marginBottom: '10px' }}>Recommended usage</div>
              <ul className="usage-list">
                <li>Deploy for trauma preparation, scene response, or clinic operations.</li>
                <li>Inspect seal, expiry labels, and sterile contents before assignment.</li>
                <li>Restock immediately after use to maintain emergency readiness.</li>
              </ul>
            </div>
          </div>
          
          <div className="filters-card grid gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Configuration</h3>
              <span className="subtle">Procurement details</span>
            </div>
            
            <div className="order-grid" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
              <div className="field">
                <label>Quantity needed</label>
                <div className="qty-stepper">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                  <span className="qty-value">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <div className="field" style={{ marginTop: '8px' }}>
                <label>Procurement Notes</label>
                <textarea 
                  placeholder="e.g. Need sealed units for rapid deployment. Confirm expiry window." 
                  style={{ minHeight: '80px' }}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
            <button className="link-btn primary w-full" onClick={handleAddToCart} style={{ marginTop: '12px' }}>
              Update Request Configuration
            </button>
          </div>

          <div className="filters-card">
            <div className="flex justify-between items-center" style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>User Feedback</h3>
              <span className="subtle">{comments.length} comments</span>
            </div>
            
            <div className="comments-section" style={{ display: 'grid', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
              {comments.map(c => (
                <div key={c.id} className="comment-bubble" style={{ background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid var(--line)' }}>
                  <div className="flex justify-between" style={{ marginBottom: '6px' }}>
                    <strong style={{ fontSize: '12px', color: 'var(--blue)' }}>{c.user}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{c.date}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--text)' }}>{c.text}</p>
                </div>
              ))}
            </div>

            <div className="add-comment" style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
              <textarea 
                placeholder="Write a comment..." 
                style={{ minHeight: '60px', borderRadius: '14px', padding: '12px', fontSize: '13px' }}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button className="link-btn" onClick={handlePostComment}>Post Comment</button>
            </div>
          </div>
          
          <div className="filters-card">
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>Order summary</h3>
              <span className="subtle">Live estimate</span>
            </div>
            <div className="summary-list">
              <div className="summary-row">
                <span>Item</span>
                <strong>{item.name}</strong>
              </div>
              <div className="summary-row">
                <span>Unit price ({currentCurrency})</span>
                <strong>{formatPrice(unitPriceConverted)}</strong>
              </div>
              <div className="summary-row">
                <span>Quantity</span>
                <strong>{quantity}</strong>
              </div>
              <div className="summary-row muted">
                <span>Handling & Transport</span>
                <strong>{formatPrice(handling)}</strong>
              </div>
              <div className="summary-row total">
                <span>Total Estimate</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
            
            <div className="order-actions" style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="link-btn primary" onClick={() => setShowOrderForm(true)} style={{ height: '48px', fontSize: '15px' }}>Check out & Submit</button>
              <button className="link-btn" onClick={onBack} style={{ height: '48px', fontSize: '15px' }}>Continue browsing</button>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Checkout Modal */}
      {showOrderForm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="filters-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}>
            <button onClick={() => setShowOrderForm(false)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            <h2 style={{ fontSize: '24px', marginBottom: '8px', background: 'var(--sidebar-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Submit Order Request</h2>
            <p className="subtle" style={{ marginBottom: '24px' }}>Please confirm your delivery details for {item.name}.</p>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div className="field">
                <label>Destination Facility</label>
                <input type="text" placeholder="e.g. Central Medical Stores" className="search-box-glossy" style={{ width: '100%' }} />
              </div>
              <div className="field">
                <label>Priority Level</label>
                <select className="search-box-glossy" style={{ width: '100%' }}>
                  <option>Routine</option>
                  <option>Urgent</option>
                  <option>Emergency (High Priority)</option>
                </select>
              </div>
              <div className="field">
                <label>Requested Delivery Date</label>
                <input type="date" className="search-box-glossy" style={{ width: '100%' }} />
              </div>

              <div className="note-box" style={{ marginTop: '12px' }}>
                <div className="flex justify-between" style={{ marginBottom: '8px' }}>
                  <span>Final Estimate:</span>
                  <strong style={{ color: 'var(--blue)' }}>{formatPrice(total)}</strong>
                </div>
                <div className="flex justify-between" style={{ fontSize: '12px', opacity: 0.7 }}>
                  <span>Qty: {quantity} units</span>
                  <span>Inc. handling</span>
                </div>
              </div>

              <button className="link-btn primary" style={{ height: '52px', marginTop: '12px' }} onClick={handleSubmitRequest}>
                Confirm & Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetailView;
