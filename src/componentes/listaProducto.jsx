import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "./ProductCard";
import axios from "axios";

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductoLista = ({ products }) => {
  const { isAdmin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [creatingCart, setCreatingCart] = useState(false);
  const [query, setQuery] = useState('');
  const items = Array.isArray(products) ? products : [];
  const q = (query || '').trim().toLowerCase();
  const filtered = q
    ? items.filter((p) => {
        const name = String(p.name || p.title || '').toLowerCase();
        const desc = String(p.description || p.desc || '').toLowerCase();
        const price = String(p.price || p.unit_price || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || price.includes(q);
      })
    : items;

  return (
    <div className="container mt-5 pt-5 body-background">
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h2>Productos</h2>
        <div>
          {isAdmin && (
            <Link className="btn btn-success me-2" to="/add">
              + Añadir Producto
            </Link>
          )}

          <button
            className="btn"
            style={{ backgroundColor: '#00bfff', color: '#ffffff', borderColor: '#00bfff' }}
            disabled={creatingCart}
            onClick={async () => {
              // Si no está autenticado, redirigir al login
              if (!isAuthenticated) {
                // puedes cambiar el mensaje o la ruta si quieres
                if (window.confirm('Debes iniciar sesión para usar un carrito. Ir a login?')) {
                  navigate('/login');
                }
                return;
              }

              try {
                setCreatingCart(true);
                // enviar user_id porque el backend ahora exige asignación al crear
                const payload = { user_id: user?.id || user?._id || user?.uid };
                const resp = await axios.post(`${API_BASE}/cart`, payload);
                const d = resp?.data;
                // soportar varias formas de respuesta: { id }, { _id }, { cartId }, { data: { id } }, etc.
                const cartId = d?.id || d?._id || d?.cartId || d?.data?.id || d?.data?._id || null;
                if (cartId) {
                  // guardar carrito para el flujo de pago
                  localStorage.setItem('cartId', String(cartId));
                }
                alert('Carrito creado correctamente. ID: ' + (cartId || 'desconocido'));
              } catch (err) {
                console.error('Error creando carrito', err);
                const status = err?.response?.status;
                const resp = err?.response?.data;
                console.error('Status:', status, 'Response:', resp);
                alert('No se pudo crear el carrito' + (status ? ` (status ${status})` : ''));
              } finally {
                setCreatingCart(false);
              }
            }}
          >
            {creatingCart ? 'Creando...' : 'Usar carrito'}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="input-group">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre, descripción o precio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn"
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#ced4da' }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted text-center mt-4">No hay productos registrados aún.</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-center mt-4">No hay productos que coincidan con la búsqueda.</p>
      ) : (
        <div className="row">
          {filtered.map((p) => (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={p.id || p._id || JSON.stringify(p)}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductoLista;
