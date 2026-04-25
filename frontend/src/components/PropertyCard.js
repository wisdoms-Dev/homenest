import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PropertyCard — shared card used by HomePage, ListingsPage, AIMatchPage.
 * Navigates to /properties/:id on click.
 * Shows a media-count badge when a property has multiple photos or videos.
 */
export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const {
    id, title, address, city, state,
    price, type, beds, baths, sqft,
    images, videos,
  } = property;

  const extraPhotos = (images?.length || 0) - 1;  // photos beyond the first
  const videoCount  =  videos?.length || 0;
  const hasExtras   = extraPhotos > 0 || videoCount > 0;

  const mainImg = images?.[0]
    || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80';

  return (
    <div
      className="property-card"
      onClick={() => navigate(`/properties/${id}`)}
    >
      {/* ── Image area ── */}
      <div className="property-card-img">
        <img src={mainImg} alt={title} loading="lazy" />

        {/* Rent / Sale badge — top-left */}
        <span className={`property-badge ${type === 'rent' ? 'badge-rent' : 'badge-buy'}`}>
          {type === 'rent' ? 'For rent' : 'For sale'}
        </span>

        {/* Media count badge — bottom-right, only when there are extras */}
        {hasExtras && (
          <span style={{
            position: 'absolute', bottom: 10, right: 10,
            background: 'rgba(0,0,0,0.60)', color: '#fff',
            padding: '3px 10px', borderRadius: 20, fontSize: 12,
            pointerEvents: 'none',
          }}>
            {extraPhotos > 0 && `+${extraPhotos} photo${extraPhotos > 1 ? 's' : ''}`}
            {extraPhotos > 0 && videoCount > 0 && ' · '}
            {videoCount > 0 && `${videoCount} video${videoCount > 1 ? 's' : ''}`}
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="property-card-body">
        <div className="property-price">
          ${price?.toLocaleString()}
          {type === 'rent' && (
            <span style={{ fontSize: 14, fontWeight: 400, color: '#9ca3af' }}>/mo</span>
          )}
        </div>
        <div className="property-address">{title}</div>
        <div className="property-address" style={{ marginTop: -4 }}>
          {city}, {state}
        </div>
        <div className="property-meta">
          <span>{beds > 0 ? `${beds} bd` : 'Studio'}</span>
          <span>{baths} ba</span>
          <span>{sqft?.toLocaleString()} sqft</span>
        </div>
      </div>
    </div>
  );
}