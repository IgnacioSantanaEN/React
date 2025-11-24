import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE;

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${AUTH_BASE}/user`);
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Error fetching users', err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Usuarios</h3>
        <div>
          <Link to="/signup" className="btn btn-primary">Agregar usuario</Link>
        </div>
      </div>

      {loading && <div>Cargando usuarios...</div>}
      {error && <div className="text-danger">Error: {JSON.stringify(error)}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={4}>No hay usuarios</td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id || u._id || u.email}>
                  <td>{u.name || u.nombre || '-'}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.role || '-'}</td>
                  <td>
                    <Link to={`/usuario/${u.id || u._id || u.email}`} className="btn btn-sm btn-outline-primary">Detalles</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
