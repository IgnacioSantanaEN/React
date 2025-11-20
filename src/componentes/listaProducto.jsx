import React from "react";

const ProductoLista = ({ products }) => {
  return (
    <>
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
    </>
  );
};

export default ProductoLista;
