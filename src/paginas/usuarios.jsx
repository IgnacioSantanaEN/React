import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const UsuariosPage = () => {
  // Helpers
  const getUserId = (u) => u?.id ?? u?.user_id ?? u?._id ?? u?.email;
  const getStatus = (u) => (u?.status ?? (u?.blocked ? 'locked' : 'unlocked'));
  const isOk = (res) => !!res && (res.status === 200 || res.status === 201 || res.status === 204);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const { isAdmin, user, authToken, login, logout } = useAuth();
  const currentId = getUserId(user);
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
        status: getStatus(editing),
        id: getUserId(editing),
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
    const userId = getUserId(u);
    if (!userId) {
      console.warn('ID de usuario no disponible');
      return;
    }
    if (currentId && currentId === userId) {
      console.warn('Intento de eliminar la cuenta autenticada bloqueado.');
      return;
    }
    if (!window.confirm(`Eliminar al usuario ${u.name || userId}? Esta acción es irreversible.`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/user/${userId}`);
      // Si la API devuelve 200/204 consideramos éxito
      if (isOk(res)) {
        setUsers((prev) => prev.filter(x => getUserId(x) !== userId));
        console.info('Usuario eliminado');
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
    const userId = getUserId(u);
    if (!userId) {
      console.warn('ID de usuario no disponible');
      return;
    }
    const willLock = getStatus(u) !== 'locked';
    if (!window.confirm(`${u.name || userId} será ${willLock ? 'bloqueado' : 'desbloqueado'}. Continuar?`)) return;
    try {
      // Xano endpoint may require certain fields (e.g. name/email/role) when patching.
      // Send a minimal full payload to avoid "Missing param: name" errors.
      const payload = {
        name: u.name ?? u.full_name ?? u.username ?? '',
        email: u.email ?? '',
        role: u.role ?? 'cliente',
        status: willLock ? 'locked' : 'unlocked',
      };
      const res = await axios.patch(`${API_BASE}/user/${userId}`, payload);
      if (isOk(res)) {
        setUsers((prev) => prev.map(x => (getUserId(x) === userId ? { ...x, ...payload } : x)));
        console.info(`Usuario ${willLock ? 'bloqueado' : 'desbloqueado'}`);
        // Si el usuario modificado es el actualmente autenticado, actualizar el contexto
        try {
          if (currentId && String(currentId) === String(userId)) {
            // Si lo bloqueamos, forzamos logout para evitar acciones adicionales
            if (payload.status === 'locked') {
              alert('Tu cuenta ha sido bloqueada. Se cerrará la sesión por seguridad.');
              if (typeof logout === 'function') logout();
            } else {
              // Si lo desbloqueamos, actualizamos el user en el contexto para reflejar el cambio
              if (typeof login === 'function') {
                // mantener el mismo token pero actualizar el objeto user
                login(authToken, { ...user, ...payload });
              } else {
                // como fallback, actualizar localStorage directamente
                try { localStorage.setItem('user', JSON.stringify({ ...user, ...payload })); } catch(e){}
              }
            }
          }
        } catch (ctxErr) {
          console.warn('No se pudo sincronizar el contexto de auth tras toggleBlocked:', ctxErr);
        }
      } else {
        console.warn('Respuesta inesperada al toggle status:', res.status, res.data);
        alert('Error al cambiar estado de bloqueo: ' + (res?.data ? JSON.stringify(res.data) : res.status));
      }
    } catch (err) {
      console.error('Error toggling status:', err?.response || err.message || err);
      const serverMsg = err?.response?.data ? JSON.stringify(err.response.data) : err.message || String(err);
      alert('No se pudo cambiar el estado de bloqueo. Respuesta del servidor: ' + serverMsg);
    }
  };

  // (Se usa `toggleBlocked` para alternar bloqueado/desbloqueado)

  const saveEdit = async (updated) => {
    const userId = getUserId(updated);
    if (!userId) {
      console.warn('ID de usuario no disponible');
      return;
    }
    try {
      // Intentamos PATCH; si la API no lo soporta, el catch mostrará el error
      const payload = { name: updated.name, email: updated.email, role: updated.role, status: updated.status ?? (updated.blocked ? 'locked' : 'unlocked') };
      const res = await axios.patch(`${API_BASE}/user/${userId}`, payload);
      if (isOk(res)) {
        setUsers((prev) => prev.map((u) => (getUserId(u) === userId ? { ...u, ...payload } : u)));
        setShowModal(false);
        setEditing(null);
        console.info('Usuario actualizado');
      } else {
        console.warn('Respuesta inesperada al actualizar usuario:', res.status, res.data);
        alert('La API respondió inesperadamente. Revisa la consola.');
      }
    } catch (err) {
      console.error('Error actualizando usuario:', err?.response?.data || err.message || err);
      console.error('No se pudo actualizar el usuario. Revisa la consola para más detalles.');
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
              <div className="mb-3">
                <label className="form-label">Estado</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      id="statusUnlocked"
                      value="unlocked"
                      checked={editForm.status === 'unlocked'}
                      onChange={() => setEditForm(f => ({ ...f, status: 'unlocked', blocked: false }))}
                    />
                    <label className="form-check-label" htmlFor="statusUnlocked">Activo</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      id="statusLocked"
                      value="locked"
                      checked={editForm.status === 'locked'}
                      onChange={() => setEditForm(f => ({ ...f, status: 'locked', blocked: true }))}
                    />
                    <label className="form-check-label" htmlFor="statusLocked">Bloqueado</label>
                  </div>
                </div>
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
                <th>Estado</th>
                {isAdmin && editMode && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={getUserId(u) || u.email}>
                  <td>{getUserId(u) ?? '—'}</td>
                  <td>{u.name ?? u.full_name ?? u.username ?? '—'}</td>
                  <td>{u.email ?? '—'}</td>
                  <td>{u.role ?? '—'}</td>
                  <td>{getStatus(u) === 'locked' ? <span className="badge bg-danger">Bloqueado</span> : <span className="badge bg-success">Activo</span>}</td>
                  {isAdmin && editMode && (
                    <td>
                      <div className="d-flex gap-2">
                        {currentId !== getUserId(u) ? (
                          <>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteUser(u)}
                            >
                              Eliminar
                            </button>
                          </>
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
                              {getStatus(u) === 'locked' ? 'Desbloquear' : 'Bloquear'}
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
