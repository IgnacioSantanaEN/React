import React, { useState } from "react";
import { createProduct } from "../api/product";

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("Debes iniciar sesión para añadir productos.");
      return;
    }

    try {
      const data = await createProduct(formData, authToken); // 👈 se pasa token
      alert(`Producto "${data.name}" creado correctamente!`);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        image: null,
      });
    } catch (error) {
      console.error(error);
      alert("Error al crear producto faltan campos");
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5 pt-5 mb-5 body-background">
      <div className="card shadow mt-5 pt-5 mb-3">
        <h1 className="fs-3 text-center">Añadir Nuevo Producto</h1>

        <form className="bg-light pt-5"onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-4">
            <label className="form-label">Descripcion:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label">Precio:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="form-label justify-content-center">Cantidad:</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Image:</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
