import { useState } from 'react';
import toast from 'react-hot-toast';
import '../../styles/modals/Modal.css';
import '../../styles/modals/AddCommodityModal.css';

function AddCommodityModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    category: 'Diagnostics',
    unit: '',
    price: '',
    stock: '',
  });

  const handleSubmit = () => {
    if (!form.name || !form.unit || !form.price || !form.stock) {
      toast.error('Please fill all required fields');
      return;
    }
    onAdd({
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm add-commodity-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Commodity</h2>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div className="add-commodity-form">
          {/* Commodity Name */}
          <div className="form-group">
            <label className="form-label">Commodity Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., TB Rapid Test Kit"
              className="form-input"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="form-select"
            >
              <option value="Diagnostics">Diagnostics</option>
              <option value="Reagents">Reagents</option>
              <option value="Supplies">Supplies</option>
              <option value="Safety">Safety</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>

          {/* Unit */}
          <div className="form-group">
            <label className="form-label">Unit of Measure *</label>
            <input
              type="text"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g., Box/100, Pack/50, Liter"
              className="form-input"
            />
          </div>

          {/* Price & Stock */}
          <div className="add-commodity-row">
            <div>
              <label className="form-label">Unit Price (USD) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                step="0.01"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Initial Stock *</label>
              <input
                type="number"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="form-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary">Add Commodity</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCommodityModal;
