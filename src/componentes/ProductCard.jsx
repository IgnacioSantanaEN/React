import React from 'react';
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

        <div className="d-flex gap-2">
          <Link to={`/producto/${product.id || product._id || ''}`} className="btn btn-sm btn-outline-primary">
            Detalles
          </Link>

                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: '#ffffff', color: '#000', borderColor: '#ced4da' }}
                  onClick={async () => {
                    // Añadir al carrito público (cantidad = 1 siempre). Crea carrito si falta.
                      try {
                      let cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
                      if (cartId) {
                        // verificar que el carrito guardado esté ACTIVO
                        try {
                          const chk = await axios.get(`${API_BASE}/cart/${cartId}`);
                          const cartObj = chk?.data?.data ?? chk?.data ?? null;
                          if (!cartObj || (cartObj.status && cartObj.status !== 'active')) {
                            cartId = null;
                          }
                        } catch (e) {
                          cartId = null;
                        }
                      }

                      if (!cartId) {
                        // crear carrito público con status active
                        const resp = await axios.post(`${API_BASE}/cart`, { status: 'active' });
                        const d = resp?.data;
                        cartId = d?.id || d?._id || d?.cartId || d?.data?.id || d?.data?._id || null;
                        if (cartId) localStorage.setItem('cartId', String(cartId));
                      }
                      if (!cartId) return alert('No se pudo crear o recuperar el carrito');
                      const rawId = product?.id ?? product?._id ?? product?.product_id ?? null;
                      if (!rawId) return alert('ID de producto no disponible');
                      const productId = (typeof rawId === 'string' && !isNaN(rawId)) ? Number(rawId) : rawId;
                      const payload = { cart_id: cartId, product_id: productId, product: productId, quantity: 1 };
                      const resp = await axios.post(`${API_BASE}/cart_detail`, payload);
                      if (resp && (resp.status === 200 || resp.status === 201 || resp.status === 204)) {
                        window.dispatchEvent(new Event('cartUpdated'));
                        alert('Producto añadido al carrito');
                      } else {
                        console.warn('Respuesta inesperada al añadir al carrito:', resp?.status, resp?.data);
                        alert('No se pudo añadir al carrito (respuesta inesperada)');
                      }
                    } catch (err) {
                      console.error('Error añadiendo al carrito desde tarjeta:', err?.response || err.message || err);
                      alert('No se pudo añadir al carrito');
                    }
                  }}
                >
                  Añadir
                </button>

          {isAdmin && (
            <button className="btn btn-sm btn-warning" onClick={() => navigate(`/add?edit=${product.id || product._id || ''}`)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
