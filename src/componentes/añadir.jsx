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
    try {
      const data = await createProduct(formData);
      alert(`Producto "${data.name}" creado correctamente!`);
      setFormData({ name: "", description: "",price: "",stock_quantity: "",  image: null });
    } catch (error) {
      console.error(error);
      alert("Error al crear producto");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Descripcion:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Precio:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Cantidad:</label>
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
  );
};

export default AddProductForm;
