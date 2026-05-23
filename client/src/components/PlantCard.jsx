import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../store/cartSlice';

const PlantCard = ({ plant, mode = 'consumer', onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const inCart = cartItems.some((i) => i._id === plant._id);
  const isOutOfStock = plant.stock === 0;

  const handleAddToCart = () => {
    dispatch(addItem(plant));
  };

  return (
    <div className={`plant-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="plant-card-img-wrap">
        <img src={plant.image} alt={plant.name} className="plant-card-img" />
        {isOutOfStock && <div className="stock-overlay">Out of Stock</div>}
        {plant.stock <= 3 && plant.stock > 0 && (
          <div className="low-stock-badge">Only {plant.stock} left!</div>
        )}
      </div>
      <div className="plant-card-body">
        <div className="plant-card-header">
          <h3 className="plant-name">{plant.name}</h3>
          <span className="plant-price">${plant.price}</span>
        </div>
        <span className="plant-category-tag">{plant.category}</span>
        <p className="plant-description">{plant.description}</p>

        {/* Producer info (shown to consumers) */}
        {mode === 'consumer' && plant.producer && (
          <div className="plant-producer-info">
            <p className="plant-producer">
              🌾 {plant.producer.businessName || plant.producer.name}
            </p>
            {plant.producer.phone && (
              <a
                href={`tel:${plant.producer.phone}`}
                className="plant-producer-phone"
                onClick={(e) => e.stopPropagation()}
              >
                📞 {plant.producer.phone}
              </a>
            )}
          </div>
        )}

        {/* Stock info for producers */}
        {mode === 'producer' && (
          <p className="plant-stock">Stock: {plant.stock} units</p>
        )}

        <div className="plant-card-actions">
          {mode === 'consumer' && (
            <button
              className={`btn-add-cart ${inCart ? 'in-cart' : ''}`}
              onClick={handleAddToCart}
              disabled={inCart || isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : inCart ? '✓ In Cart' : 'Add to Cart'}
            </button>
          )}

          {mode === 'producer' && (
            <>
              <button className="btn-edit" onClick={() => onEdit(plant)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => onDelete(plant._id)}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantCard;
