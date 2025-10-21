import React from "react";
import { Link} from "react-router-dom";

const ProductoLista = ({ products }) => {
  return (
    <div className="container mt-5 pt-5 body-background">
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h2>Productos</h2>
        <Link
          className="btn btn-success" to="/add">
          + Añadir Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-muted text-center mt-4">
          No hay productos registrados aún.
        </p>
      ) : (
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
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>${p.price}</td>
                <td>{p.stock_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductoLista;
