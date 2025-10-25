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

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("description", formData.description);
    dataToSend.append("price", parseFloat(formData.price));
    dataToSend.append("stock_quantity", parseInt(formData.stock_quantity));
    if (formData.image) dataToSend.append("image", formData.image);
    
    try {
      for (let pair of dataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const data = await createProduct(dataToSend, authToken);
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
    <div className="d-flex justify-content-center mt-5 body-background">
      <div className="card shadow mt-5" style={{ width: "650px", maxHeight: "100vh"}}>
        <h1 className="text-center mb-2 mt-3 fs-3">Añadir Nuevo Producto</h1>

        <form className="bg-light mb-5 pt-0 justify-content-center bg-light"onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="name" className="form-label">Nombre:</label>
            <input
              type="text"
              className="form-control mb-2"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="form-label">Descripcion:</label>
            <textarea
              name="description"
              className="form-control mb-2"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="form-label">Precio:</label>
            <input
              type="number"
              className="form-control mb-2"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="form-label">Cantidad:</label>
            <input
              type="number"
              className="form-control mb-3"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Imagen:</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
          </div>

          <button type="submit" className="mt-2">Añadir Producto</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
