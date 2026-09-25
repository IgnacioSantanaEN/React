import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductImages,
  updateProductImages,
} from "../api/product";

const AddProductForm = () => {
  const { authToken } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = Boolean(editId);
  const [form, setForm] = useState({ name: "", description: "", price: 0, stock: 0, is_available: true, images: [] });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [errorLog, setErrorLog] = useState("");

  useEffect(() => {
    if (!editId) return;

    setLoading(true);
    getProductById(editId)
      .then((product) => {
        setForm({
          name: product?.name || "",
          description: product?.description || "",
          price: Number(product?.price) || 0,
          stock: Number(product?.stock) || 0,
          is_available: product?.is_available !== false,
          images: Array.isArray(product?.images) ? product.images : [],
        });
      })
      .catch((err) => {
        console.error(err);
        setStatus("No se pudo cargar el producto.");
        setErrorLog(JSON.stringify(err?.response?.data || err?.message, null, 2));
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: ["price", "stock"].includes(name) ? Number(value) : value }));
  };

  const toggleAvailability = () => {
    setForm((previous) => ({ ...previous, is_available: !previous.is_available }));
  };

  const onFilesChange = (e) => setFiles(Array.from(e.target.files || []));

  const handleSubmit = async () => {
    if (!isEditing && !files.length) return setStatus("Selecciona al menos 1 imagen.");
    setLoading(true);
    setStatus(isEditing ? "Actualizando producto..." : "Creando producto...");
    setErrorLog("");
    try {
      const productPayload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        is_available: form.is_available,
        images: form.images,
      };
      console.log("Payload de producto:", productPayload);
      if (isEditing) {
        await updateProduct(editId, productPayload, authToken);
        if (files.length) {
          setStatus("Subiendo nuevas imágenes...");
          const uploaded = await uploadProductImages(files);
          const imagesArr = Array.isArray(uploaded) ? uploaded : [uploaded];
          await updateProductImages(editId, { ...productPayload, images: imagesArr }, authToken);
        }
        setStatus("Producto actualizado correctamente.");
      } else {
        const created = await createProduct({ ...productPayload, images: [] }, authToken);
        setStatus("Subiendo imágenes...");
        const uploaded = await uploadProductImages(files);
        const imagesArr = Array.isArray(uploaded) ? uploaded : [uploaded];
        setStatus("Adjuntando imágenes al producto...");
        await updateProductImages(created.id, { ...productPayload, images: imagesArr }, authToken);
        setStatus("Producto creado y con imágenes.");
      }
    } catch (err) {
      console.error(err);
      const errorDetails = {
        message: err?.message,
        status: err?.response?.status,
        response: err?.response?.data,
        stack: err?.stack,
      };
      setErrorLog(JSON.stringify(errorDetails, null, 2));
      setStatus(err?.message || "Error al crear producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3" style={{ minHeight: "40vh" }}>
      <div className="card shadow" style={{ width: 900, height: 350 }}>
        <div className="card-body bg-white">
          <h3 className="card-title">{isEditing ? "Editar Producto" : "Crear Producto"}</h3>
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
              <div className="col-md-4">
                <label className="form-label">Cantidad de stock</label>
                <input type="number" name="stock" min="0" value={form.stock} onChange={onChange} className="form-control" />
              </div>
              <div className="col-md-4">
                <label className="form-label d-block">Estado del producto</label>
                <button
                  type="button"
                  className={`btn ${form.is_available ? "btn-success" : "btn-danger"}`}
                  onClick={toggleAvailability}
                  aria-pressed={form.is_available}
                >
                  {form.is_available ? "Hay stock" : "No hay stock"}
                </button>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Imágenes (múltiples)</label>
                <input type="file" multiple accept="image/*" onChange={onFilesChange} className="form-control" />
                <div className="form-text mt-1">Imágenes seleccionadas: {files.length}</div>
                {!files.length && <div className="form-text text-danger">Debes subir al menos 1 imagen para habilitar "Subir Producto"</div>}
              </div>
            </div>
            <div className="mt-1 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-success" disabled={loading} onClick={handleSubmit}>
                {loading ? "Procesando..." : "Subir Producto"}
              </button>
            </div>
          </form>
          <div className="mt-1">
            <strong>Estado:</strong> {status}
          </div>
          {errorLog && (
            <div className="mt-2">
              <strong className="text-danger">Log de error:</strong>
              <pre className="mt-1 p-2 bg-dark text-light rounded" style={{ maxHeight: 180, overflow: "auto", whiteSpace: "pre-wrap" }}>
                {errorLog}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
