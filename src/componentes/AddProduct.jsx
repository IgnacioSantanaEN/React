import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9";

const AddProductForm = () => {
  const [form, setForm] = useState({ name: "", description: "", price: 0 });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "price" ? Number(value) : value }));
  };

  const onFilesChange = (e) => setFiles(Array.from(e.target.files || []));

  const postProduct = (payload) => axios.post(`${API_BASE}/product`, payload).then((r) => r.data);
  const postImages = (fileList) => {
    const fd = new FormData();
    fileList.forEach((f) => fd.append("content[]", f));
    return axios.post(`${API_BASE}/upload/image`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
  };
  const patchProductImages = (id, images) => axios.patch(`${API_BASE}/product/${id}`, { images }).then((r) => r.data);

  const handleSubmit = async () => {
    if (!files.length) return setStatus("Selecciona al menos 1 imagen.");
    setLoading(true);
    setStatus("Creando producto...");
    try {
      const created = await postProduct({ ...form, images: [] });
      setStatus("Subiendo imágenes...");
      const uploaded = await postImages(files);
      const imagesArr = Array.isArray(uploaded) ? uploaded : [];
      setStatus("Adjuntando imágenes al producto...");
      await patchProductImages(created.id, imagesArr);
      setStatus("Producto creado y con imágenes.");
    } catch (err) {
      console.error(err);
      setStatus(err?.message || "Error al crear producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3" style={{ minHeight: "40vh" }}>
      <div className="card shadow" style={{ width: 900, height: 350 }}>
        <div className="card-body bg-white">
          <h3 className="card-title">Crear Producto</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-2">
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
              <div className="col-12 col-md-6">
                <label className="form-label">Imágenes (múltiples)</label>
                <input type="file" multiple accept="image/*" onChange={onFilesChange} className="form-control" />
                <div className="form-text mt-1">Imágenes seleccionadas: {files.length}</div>
                {!files.length && <div className="form-text text-danger">Debes subir al menos 1 imagen para habilitar "Subir Producto"</div>}
              </div>
            </div>
            <div className="mt-1 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-success" disabled={loading || !files.length} onClick={handleSubmit}>
                {loading ? "Procesando..." : "Subir Producto"}
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
