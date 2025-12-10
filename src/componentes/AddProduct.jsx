import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const AddProductForm = () => {
  const { authToken } = useAuth();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock_quantity: 0,
    images: []
  });
  
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [createdProduct, setCreatedProduct] = useState(null);
  const [uploadedImages, setUploadedImages] = useState(null);

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

  {/* Crea el producto */}
  const createProductAxios = async (payload) => {
    const body = { ...payload, images: payload.images || [] };
    const { data } = await axios.post(`${API_BASE}/product`, body);
    return data;
  };
  
  {/* Sube las imágenes */}
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

  {/* Aplica PATCH para actualizar las imágenes del producto */}
  const patchProductImagesAxios = async (productId, imagesArr) => {
    const { data } = await axios.patch(`${API_BASE}/product/${productId}`, { images: imagesArr });
    return data;
  };

  {/* Aplica PATCH para actualizar el producto */}
  const patchProductAxios = async (productId, payload) => {
    const { data } = await axios.patch(`${API_BASE}/product/${productId}`, payload);
    return data;
  };

  {/* Maneja la creación y subida de imágenes */}
  const handleCreateAndUpload = async () => {
    setLoading(true);
    setStatus('Creando producto y subiendo imágenes...');
    setResult(null);
    try {
      // 1) Crear producto
      const created = await createProductAxios(form);
      setCreatedProduct(created);
      setStatus(`Producto creado. ID: ${created.id}`);

      // 2) Subir imágenes si existen
      let uploaded = null;
      if (files && files.length > 0) {
        setStatus('Subiendo imágenes...');
        uploaded = await uploadImagesAxios();
        setUploadedImages(uploaded);
        setStatus(`Imágenes subidas: ${Array.isArray(uploaded) ? uploaded.length : '??'}`);
      }

      // 3) Adjuntar imágenes al producto (PATCH) si se subieron
      if (uploaded && (Array.isArray(uploaded) ? uploaded.length > 0 : true)) {
        setStatus('Adjuntando imágenes al producto (PATCH)...');
        const updated = await patchProductImagesAxios(created.id, uploaded);
        setResult((r) => ({ ...r, created, uploaded, updated }));
        setStatus('Producto creado y actualizado con imágenes.');
      } else {
        setResult((r) => ({ ...r, created, uploaded }));
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error en Create+Upload: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePatchProduct = async () => {
    if (!createdProduct || !createdProduct.id) {
      setStatus('Primero crea o selecciona un producto para poder hacer PATCH.');
      return;
    }
    setLoading(true);
    setStatus('Aplicando PATCH al producto...');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        stock_quantity: form.stock_quantity
      };
      const updated = await patchProductAxios(createdProduct.id, payload);
      setResult((r) => ({ ...r, patched: updated }));
      setStatus('PATCH aplicado correctamente.');
    } catch (err) {
      console.error(err);
      setStatus(`Error aplicando PATCH: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ejecuta crear producto y subir imágenes en paralelo cuando sea posible,
  // luego adjunta las imágenes mediante PATCH. Muestra estado y usa setLoading durante todo el proceso.
  const handleAllInOne = async () => {
    // Ejecuta secuencial: primero crear producto, luego subir imágenes, luego PATCH imágenes
    // Requerir al menos 1 imagen
    if (!files || files.length === 0) {
      alert('Por favor sube al menos 1 imagen.');
      return;
    }

    setLoading(true);
    setStatus('Iniciando proceso completo...');
    setResult(null);
    try {
      // 1) Crear producto
      setStatus('Creando producto...');
      const created = await createProductAxios(form);
      setCreatedProduct(created);
      setStatus(`Producto creado. ID: ${created.id}`);

      // 2) Subir imágenes
      let uploaded = null;
      if (files && files.length > 0) {
        setStatus('Subiendo imágenes...');
        uploaded = await uploadImagesAxios();
        setUploadedImages(uploaded);
        setStatus(`Imágenes subidas: ${Array.isArray(uploaded) ? uploaded.length : '??'}`);
      }

      // 3) Adjuntar imágenes mediante PATCH (solo images[])
      if (uploaded && (Array.isArray(uploaded) ? uploaded.length > 0 : true)) {
        setStatus('Adjuntando imágenes al producto (PATCH)...');
        const updated = await patchProductImagesAxios(created.id, uploaded);
        setResult({ created, uploaded, updated });
        setStatus('Proceso completo: producto creado, imágenes subidas y adjuntas.');
      } else {
        setResult({ created, uploaded });
        setStatus('Proceso completo: producto creado (sin imágenes).');
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error en proceso completo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    setLoading(true);
    setStatus('Creando producto...');
    setResult(null);
    try {
      const created = await createProductAxios(form);
      setCreatedProduct(created);
      setStatus(`Producto creado. ID: ${created.id}`);
      setResult((r) => ({ ...r, created }));
    } catch (err) {
      console.error(err);
      setStatus(`Error creando producto: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async () => {
    if (!files || files.length === 0) {
      setStatus('No hay archivos seleccionados para subir.');
      return;
    }
    setLoading(true);
    setStatus('Subiendo imágenes...');
    try {
      const uploaded = await uploadImagesAxios();
      setUploadedImages(uploaded);
      setStatus(`Subida completada (${Array.isArray(uploaded) ? uploaded.length : '??'} imágenes)`);
      setResult((r) => ({ ...r, uploaded }));
    } catch (err) {
      console.error(err);
      setStatus(`Error subiendo imágenes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachImages = async () => {
    if (!createdProduct || !createdProduct.id) {
      setStatus('Primero crea el producto (botón Crear producto).');
      return;
    }
    if (!uploadedImages || (Array.isArray(uploadedImages) && uploadedImages.length === 0)) {
      setStatus('Primero sube imágenes (botón Subir imágenes).');
      return;
    }
    setLoading(true);
    setStatus('Aplicando PATCH para adjuntar imágenes al producto...');
    try {
      const updated = await patchProductImagesAxios(createdProduct.id, uploadedImages);
      setStatus('PATCH completado.');
      setResult((r) => ({ ...r, updated }));
    } catch (err) {
      console.error(err);
      setStatus(`Error en PATCH: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3" style={{ minHeight: '40vh' }}>
      <div className="card shadow" style={{ width: 900, height: 350 }}>
        <div className="card-body bg-white">
          <h3 className="card-title">Crear Producto</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2">

              <div className="col-12">
                {/* 'Comentario: Nombre del producto (obligatorio)' */}
                <label className="form-label">Nombre</label>
                <input name="name" value={form.name} onChange={onChange} className="form-control" />
              </div>

              <div className="col-12">
                {/* 'Comentario: Breve descripción para mostrar en la ficha del producto' */}
                <label className="form-label">Descripción</label>
                <textarea name="description" value={form.description} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-4">
                {/* 'Comentario: Precio en moneda local (sin símbolos)' */}
                <label className="form-label">Precio</label>
                <input type="number" name="price" value={form.price} onChange={onChange} className="form-control" />
              </div>

              <div className="col-md-4">
                {/* 'Comentario: Cantidad disponible en inventario' */}
                <label className="form-label">Stock</label>
                <input type="number" name="stock" value={form.stock_quantity ?? form.stock} onChange={onChange} className="form-control" />
              </div>

              <div className="col-12 col-md-6">
                {/* 'Comentario: Sube al menos 1 imagen (jpg, png). Tamaño recomendado ≤ 2MB' */}
                <label className="form-label">Imágenes (múltiples)</label>
                <input type="file" multiple accept="image/*" onChange={onFilesChange} className="form-control" />
                <div className="form-text mt-1">Imágenes seleccionadas: {files ? files.length : 0}</div>
                {(!files || files.length === 0) && (
                  <div className="form-text text-danger">Debes subir al menos 1 imagen para habilitar &quot;Subir Producto&quot;</div>
                )}
              </div>
            </div>

            <div className="mt-1 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-success"
                disabled={loading || !files || files.length === 0}
                onClick={handleAllInOne}
              >
                {loading ? 'Procesando...' : 'Subir Producto'}
              </button>
            </div>
          </form>

          <div className="mt-1">
            <strong>Estado:</strong> {status}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
