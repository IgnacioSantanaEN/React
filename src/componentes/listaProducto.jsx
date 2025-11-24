import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProductCard from "./ProductCard";

const ProductoLista = ({ products }) => {
  const { isAdmin } = useAuth();
  const items = Array.isArray(products) ? products : [];

  return (
    <div className="container mt-5 pt-5 body-background">
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h2>Productos</h2>
        {isAdmin && (
          <Link className="btn btn-success" to="/add">
            + Añadir Producto
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-muted text-center mt-4">No hay productos registrados aún.</p>
      ) : (
        <div className="row">
          {items.map((p) => (
            <div className="col-12 col-md-6 col-lg-4 mb-4" key={p.id || p._id || JSON.stringify(p)}>
              <Link to={`/producto/${p.id || p._id || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ProductCard product={p} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductoLista;
