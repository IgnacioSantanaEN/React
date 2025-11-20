import React, { useState } from "react";
import { updateProduct, deleteProduct } from "../api/product";
import { useAuth } from "../context/AuthContext";

const ProductoLista = ({ products, onProductsChange }) => {
  const { authToken, isAdmin } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
  });

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleUpdate = async (id) => {
    try {
      const updatedData = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        stock_quantity: parseInt(editFormData.stock_quantity),
      };
      await updateProduct(id, updatedData, authToken);
      setEditingId(null);
      if (onProductsChange) {
        onProductsChange();
      }
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("Error al actualizar el producto");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${name}"?`)) {
      try {
        await deleteProduct(id, authToken);
        if (onProductsChange) {
          onProductsChange();
        }
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

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
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                {editingId === p.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={editFormData.stock_quantity}
                        onChange={handleEditChange}
                        className="form-control form-control-sm"
                      />
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          onClick={() => handleUpdate(p.id)}
                          className="btn btn-sm btn-success me-1"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn btn-sm btn-secondary"
                        >
                          Cancelar
                        </button>
                      </td>
                    )}
                  </>
                ) : (
                  <>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>${p.price}</td>
                    <td>{p.stock_quantity}</td>
                    {isAdmin && (
                      <td>
                        <button
                          onClick={() => handleEdit(p)}
                          className="btn btn-sm btn-primary me-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-sm btn-danger"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ProductoLista;
