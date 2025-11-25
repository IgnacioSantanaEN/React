import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { isAdmin } = useAuth();
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

  return (
    <div className="container mt-5">
      <Link to="/productos" className="btn btn-danger text-white mb-3">← Volver a productos</Link>

      <div className="row">
        <div className="col-md-6">
          {mainImage ? (
            <div className="product-image-wrapper" onClick={() => images.length > 0 && setMainIndex((mi) => (mi + 1) % images.length)} style={{ cursor: 'pointer' }}>
              <img src={mainImage} alt={product.name} />
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

                  <button
                    className="btn btn-outline-primary"
                    onClick={async () => {
                      // Añadir al carrito mínimo: crear carrito si falta y POST a cart_detail
                      // Nota: endpoints públicos para pruebas — no requerir autenticación aquí

                      const cantidad = Number(qty) || 1;
                      if (cantidad < 1) { alert('La cantidad debe ser al menos 1'); return; }

                      try {
                        setAdding(true);
                        // Obtener cartId existente y verificar que sea ACTIVO
                        let cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;
                        if (cartId) {
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
                          // crear carrito público activo
                          try {
                            const resp = await axios.post(`${API_BASE}/cart`, { status: 'active' });
                            const d = resp?.data;
                            cartId = d?.id || d?._id || d?.cartId || d?.data?.id || d?.data?._id || null;
                            if (cartId) localStorage.setItem('cartId', String(cartId));
                          } catch (cartErr) {
                            console.error('No se pudo crear carrito:', cartErr?.response || cartErr?.message || cartErr);
                          }
                        }

                        if (!cartId) {
                          alert('No se pudo obtener o crear carrito. Intenta de nuevo.');
                          return;
                        }

                        const productId = product?.id || product?._id || id;
                        // Asegurarse de enviar el id del producto en los campos más comunes
                        const normalizedProductId = typeof productId === 'number' || (typeof productId === 'string' && !isNaN(productId)) ? Number(productId) : productId;
                        const detailPayload = {
                          cart_id: cartId,
                          product: normalizedProductId,
                          product_id: normalizedProductId,
                          quantity: cantidad,
                        };
                        console.log('Intentando POST /cart_detail con payload (normalized):', detailPayload);
                        try {
                          await axios.post(`${API_BASE}/cart_detail`, detailPayload, { headers: { 'Content-Type': 'application/json' } });
                          alert('Producto añadido al carrito');
                        } catch (postErr) {
                          console.error('POST /cart_detail falló:', postErr?.response || postErr?.message || postErr);
                          // Mostrar error del servidor si está disponible
                          if (postErr?.response?.data) {
                            alert('Error del servidor: ' + JSON.stringify(postErr.response.data));
                          }

                          // Si falla, mostrar el error (la API debería indicar el campo esperado)
                          console.log('No se pudo añadir con payload normal. Revisar respuesta del servidor para el campo esperado.');
                        }
                      } catch (err) {
                        console.error('Error añadiendo al carrito:', err);
                        alert('No se pudo añadir el producto al carrito');
                      } finally {
                        setAdding(false);
                      }
                    }}
                    disabled={adding}
                  >
                    {adding ? 'Añadiendo...' : 'Añadir al carrito'}
                  </button>

                  {isAdmin && (
                    <button
                      className="btn btn-danger"
                      style={{ marginLeft: 8 }}
                      disabled={deleting}
                      onClick={async () => {
                        const productId = product?.id || product?._id || id;
                        if (!productId) return alert('ID de producto no disponible');
                        if (!window.confirm(`¿Eliminar producto ${product?.name || productId}? Esta acción no se puede deshacer.`)) return;
                        try {
                          setDeleting(true);
                          const resp = await axios.delete(`${API_BASE}/product/${productId}`);
                          if (resp && (resp.status === 200 || resp.status === 204 || resp.status === 201)) {
                            alert('Producto eliminado');
                            navigate('/productos');
                          } else {
                            console.warn('Respuesta inesperada al eliminar producto:', resp?.status, resp?.data);
                            alert('No se pudo eliminar el producto (respuesta inesperada)');
                          }
                        } catch (err) {
                          console.error('Error eliminando producto:', err?.response?.data || err.message || err);
                          alert('Error al eliminar el producto');
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
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
