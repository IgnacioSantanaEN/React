import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductPage = () => {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);

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

  const handleBuy = () => {
    // Lógica de compra no implementada aquí; el botón se habilita solo para clientes.
    alert(`Compra iniciada para el producto: ${product?.name || id}`);
  };

  if (loading) return <div className="container mt-5">Cargando producto...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!product) return <div className="container mt-5">Producto no encontrado.</div>;

  const images = Array.isArray(product.images)
    ? product.images.map((i) => (typeof i === 'string' ? i : i.url || i.path || i.file?.url))
    : [];
  const mainImage = images[mainIndex] || null;

  return (
    <div className="container mt-5">
      <Link to="/productos" className="btn btn-danger text-white mb-3">← Volver a productos</Link>

      <div className="row">
        <div className="col-md-6">
          {mainImage ? (
            <div
              className="product-image-wrapper"
              onClick={() => images.length > 0 && setMainIndex((mi) => (mi + 1) % images.length)}
              style={{ cursor: 'pointer' }}
            >
              <img src={mainImage} alt={product.name} />
              <div
                style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}
              >
                {mainIndex + 1} / {images.length}
              </div>
            </div>
          ) : (
            <div className="product-image-wrapper">Sin imagen</div>
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
              <button className="btn btn-primary" onClick={handleBuy} disabled={!hasRole('cliente')}>
                {hasRole('cliente') ? 'Comprar' : 'Disponible solo para clientes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
