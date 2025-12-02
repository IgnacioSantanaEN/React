import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';
import { useAuth } from '../context/AuthContext';

// Componente tarjeta de producto
// Props: { product, onClick } - product debe tener al menos { name, price, description, stock_quantity, images }
const ProductCard = ({ product = {}, onClick }) => {
  const images = Array.isArray(product.images) ? product.images : [];
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Simplified image resolver: images are either strings (URLs) or objects with a `url` field.
  const getUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.url || null;
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

      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-1" style={{ fontSize: 16 }}>{product.name || 'Sin nombre'}</h5>
            {product.price != null && (
              <div className="text-muted" style={{ fontSize: 14 }}>${product.price}</div>
            )}
          </div>

          <div className="d-flex gap-2">
            <Link to={`/producto/${product.id || product._id || ''}`} className="btn btn-sm btn-outline-primary">
              Detalles
            </Link>
            {isAdmin && (
              <button className="btn btn-sm btn-warning" onClick={() => navigate(`/add?edit=${product.id || product._id || ''}`)}>
                Editar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer d-flex align-items-center gap-2">
        <div className="d-flex align-items-center">
          <label htmlFor={`qty-${product.id || product._id || ''}`} className="me-2 mb-0">Cantidad</label>
          <input
            id={`qty-${product.id || product._id || ''}`}
            type="number"
            min={1}
            max={product?.stock_quantity ?? 9999}
            value={quantity}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isNaN(v) || v < 1) return setQuantity(1);
              const max = product?.stock_quantity ?? 9999;
              setQuantity(v > max ? max : v);
            }}
            className="form-control form-control-sm"
            style={{ width: 80 }}
          />
        </div>

        <div className="ms-auto">
          <button
            className="btn btn-sm btn-primary"
            onClick={async () => {
              if (loading) return;
              setLoading(true);
              const rawId = product?.id ?? product?._id ?? product?.product_id ?? null;
              if (!rawId) {
                alert('ID de producto no disponible');
                setLoading(false);
                return;
              }
              const productId = rawId;
              try {
                if (API_BASE) {
                  let cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
                  if (!cartId) {
                    try {
                      cartId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `cart-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
                    } catch (e) {
                      cartId = `cart-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
                    }
                    localStorage.setItem('cartId', String(cartId));
                  }

                  const payload = { cart_id: cartId, product_id: productId, product: productId, quantity: Number(quantity) };
                  const resp = await axios.post(`${API_BASE}/cart_detail`, payload);
                  if (resp && (resp.status === 200 || resp.status === 201 || resp.status === 204)) {
                    window.dispatchEvent(new Event('cartUpdated'));
                    alert('Producto añadido al carrito');
                    setLoading(false);
                    return;
                  }
                  console.warn('Respuesta inesperada al añadir al carrito (API):', resp?.status, resp?.data);
                  alert('No se pudo añadir al carrito (respuesta inesperada)');
                } else {
                  alert('No hay backend configurado para añadir al carrito');
                }
              } catch (err) {
                console.error('Error añadiendo al carrito (API):', err?.response || err.message || err);
                alert('No se pudo añadir al carrito (error de servidor)');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? 'Añadiendo...' : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
