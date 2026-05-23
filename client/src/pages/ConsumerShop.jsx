import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllPlants } from '../store/plantsSlice';
import PlantCard from '../components/PlantCard';
import axiosInstance from '../api/axiosInstance';

const CATEGORIES = [
  'All',
  'Air Purifying Plants',
  'Aromatic Fragrant Plants',
  'Insect Repellent Plants',
  'Medicinal Plants',
  'Low Maintenance Plants',
  'Other',
];

const ConsumerShop = () => {
  const dispatch = useDispatch();
  const { plants, isLoading, error } = useSelector((s) => s.plants);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAllPlants());
  }, [dispatch]);

  const filteredPlants = plants.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filteredPlants.filter((p) => p.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="shop-page">
      <div className="shop-hero">
        <h1>🌿 Browse Plants</h1>
        <p>Discover plants from our trusted producers</p>
        <div className="shop-search">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plants by name or description..."
          />
        </div>
      </div>

      <div className="category-filter">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-btn ${activeCategory === c ? 'active' : ''}`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="page-loading">Loading plants...</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">No plants found matching your search.</div>
      ) : (
        <div className="shop-content">
          {Object.entries(grouped).map(([cat, catPlants]) => (
            <div key={cat} className="category-section">
              <h2 className="category-heading">{cat}</h2>
              <div className="plants-grid">
                {catPlants.map((plant) => (
                  <PlantCard key={plant._id} plant={plant} mode="consumer" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumerShop;
