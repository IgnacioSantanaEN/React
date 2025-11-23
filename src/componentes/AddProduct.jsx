import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const AddProductForm = () => {
  const { authToken } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 1000.0,
    stock_quantity: 0,
    image: []
  });
  
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name === 'stock' ? 'stock_quantity' : name]: name === 'price' || name === 'stock_quantity' || name === 'stock' ? Number(value) : value,
    }));
  };

  const onFilesChange = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  };

  const createProductAxios = async (payload) => {
    const body = { ...payload, image: payload.image || [] };
    const { data } = await axios.post(`${API_BASE}/product`, body);
    return data;
  };

  const uploadImagesAxios = async () => {
    const fd = new FormData();
    for (const f of files) {
      fd.append('content[]', f);
    }
    const { data } = await axios.post(`${API_BASE}/upload/image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  };

  const patchProductImagesAxios = async (productId, imagesArr) => {
    const { data } = await axios.patch(`${API_BASE}/product/${productId}`, { image: imagesArr });
    return data;
  };

  const handleSubmitAxios = async () => {
    setLoading(true);
    setStatus('Paso 1 (axios): creando producto...');
    setResult(null);
    try {
      const created = await createProductAxios(form);
      const productId = created.id;
      setStatus(`Paso 1 completo. ID: ${productId}. Paso 2 (axios): subiendo imágenes...`);

      const uploadedImages = await uploadImagesAxios();
      setStatus(`Paso 2 completo (${uploadedImages.length} imágenes). Paso 3 (axios): actualizando producto...`);

      const updated = await patchProductImagesAxios(productId, uploadedImages);
      setStatus('Proceso (axios) completado.');
      setResult({ created, uploadedImages, updated });
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow" style={{ width: 720 }}>
        <div className="card-body bg-white">
          <h3 className="card-title mb-3">Crear Producto</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nombre</label>
                <input name="name" value={form.name} onChange={onChange} className="form-control" />
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea name="description" value={form.description} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Precio</label>
                <input type="number" name="price" value={form.price} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-4">
                <label className="form-label">Stock</label>
                <input type="number" name="stock" value={form.stock_quantity ?? form.stock} onChange={onChange} className="form-control" />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Imágenes (múltiples)</label>
                <input type="file" multiple accept="image/*" onChange={onFilesChange} className="form-control" />
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end">
              <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSubmitAxios}>
                {loading ? 'Procesando...' : 'Enviar con Axios'}
              </button>
            </div>
          </form>

          <div className="mt-3">
            <strong>Estado:</strong> {status}
          </div>

          {result && (
            <div className="mt-3">
              <h5>Resultado</h5>
              <pre style={{ maxHeight: 220, overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
