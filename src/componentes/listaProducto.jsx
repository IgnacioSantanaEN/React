import React from "react";
import { Link} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProductoLista = ({ products }) => {
  const { isAdmin } = useAuth();
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
      {(() => {
        const items = Array.isArray(products) ? products : [];
        if (items.length === 0) {
          return (
            <p className="text-muted text-center mt-4">No hay productos registrados aún.</p>
          );
        }
        return (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id || p._id || JSON.stringify(p)}>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>${p.price}</td>
                  <td>{p.stock_quantity ?? p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })()}
    </div>
  );
};

export default ProductoLista;
