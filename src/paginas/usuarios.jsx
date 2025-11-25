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
  const [query, setQuery] = useState('');
  const q = (query || '').trim().toLowerCase();
  const filtered = q
    ? users.filter((u) => {
        const name = String(u.name || u.full_name || u.username || '').toLowerCase();
        return name.includes(q);
      })
    : users;
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

  // When editing changes, populate form
  React.useEffect(() => {
    if (editing) {
      setEditForm({
        name: editing.name ?? editing.full_name ?? editing.username ?? '',
        email: editing.email ?? '',
        role: editing.role ?? 'cliente',
        // backend uses `status` with values like 'unlocked' / 'locked'
        status: editing.status ?? (editing.blocked ? 'locked' : 'unlocked'),
        id: editing.id ?? editing._id ?? editing.email,
      });
    }
  }, [editing]);

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

  const toggleBlocked = async (u) => {
    const userId = u.id ?? u._id ?? u.email;
    if (!userId) return alert('ID de usuario no disponible');
    const willLock = (u.status ?? (u.blocked ? 'locked' : 'unlocked')) !== 'locked';
    if (!window.confirm(`${u.name || userId} será ${willLock ? 'bloqueado' : 'desbloqueado'}. Continuar?`)) return;
    try {
      const payload = { status: willLock ? 'locked' : 'unlocked' };
      const res = await axios.patch(`${API_BASE}/user/${userId}`, payload);
      if (res && (res.status === 200 || res.status === 204 || res.status === 201)) {
        setUsers((prev) => prev.map(x => ((x.id ?? x._id ?? x.email) === userId ? { ...x, ...payload } : x)));
        alert(`Usuario ${willLock ? 'bloqueado' : 'desbloqueado'}`);
      } else {
        console.warn('Respuesta inesperada al toggle status:', res.status, res.data);
        alert('Error al cambiar estado de bloqueo');
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('No se pudo cambiar el estado de bloqueo');
    }
  };

  const saveEdit = async (updated) => {
    const userId = updated.id ?? updated._id ?? updated.email;
    if (!userId) return alert('ID de usuario no disponible');
    try {
      // Intentamos PATCH; si la API no lo soporta, el catch mostrará el error
      const payload = { name: updated.name, email: updated.email, role: updated.role, status: updated.status ?? (updated.blocked ? 'locked' : 'unlocked') };
      const res = await axios.patch(`${API_BASE}/user/${userId}`, payload);
      if (res && (res.status === 200 || res.status === 204 || res.status === 201)) {
        setUsers((prev) => prev.map((u) => ((u.id ?? u._id ?? u.email) === userId ? { ...u, ...payload } : u)));
        setShowModal(false);
        setEditing(null);
        alert('Usuario actualizado');
      } else {
        console.warn('Respuesta inesperada al actualizar usuario:', res.status, res.data);
        alert('La API respondió inesperadamente. Revisa la consola.');
      }
    } catch (err) {
      console.error('Error actualizando usuario:', err?.response?.data || err.message || err);
      alert('No se pudo actualizar el usuario. Revisa la consola para más detalles.');
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
      {/* Edit modal */}
      {showModal && editing && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div className="card" style={{ width: '100%', maxWidth: 560 }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Editar usuario</strong>
              <button className="btn btn-sm btn-light" onClick={() => { setShowModal(false); setEditing(null); }}>Cerrar</button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={editForm.email} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <select className="form-select" value={editForm.role} onChange={(e) => setEditForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="mb-3 form-check">
                <input className="form-check-input" type="checkbox" checked={!!editForm.blocked} id="blockedCheck" onChange={(e) => setEditForm(f => ({ ...f, blocked: e.target.checked }))} />
                <label className="form-check-label" htmlFor="blockedCheck">Bloqueado</label>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button className="btn btn-secondary me-2" onClick={() => { setShowModal(false); setEditing(null); }}>Cancelar</button>
              <button className="btn" style={{ backgroundColor: '#ff8c00', color: '#fff', borderColor: '#ff8c00' }} onClick={() => saveEdit(editForm)}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="input-group" style={{ maxWidth: 640 }}>
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn"
            type="button"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
            style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#ced4da' }}
          >
            Limpiar
          </button>
          {isAdmin && (
            <button
              className="btn ms-2"
              type="button"
              onClick={() => setEditMode((s) => !s)}
              aria-pressed={editMode}
              style={{ backgroundColor: editMode ? '#ff4500' : '#ff8c00', color: '#ffffff', borderColor: '#ff8c00' }}
            >
              {editMode ? 'Salir edición' : 'Editar usuarios'}
            </button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        {users.length === 0 ? (
          <p className="text-muted">No hay usuarios registrados aún.</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted">No hay usuarios que coincidan con la búsqueda.</p>
        ) : (
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
              {filtered.map((u) => (
                <tr key={u.id || u._id || u.email}>
                  <td>{u.id ?? u._id ?? '—'}</td>
                  <td>{u.name ?? u.full_name ?? u.username ?? '—'}</td>
                  <td>{u.email ?? '—'}</td>
                  <td>{u.role ?? '—'}</td>
                  <td>{(u.status ?? (u.blocked ? 'locked' : 'unlocked')) === 'locked' ? <span className="badge bg-danger">Bloqueado</span> : <span className="badge bg-success">Activo</span>}</td>
                  {isAdmin && (
                    <td>
                      <div className="d-flex gap-2">
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
                        {editMode && (
                          <>
                            <button
                              className="btn btn-sm"
                              onClick={() => { setEditing(u); setShowModal(true); }}
                              style={{ backgroundColor: '#ff8c00', color: '#fff', borderColor: '#ff8c00' }}
                            >
                              Editar
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleBlocked(u)}>
                              {(u.status ?? (u.blocked ? 'locked' : 'unlocked')) === 'locked' ? 'Desbloquear' : 'Bloquear'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
