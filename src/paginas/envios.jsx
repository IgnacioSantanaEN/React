import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Sin autenticación en esta página (GET público y acciones mostradas siempre)

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const EnviosPage = () => {
  // No se requiere auth en el frontend para esta página según indicación
  // la responsabilidad de acceso queda fuera de este componente
  const navigate = null;
  const authToken = null;
  const user = null;
  const isAdmin = null;

  const [loading, setLoading] = useState(true);
  const [envios, setEnvios] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // GET público: el endpoint /envio es accesible públicamente
        const res = await axios.get(`${API_BASE}/envio`);
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        // Mostrar todos los envíos (la página será accesible sólo para admins en el despliegue)
        setEnvios(list || []);
      } catch (err) {
        console.error('Error cargando envios:', err);
        setEnvios([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  
  const acceptEnvio = async (envioId) => {
    if (!envioId) return;
    if (!window.confirm('Aceptar este envío y marcar como "En Camino"?')) return;
    try {
      const body = { status: 'En Camino' };
      const res = await axios.patch(`${API_BASE}/envio/${envioId}`, body);
      if (res && (res.status === 200 || res.status === 201 || res.status === 204)) {
        setEnvios((prev) => prev.map(e => (e.id === envioId || e._id === envioId ? { ...e, ...body } : e)));
        alert('Envío aceptado (status actualizado)');
      } else {
        alert('Respuesta inesperada al actualizar envío');
      }
    } catch (err) {
      console.error('Error actualizando envio:', err?.response || err.message || err);
      const srv = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || String(err));
      alert('No se pudo aceptar el envío\n' + srv);
    }
  };

  const rejectEnvio = async (envioId) => {
    if (!envioId) return;
    if (!window.confirm('Marcar este envío como En Espera?')) return;
    try {
      const body = { status: 'En Espera' };
      const res = await axios.patch(`${API_BASE}/envio/${envioId}`, body);
      if (res && (res.status === 200 || res.status === 201 || res.status === 204)) {
        setEnvios((prev) => prev.map(e => (e.id === envioId || e._id === envioId ? { ...e, ...body } : e)));
        alert('Envío marcado como en espera');
      } else {
        alert('Respuesta inesperada al actualizar envío');
      }
    } catch (err) {
      console.error('Error marcando envio como en espera:', err?.response || err.message || err);
      const srv = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || String(err));
      alert('No se pudo actualizar el envío\n' + srv);
    }
  };

  // Nota: la creación de envíos se realiza ahora en dos pasos desde la UI:
  // 1) Crear la compra (ej. desde la página de pago)
  // 2) Crear el envío usando el ID de la compra (desde la API o un flujo separado)

  if (loading) return <div className="container mt-5">Cargando envíos...</div>;

  return (
    <div className="container mt-5">
      <h3>Envíos</h3>

      <div className="mb-4">
        {envios.length === 0 ? (
          <p className="text-muted mt-3">No hay envíos registrados.</p>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Compra</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {envios.map((e) => (
                  <tr key={e.id || e._id}>
                    <td>{e.id || e._id || '—'}</td>
                    <td>{e.compra ?? e.order ?? '—'}</td>
                    <td>{e.status ?? '—'}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => acceptEnvio(e.id || e._id)}>Aceptar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => rejectEnvio(e.id || e._id)}>Rechazar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnviosPage;
