import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const UsuariosPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const { isAdmin, user } = useAuth();
  const currentId = user?.id ?? user?._id ?? user?.email;
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/user`);
        // XANO puede devolver array directo o { data: [...] }
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setUsers(list || []);
      } catch (err) {
        console.error('Error cargando usuarios:', err?.response?.data || err.message || err);
        setError('No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const deleteUser = async (u) => {
    const userId = u.id ?? u._id ?? u.email;
    if (!userId) return alert('ID de usuario no disponible');
    const currentId = user?.id ?? user?._id ?? user?.email;
    if (currentId && currentId === userId) {
      return alert('No puedes eliminar la cuenta con la que estás autenticado. Para eliminarla, primero inicia sesión con otra cuenta o contacta al administrador.');
    }
    if (!window.confirm(`Eliminar al usuario ${u.name || userId}? Esta acción es irreversible.`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/user/${userId}`);
      // Si la API devuelve 200/204 consideramos éxito
      if (res && (res.status === 200 || res.status === 204 || res.status === 201)) {
        setUsers((prev) => prev.filter(x => (x.id ?? x._id ?? x.email) !== userId));
        alert('Usuario eliminado');
      } else {
        console.warn('Respuesta inesperada al eliminar usuario:', res.status, res.data);
        alert('La API respondió inesperadamente al intentar eliminar el usuario. Revisa la consola.');
      }
    } catch (err) {
      console.error('Error eliminando usuario:', err?.response?.data || err.message || err);
      alert('No se pudo eliminar el usuario');
    }
  };

  if (loading) return <div className="container mt-5">Cargando usuarios...</div>;
  if (error) return <div className="container mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Usuarios</h3>
        {isAdmin && (
          <Link to="/signup" className="btn btn-success">
            Agregar usuario
          </Link>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              {isAdmin && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id || u._id || u.email}>
                <td>{u.id ?? u._id ?? '—'}</td>
                <td>{u.name ?? u.full_name ?? u.username ?? '—'}</td>
                <td>{u.email ?? '—'}</td>
                <td>{u.role ?? '—'}</td>
                {isAdmin && (
                  <td>
                    {currentId !== (u.id ?? u._id ?? u.email) ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteUser(u)}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;
