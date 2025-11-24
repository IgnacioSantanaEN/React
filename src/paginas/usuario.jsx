import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE;

const Usuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: '' });

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${AUTH_BASE}/user/${id}`);
      const u = data?.data || data;
      setUser(u);
      setForm({ name: u.name || '', email: u.email || '', role: u.role || '' });
    } catch (err) {
      console.error('Error fetching user', err);
      setStatus('Error cargando usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setStatus('Guardando...');
    try {
      const { data } = await axios.patch(`${AUTH_BASE}/user/${id}`, form, { headers: { 'Content-Type': 'application/json' } });
      setUser(data?.data || data);
      setStatus('Guardado correctamente');
    } catch (err) {
      console.error('Error saving user', err);
      setStatus('Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) return;
    setStatus('Eliminando...');
    try {
      await axios.delete(`${AUTH_BASE}/user/${id}`);
      setStatus('Usuario eliminado');
      navigate('/usuarios');
    } catch (err) {
      console.error('Error deleting user', err);
      setStatus('Error al eliminar');
    }
  };

  if (loading) return <div className="container mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Detalle Usuario</h3>
        <div>
          <Link to="/usuarios" className="btn btn-secondary">Volver</Link>
        </div>
      </div>

      {status && <div className="mb-2">{status}</div>}

      {user ? (
        <div className="card p-3">
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input name="name" className="form-control" value={form.name} onChange={onChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input name="email" className="form-control" value={form.email} onChange={onChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <input name="role" className="form-control" value={form.role} onChange={onChange} />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
            <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
          </div>
        </div>
      ) : (
        <div>No se encontró el usuario.</div>
      )}
    </div>
  );
};

export default Usuario;
