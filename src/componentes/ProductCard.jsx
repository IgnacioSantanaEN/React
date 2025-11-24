import React, { useState } from 'react';

// Componente tarjeta de producto
// Props: { product, onClick } - product debe tener al menos { name, price, description, stock_quantity, images }
const ProductCard = ({ product = {}, onClick }) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const [index, setIndex] = useState(0);

  const getUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || img.path || img.file?.url || img.path_display || null;
  };

  const visibleImages = images.map(getUrl).filter(Boolean);

  const prev = () => setIndex((i) => (i - 1 + visibleImages.length) % Math.max(1, visibleImages.length));
  const next = () => setIndex((i) => (i + 1) % Math.max(1, visibleImages.length));

  const thumbClick = (i) => setIndex(i);

  return (
    <div className="card" style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ position: 'relative', height: 260, background: '#f8f9fa' }}>
        {visibleImages.length > 0 ? (
          <>
            <img
              src={visibleImages[index]}
              alt={`${product.name || 'producto'}-${index}`}
              style={{
                width: '100%',
                height: '260px',
                objectFit: 'cover',
                display: 'block'
              }}
              onClick={() => onClick && onClick(product)}
            />
            {visibleImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={prev}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={next}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' }}>
            Sin imágenes
          </div>
        )}
      </div>

      <div className="card-body">
        <h5 className="card-title" style={{ marginBottom: 6 }}>{product.name || 'Sin nombre'}</h5>
        <p className="text-muted mb-2" style={{ fontSize: 14 }}>{product.description ? (product.description.length > 140 ? product.description.slice(0, 140) + '...' : product.description) : ''}</p>

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontWeight: 600 }}>${product.price ?? '0'}</div>
            <div style={{ fontSize: 12, color: '#6c757d' }}>Stock: {product.stock_quantity ?? 0}</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6c757d' }}>{visibleImages.length} imagen(es)</div>
            {visibleImages.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                {visibleImages.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`thumb-${i}`}
                    onClick={() => thumbClick(i)}
                    style={{ width: 40, height: 40, objectFit: 'cover', cursor: 'pointer', border: i === index ? '2px solid #0d6efd' : '1px solid #ddd' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
