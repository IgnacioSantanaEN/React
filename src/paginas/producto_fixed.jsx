import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Notification from '../componentes/Notification';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [notification, setNotification] = useState(null);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/product/${id}`);
        setProduct(res.data || null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="container mt-5">Cargando producto...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!product) return <div className="container mt-5">Producto no encontrado.</div>;

  const images = Array.isArray(product.images) ? product.images.map((i) => (typeof i === 'string' ? i : i.url || i.path || i.file?.url)) : [];
  const mainImage = images[mainIndex] || null;

  const getProductId = () => product?.id || product?._id || id;
  const normalizeProductId = (productId) => (typeof productId === 'number' || (typeof productId === 'string' && !isNaN(productId)) ? Number(productId) : productId);

  // Añadir al carrito (extraído del onClick para simplificar JSX)
  const handleAddToCart = async () => {
    const cantidad = Number(qty) || 1;
    if (cantidad < 1) { setNotification({ message: 'La cantidad debe ser al menos 1', type: 'warning' }); return; }

    try {
      if (user && (user.status === 'locked' || user.blocked)) {
        setNotification({ message: 'Usted no esta autorizado para comprar en este sitio', type: 'danger' });
        return;
      }
      setAdding(true);
      let sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

      const productId = getProductId();
      const normalizedProductId = normalizeProductId(productId);
      const detailPayload = { product_id: normalizedProductId, quantity: cantidad };
      if (sessionId) detailPayload.session_id = sessionId;

      const res = await axios.post(`${API_BASE}/cart_detail`, detailPayload, { headers: { 'Content-Type': 'application/json' } });
      const returnedSession = res?.data?.session_id ?? null;
      if (returnedSession) {
        try { localStorage.setItem('sessionId', String(returnedSession)); } catch (e) { console.warn('No se pudo guardar sessionId', e); }
      }
      const model = res?.data?.data ?? res?.data ?? res;
      setAddResult(model);
      setNotification({ message: 'Producto añadido al carrito', type: 'success' });
    } catch (postErr) {
      console.error('POST /cart_detail falló:', postErr?.response || postErr?.message || postErr);
      const serverMsg = postErr?.response?.data ? JSON.stringify(postErr.response.data) : (postErr?.message || String(postErr));
      setNotification({ message: 'No se pudo añadir al carrito\n' + serverMsg, type: 'danger' });
      console.log('No se pudo añadir con payload normal. Revisar respuesta del servidor para el campo esperado.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProduct = async () => {
    const productId = getProductId();
    if (!productId) { setNotification({ message: 'ID de producto no disponible', type: 'warning' }); return; }
    if (!window.confirm(`¿Eliminar producto ${product?.name || productId}? Esta acción no se puede deshacer.`)) return;
    try {
      setDeleting(true);
      const resp = await axios.delete(`${API_BASE}/product/${productId}`);
      if (resp && (resp.status === 200 || resp.status === 204 || resp.status === 201)) {
        setNotification({ message: 'Producto eliminado', type: 'success' });
        navigate('/productos');
      } else {
        console.warn('Respuesta inesperada al eliminar producto:', resp?.status, resp?.data);
        setNotification({ message: 'No se pudo eliminar el producto (respuesta inesperada)', type: 'warning' });
      }
    } catch (err) {
      console.error('Error eliminando producto:', err?.response?.data || err.message || err);
      setNotification({ message: 'Error al eliminar el producto', type: 'danger' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mt-5">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <Link to="/productos" className="btn btn-danger text-white mb-3">← Volver a productos</Link>

      <div className="row">
        <div className="col-md-6">
          {mainImage ? (
            <div className="product-image-wrapper" onClick={() => images.length > 0 && setMainIndex((mi) => (mi + 1) % images.length)} style={{ cursor: 'pointer' }}>
              <img
                src={mainImage}
                alt={product.name}
                style={{ maxHeight: '520px', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', padding: 8 }}
              />
            </div>
          ) : (
            <div className="product-image-wrapper">Sin imagen</div>
          )}
          {/* Indicador de posición de la imagen, mostrado centrado bajo la imagen */}
          {images.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>
                {mainIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <div className="p-3 rounded" style={{ background: '#e8f4ff' }}>
            <div className="bg-white p-3 rounded shadow-sm mb-3">
              <h2 className="mb-0">{product.name}</h2>
            </div>

            <div className="bg-white p-3 rounded shadow-sm mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, color: '#6c757d' }}>Descripción</label>
              <div style={{ whiteSpace: 'pre-wrap' }}>{product.description}</div>
            </div>

            <div className="d-flex gap-2">
              <div className="bg-white p-3 rounded shadow-sm flex-grow-1">
                <label className="form-label mb-1" style={{ fontSize: 12, color: '#6c757d' }}>Precio</label>
                <div style={{ fontWeight: 600 }}>${product.price ?? 0}</div>
              </div>

              <div className="bg-white p-3 rounded shadow-sm" style={{ minWidth: 120 }}>
                <label className="form-label mb-1" style={{ fontSize: 12, color: '#6c757d' }}>Stock</label>
                <div>{product.stock_quantity ?? 0}</div>
              </div>
            </div>

            <div className="mt-3">
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="form-control"
                    style={{ width: 100 }}
                  />

                  <button className="btn btn-outline-primary" onClick={handleAddToCart} disabled={adding}>{adding ? 'Añadiendo...' : 'Añadir al carrito'}</button>

                  {isAdmin && (
                    <button className="btn btn-danger" style={{ marginLeft: 8 }} disabled={deleting} onClick={handleDeleteProduct}>
                      {deleting ? 'Eliminando...' : 'Eliminar producto'}
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="btn btn-warning"
                      style={{ marginLeft: 8 }}
                      onClick={() => navigate(`/add?edit=${product.id || product._id || id}`)}
                    >
                      Editar producto
                    </button>
                  )}

                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
