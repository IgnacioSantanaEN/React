import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductPage = () => {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    // Aquí iría la lógica real de compra (carrito, pago, etc.).
    alert(`Compra iniciada para el producto: ${product?.name || id}`);
  };

  if (loading) return <div className="container mt-5">Cargando producto...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;
  if (!product) return <div className="container mt-5">Producto no encontrado.</div>;

  const images = Array.isArray(product.images) ? product.images.map((i) => (typeof i === 'string' ? i : i.url || i.path || i.file?.url)) : [];

  return (
    <div className="container mt-5">
      <Link to="/productos" className="btn btn-danger text-white mb-3">← Volver a productos</Link>

      <div className="row">
        <div className="col-md-6">
          {images.length > 0 ? (
            <img src={images[0]} alt={product.name} style={{ width: '100%', height: 420, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: 420, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sin imagen</div>
          )}
        </div>

        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">{product.description}</p>
          <h4 className="mt-3">${product.price ?? 0}</h4>
          <div className="mb-3">Stock: {product.stock_quantity ?? 0}</div>

          <div>
            {/* Si el usuario tiene rol 'cliente' habilitar compra */}
            <button className="btn btn-primary" onClick={handleBuy} disabled={!hasRole('cliente')}>
              {hasRole('cliente') ? 'Comprar' : 'Disponible solo para clientes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
