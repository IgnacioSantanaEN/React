import React from 'react';
import { Link } from 'react-router-dom';

// Componente tarjeta de producto
// Props: { product, onClick } - product debe tener al menos { name, price, description, stock_quantity, images }
const ProductCard = ({ product = {}, onClick }) => {
  const images = Array.isArray(product.images) ? product.images : [];

  const getUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.path || img.file?.url || img.path_display || null;
  };

  const visibleImages = images.map(getUrl).filter(Boolean);
  const mainImage = visibleImages[0] || null;

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ position: 'relative', height: 260, background: '#f8f9fa' }}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name || 'producto'}
            style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
            Sin imágenes
          </div>
        )}
      </div>

      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-0" style={{ fontSize: 16 }}>{product.name || 'Sin nombre'}</h5>
        </div>

        <div>
          <Link to={`/producto/${product.id || product._id || ''}`} className="btn btn-sm btn-outline-primary">
            Detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
