import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Notification from '../componentes/Notification';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainIndex, setMainIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API_BASE}/product/${id}`)
      .then((res) => setProduct(res.data || null))
      .catch((err) => { console.error(err); setError('No se pudo cargar el producto'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container mt-5">Cargando producto...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!product) return <div className="container mt-5">Producto no encontrado.</div>;

  const productId = product?.id ?? product?._id ?? id;
  const images = Array.isArray(product.images) ? product.images.map(i => (typeof i === 'string' ? i : i?.url || i?.path)) : [];
  const mainImage = images[mainIndex] ?? null;

  const handleAddToCart = async () => {
    const cantidad = Math.max(1, Number(qty) || 1);
    if (user && (user.status === 'locked' || user.blocked)) {
      setNotification({ message: 'No estás autorizado para comprar', type: 'danger' });
      return;
    }
    setBusy(true);
    try {
      const sessionId = localStorage.getItem('sessionId');
      const payload = { product_id: productId, quantity: cantidad };
      if (sessionId) payload.session_id = sessionId;
      const res = await axios.post(`${API_BASE}/cart_detail`, payload);
      const returnedSession = res?.data?.session_id;
      if (returnedSession) localStorage.setItem('sessionId', String(returnedSession));
      setNotification({ message: 'Producto añadido al carrito', type: 'success' });
    } catch (err) {
      console.error('Error añadiendo al carrito', err);
      setNotification({ message: 'No se pudo añadir al carrito', type: 'danger' });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm(`¿Eliminar producto ${product?.name || productId}?`)) return;
    setBusy(true);
    try {
      await axios.delete(`${API_BASE}/product/${productId}`);
      setNotification({ message: 'Producto eliminado', type: 'success' });
      navigate('/productos');
    } catch (err) {
      console.error('Error eliminando producto', err);
      setNotification({ message: 'Error al eliminar producto', type: 'danger' });
    } finally { setBusy(false); }
  };

  return (
    <div className="container mt-5">
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <Link to="/productos" className="btn btn-danger text-white mb-3">← Volver a productos</Link>

      <div className="row">
        <div className="col-md-6">
          {mainImage ? (
            <div className="product-image-wrapper" onClick={() => images.length > 0 && setMainIndex((mi) => (mi + 1) % images.length)} style={{ cursor: 'pointer' }}>
              <img src={mainImage} alt={product.name} style={{ maxHeight: 520, width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto', padding: 8 }} />
            </div>
          ) : (
            <div className="product-image-wrapper">Sin imagen</div>
          )}
          {images.length > 0 && (<div style={{ textAlign: 'center', marginTop: 8 }}><span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>{mainIndex + 1} / {images.length}</span></div>)}
        </div>

        <div className="col-md-6">
          <div className="p-3 rounded" style={{ background: '#e8f4ff' }}>
            <div className="bg-white p-3 rounded shadow-sm mb-3"><h2 className="mb-0">{product.name}</h2></div>

            <div className="bg-white p-3 rounded shadow-sm mb-3">
              <label className="form-label mb-1" style={{ fontSize: 12, color: '#6c757d' }}>Descripción</label>
              <div style={{ whiteSpace: 'pre-wrap' }}>{product.description}</div>
            </div>

            <div className="d-flex gap-2">
              <div className="bg-white p-3 rounded shadow-sm w-100"><label className="form-label mb-1" style={{ fontSize: 12, color: '#6c757d' }}>Precio</label><div style={{ fontWeight: 600 }}>${product.price ?? 0}</div></div>
            </div>

            <div className="mt-3">
              <div className="d-flex gap-2 align-items-center">
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="form-control" style={{ width: 100 }} />
                <button className="btn btn-outline-primary" onClick={handleAddToCart} disabled={busy}>{busy ? 'Procesando...' : 'Añadir al carrito'}</button>
                {isAdmin && (<button className="btn btn-danger" style={{ marginLeft: 8 }} disabled={busy} onClick={handleDeleteProduct}>{busy ? 'Procesando...' : 'Eliminar producto'}</button>)}
                {isAdmin && (<button className="btn btn-warning" style={{ marginLeft: 8 }} onClick={() => navigate(`/add?edit=${productId}`)}>Editar producto</button>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
