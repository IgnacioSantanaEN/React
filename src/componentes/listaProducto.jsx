import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "./ProductCard";

const ProductoLista = ({ products }) => {
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState('');
  const items = Array.isArray(products) ? products : [];
  const q = (query || '').trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((p) => {
      const name = String(p.name || p.title || '').toLowerCase();
      const desc = String(p.description || p.desc || '').toLowerCase();
      const price = String(p.price || p.unit_price || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || price.includes(q);
    });
  }, [items, q]);

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
