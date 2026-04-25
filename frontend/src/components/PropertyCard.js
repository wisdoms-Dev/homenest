import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const { id, title, address, city, state, price, type, beds, baths, sqft, images } = property;

  return (
    <div className="property-card" onClick={() => navigate(`/properties/${id}`)}>
      <div className="property-card-img">
        <img
          src={images?.[0] || `https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80`}
          alt={title}
          loading="lazy"
        />
        <span className={`property-badge ${type === 'rent' ? 'badge-rent' : 'badge-buy'}`}>
          {type === 'rent' ? 'For rent' : 'For sale'}
        </span>
      </div>
      <div className="property-card-body">
        <div className="property-price">
          ${price?.toLocaleString()}{type === 'rent' ? '/mo' : ''}
        </div>
        <div className="property-address">{address}, {city}, {state}</div>
        <div className="property-meta">
          <span>{beds > 0 ? `${beds} bd` : 'Studio'}</span>
          <span>{baths} ba</span>
          <span>{sqft?.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}