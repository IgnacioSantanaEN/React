import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../api/product";
import { uploadImages } from "../api/image";
import { useAuth } from "../context/AuthContext";

const AddProductForm = () => {
  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // array of object URLs

  useEffect(() => {
    return () => {
      if (preview && Array.isArray(preview)) preview.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const fileArray = files ? Array.from(files) : [];
      setFormData((s) => ({ ...s, images: fileArray }));
      if (fileArray.length) {
        const urls = fileArray.map((f) => URL.createObjectURL(f));
        setPreview((prev) => {
          if (prev && Array.isArray(prev)) prev.forEach((u) => URL.revokeObjectURL(u));
          return urls;
        });
      } else {
        setPreview((prev) => {
          if (prev && Array.isArray(prev)) prev.forEach((u) => URL.revokeObjectURL(u));
          return null;
        });
      }
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("Debes iniciar sesión para añadir productos.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity, 10),
        images: [], // crear producto inicialmente con arreglo de imágenes vacío (campo plural)
      };

      const created = await createProduct(payload, authToken);
      const productId = created?.id || created?._id || created?.product_id;

      if (formData.images && formData.images.length && productId) {
        const uploadResp = await uploadImages(formData.images, authToken);
        console.log("uploadResp:", uploadResp);

        let imagesArray = [];
        if (Array.isArray(uploadResp)) {
          imagesArray = uploadResp.map((img) => (img.url ? { url: img.url, id: img.id } : img));
        } else if (uploadResp?.data && Array.isArray(uploadResp.data)) {
          imagesArray = uploadResp.data.map((img) => ({ url: img.url, id: img.id }));
        } else if (uploadResp?.url) {
          imagesArray = [{ url: uploadResp.url, id: uploadResp.id }];
        } else {
          imagesArray = [uploadResp];
        }

        const updatePayload = { images: imagesArray };
        await updateProduct(productId, updatePayload, authToken);
      }

      alert(`Producto "${created?.name || created?.id || 'creado'}" creado correctamente!`);
      setFormData({ name: "", description: "", price: "", stock_quantity: "", images: [] });
      if (preview && Array.isArray(preview)) preview.forEach((u) => URL.revokeObjectURL(u));
      setPreview(null);
    } catch (error) {
      console.error(error);
      alert("Error al crear producto. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center my-1">
      <div className="card shadow mt-0" style={{ width: "650px", maxHeight: "300vh", height: "500px" }}>
        <h1 className="text-center mb-2 mt-3 fs-3">Añadir Nuevo Producto</h1>

        <form className="bg-light mb-3 justify-content-center bg-light" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="name" className="form-label">Nombre:</label>
            <input type="text" className="form-control mb-2" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="form-label">Descripcion:</label>
            <textarea name="description" className="form-control mb-2" value={formData.description} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="price" className="form-label">Precio:</label>
            <input type="number" className="form-control mb-2" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="form-label">Cantidad:</label>
            <input type="number" className="form-control mb-3" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required />
          </div>

          <div>
            <label>Imágenes (opcional):</label>
            <input type="file" name="images" accept="image/*" onChange={handleChange} multiple />
            {preview && Array.isArray(preview) && (
              <div className="mt-2 d-flex gap-2">
                {preview.slice(0, 6).map((p, idx) => (
                  <img key={idx} src={p} alt={`preview-${idx}`} style={{ maxWidth: '120px', maxHeight: '120px' }} />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="mt-2 btn btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Añadir Producto'}</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
