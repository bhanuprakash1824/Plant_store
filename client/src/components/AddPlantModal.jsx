import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addPlant, editPlant } from '../store/plantsSlice';

const CATEGORIES = [
  'Air Purifying Plants',
  'Aromatic Fragrant Plants',
  'Insect Repellent Plants',
  'Medicinal Plants',
  'Low Maintenance Plants',
  'Other',
];

const defaultForm = {
  name: '',
  category: '',
  description: '',
  image: '',
  price: '',
  stock: '',
};

const AddPlantModal = ({ isOpen, onClose, editingPlant }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingPlant) {
      setForm({
        name: editingPlant.name,
        category: editingPlant.category,
        description: editingPlant.description,
        image: editingPlant.image,
        price: editingPlant.price,
        stock: editingPlant.stock,
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [editingPlant, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.category || !form.description || !form.image || !form.price || !form.stock) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      if (editingPlant) {
        await dispatch(editPlant({ id: editingPlant._id, updates: payload })).unwrap();
      } else {
        await dispatch(addPlant(payload)).unwrap();
      }
      onClose();
    } catch (err) {
      setError(err || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingPlant ? '✏️ Edit Plant' : '🌱 Add New Plant'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Plant Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Snake Plant" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Brief description..." />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
            {form.image && (
              <img src={form.image} alt="preview" className="img-preview" onError={(e) => e.target.style.display = 'none'} />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="15.00" />
            </div>
            <div className="form-group">
              <label>Stock (units)</label>
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="10" />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingPlant ? 'Update Plant' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlantModal;
