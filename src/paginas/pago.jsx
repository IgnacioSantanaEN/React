import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const PagoPage = () => {
  const navigate = useNavigate();
  const { authToken, user } = useAuth();
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  const getLoggedUserId = () => {
    // Prefer AuthContext user, fallback to localStorage 'user' if present
    const ctxId = user?.id || user?._id || null;
    if (ctxId) return ctxId;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || null;
      }
    } catch (e) {
      // ignore parse errors
    }
    return null;
  };

  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [compraResult, setCompraResult] = useState(null);
  const [detallesResult, setDetallesResult] = useState(null);
  const [creatingCompra, setCreatingCompra] = useState(false);
  const [creatingDetalles, setCreatingDetalles] = useState(false);
  const [creatingEnvio, setCreatingEnvio] = useState(false);
  const [envioResult, setEnvioResult] = useState(null);
  

  useEffect(() => {
    const load = async () => {
      if (!sessionId) { setLoading(false); return; }
      try {
        setLoading(true);
        const detailsRes = await axios.get(`${API_BASE}/cart_detail?session_id=${sessionId}`);
        const details = Array.isArray(detailsRes.data) ? detailsRes.data : (detailsRes.data?.data || []);

        // para cada detalle, obtener info del producto (si es necesario)
        const enriched = await Promise.all(details.map(async (d) => {
          let productData = null;
          let productId = null;

          if (d && typeof d.product === 'object' && d.product !== null && (d.product.name || d.product.price)) {
            productData = d.product;
          } else {
            productId = d.product ?? d.product_id ?? d.productId ?? (d.product && (d.product.id || d.product._id));
          }

          // Si no tenemos productData pero sí un productId, intentar obtenerlo del endpoint
          if (!productData && productId) {
            try {
              const p = await axios.get(`${API_BASE}/product/${productId}`);
              // Normalizar respuesta: algunos endpoints devuelven { data: {...} }
              productData = p.data?.data ?? p.data ?? null;
            } catch (e) {
              console.warn('No se pudo obtener product data for', productId, e);
            }
          }

          // Por si el detalle contiene campos directos de precio/nombre (fallbacks)
          if (!productData) {
            const fallbackName = d.product_name || d.name || d.title || null;
            const fallbackPrice = d.product_price ?? d.price ?? d.unit_price ?? null;
            if (fallbackName || fallbackPrice != null) {
              productData = { name: fallbackName, price: fallbackPrice };
            }
          }

          return { ...d, productData };
        }));

        setLines(enriched);
      } catch (err) {
        console.error('Error cargando carrito o detalles:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const updateQty = async (lineId, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.patch(`${API_BASE}/cart_detail/${lineId}`, { quantity: newQty });
      setLines((prev) => prev.map(l => l.id === lineId ? { ...l, quantity: newQty } : l));
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
      alert('No se pudo actualizar la cantidad');
    }
  };

  const removeLine = async (lineId) => {
    if (!window.confirm('Eliminar este producto del carrito?')) return;
    try {
      await axios.delete(`${API_BASE}/cart_detail/${lineId}`);
      setLines((prev) => prev.filter(l => l.id !== lineId));
    } catch (err) {
      console.error('Error eliminando linea:', err);
      alert('No se pudo eliminar la línea');
    }
  };

  const handlePagar = async () => {
    if (!authToken && !user) {
      alert('Debes iniciar sesión para completar la compra. Serás redirigido al login.');
      navigate('/login', { state: { from: '/pago' } });
      return;
    }

    // Intentar obtener estado actualizado del usuario desde el servidor (por si fue bloqueado desde otra sesión)
    let freshUser = user;
    try {
      const uid = user?.id || user?._id || getLoggedUserId();
      if (uid) {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const ures = await axios.get(`${API_BASE}/user/${uid}`, { headers });
        freshUser = ures.data?.data ?? ures.data ?? freshUser;
      }
    } catch (e) {
      // no fatal — usamos el user local
      console.warn('No se pudo obtener estado actualizado del usuario:', e?.response || e?.message || e);
    }

    // Si el usuario está bloqueado, impedir el pago
    if (freshUser && (freshUser.status === 'locked' || freshUser.blocked)) {
      alert('Usted no esta autorizado para comprar en este sitio');
      return;
    }

    if (!sessionId) { alert('No hay carrito para procesar'); return; }
    if (!window.confirm('Confirmar compra?')) return;
    try {
      setSaving(true);

      // 1) Registrar la compra en el endpoint /compra y obtener su id
      let compraRecord = null;
      try {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        // total: send the cart total (two decimals), status: 'pendiente', user: authenticated user id
        const purchaseBody = {
          total: parseFloat(Number(total).toFixed(2)),
          status: 'pendiente',
          user: user?.id || user?._id || null,
          session_id: sessionId || null,
        };
        console.log('POST /compra body:', purchaseBody);
        const cre = await axios.post(`${API_BASE}/compra`, purchaseBody, { headers });
        compraRecord = cre.data?.data ?? cre.data ?? cre;
      } catch (purchaseErr) {
        console.error('Error creando registro de compra:', purchaseErr?.response || purchaseErr?.message || purchaseErr);
        const srv = purchaseErr?.response?.data ? JSON.stringify(purchaseErr.response.data) : (purchaseErr?.message || String(purchaseErr));
        throw new Error('Error POST /compra: ' + srv);
      }

      const compraId = compraRecord?.id || compraRecord?._id || compraRecord?.compra || null;
      if (!compraId) {
        throw new Error('No se obtuvo id de compra tras POST /compra');
      }

      // 2) detalle_venta eliminado: crear registro de envio (si aplica)
      try {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const envioBody = { compra: compraId, user: getLoggedUserId(), status: 'compra' };
        console.log('POST /envio body (desde pagar):', envioBody);
        try {
          const eres = await axios.post(`${API_BASE}/envio`, envioBody, { headers });
          console.log('POST /envio OK (desde pagar):', eres?.data);
          setEnvioResult(eres.data?.data ?? eres.data ?? eres);
        } catch (envErr) {
          console.warn('No se pudo crear envio tras compra:', envErr?.response || envErr?.message || envErr);
        }
      } catch (eEnv) {
        console.warn('Error procesando envio tras compra:', eEnv?.response || eEnv?.message || eEnv);
      }

      // 3) (Removed) envio table no longer exists in backend — skip creating envio record

      // 4) Ahora eliminamos los cart_detail asociados al cartId (solo después de crear compra, detalles y envio)
      try {
        await Promise.all(lines.map(async (l) => {
          if (!l?.id) return;
          try {
            await axios.delete(`${API_BASE}/cart_detail/${l.id}`);
          } catch (ee) {
            console.warn('No se pudo borrar cart_detail', l.id, ee?.response || ee?.message || ee);
          }
        }));
      } catch (delErr) {
        console.warn('Error borrando detalles del carrito:', delErr);
      }

        // Después de completar la compra eliminamos el sessionId local para que
        // Xano genere una nueva sesión en la próxima interacción anónima.
        try {
          localStorage.removeItem('sessionId');
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (createErr) {
          console.error('No se pudo limpiar sessionId tras pagar:', createErr);
        }

      alert('Compra realizada');
      navigate('/');
      } catch (err) {
      console.error('Error al finalizar compra:', err);
      // err puede ser Error lanzado arriba con mensaje ya serializado o un axios error
      const status = err?.response?.status;
      const resp = err?.response?.data;
      const serverMsg = err?.message || (resp ? JSON.stringify(resp) : (err?.toString ? err.toString() : ''));
      console.error('Status:', status, 'Response:', resp);
      alert('No se pudo completar la compra' + (status ? ` (status ${status})` : '') + '\n' + serverMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCompra = async () => {
    if (!authToken || !user) { alert('Debes iniciar sesión (auth)'); navigate('/login'); return; }
    // Evitar que usuarios bloqueados creen compras de prueba
    // verificar estado más reciente en servidor
    try {
      const uid = user?.id || user?._id || getLoggedUserId();
      if (uid) {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const ures = await axios.get(`${API_BASE}/user/${uid}`, { headers });
        const fresh = ures.data?.data ?? ures.data ?? null;
        if (fresh && (fresh.status === 'locked' || fresh.blocked)) {
          alert('Usted no esta autorizado para comprar en este sitio');
          return;
        }
      }
    } catch (e) {
      console.warn('No se pudo verificar estado del usuario antes de crear compra:', e?.response || e?.message || e);
    }
    try {
      setCreatingCompra(true);
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const body = { total: parseFloat(Number(total).toFixed(2)), status: 'pendiente', user: user?.id || user?._id || null };
      const res = await axios.post(`${API_BASE}/compra`, body, { headers });
      const model = res.data?.data ?? res.data ?? res;
      setCompraResult(model);
      try {
        alert('POST /compra OK\n' + JSON.stringify(model, null, 2));
      } catch (e) {
        alert('POST /compra OK');
      }
    } catch (err) {
      console.error('Error POST /compra:', err?.response || err?.message || err);
      const serverMsg = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || String(err));
      alert('Error en POST /compra - revisa consola\n' + serverMsg);
    } finally {
      setCreatingCompra(false);
    }
  };

  const handleCreateDetalles = async () => {
    // El endpoint /detalle_venta fue removido en la base de datos.
    // Ahora la tabla disponible es `envio`. Usa el botón "Crear envío" o "Pagar" para crear la compra y el envío.
    alert('El endpoint /detalle_venta ya no existe. Usa "Crear envío" o "Pagar" para procesar la compra.');
  };

  const handleCreateEnvio = async () => {
    const compraId = compraResult?.id;
    if (!compraId) {
      alert('Primero crea una compra con POST /compra (usa el botón correspondiente)');
      return;
    }
    try {
      setCreatingEnvio(true);
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      const body = { compra: compraId, status: 'compra', user: getLoggedUserId() };
      const res = await axios.post(`${API_BASE}/envio`, body, { headers });
      const model = res.data?.data ?? res.data ?? res;
      setEnvioResult(model);
      try {
        alert('POST /envio OK\n' + JSON.stringify(model, null, 2));
      } catch (e) {
        alert('POST /envio OK');
      }
    } catch (err) {
      console.error('Error POST /envio:', err?.response || err?.message || err);
      alert('Error en POST /envio - revisa consola');
    } finally {
      setCreatingEnvio(false);
    }
  };

  const total = lines.reduce((s, l) => {
    const price = l.productData?.price || l.price || 0;
    const qty = Number(l.quantity) || 0;
    return s + price * qty;
  }, 0);

  const totalItems = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);

  if (loading) return <div className="container mt-5 pt-5">Cargando carrito...</div>;

  return (
    <div className="container mt-5 pt-5">
      <h3>Informacion del carrito</h3>
      {sessionId && <div className="mb-2">Total unidades: <strong>{totalItems}</strong> — Productos distintos: <strong>{lines.length}</strong></div>}
      {!sessionId && <p>No hay carrito activo. Crea uno primero desde Productos.</p>}

      {sessionId && (
        <>
          {/* Estado del carrito: el backend no expone metadata `cart` en este proyecto */}

          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => {
                const prod = l.productData;
                const price = prod?.price || l.price || 0;
                const qty = Number(l.quantity) || 0;
                return (
                  <tr key={l.id}>
                    <td>{prod?.name || `ID: ${l.product}`}</td>
                    <td>{Math.round(price)}</td>
                    <td>
                      <div style={{ width: 80 }}>{qty}</div>
                    </td>
                    <td style={{ background: '#f8f9fa' }}>{Math.round(price * qty)}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => removeLine(l.id)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="p-3 rounded" style={{ background: '#0d6efd', color: '#fff', fontWeight: 600 }}>
              Total: {Math.round(total)}
            </div>

            <div className="d-flex gap-2 align-items-center">
              <button className="btn btn-outline-primary" onClick={handleCreateCompra} disabled={creatingCompra}>{creatingCompra ? 'Creando...' : 'Crear /compra'}</button>
              <button className="btn btn-light" onClick={handleCreateEnvio}>{creatingEnvio ? 'Creando...' : 'Crear envío'}</button>
              <button className="btn btn-success" disabled={saving} onClick={handlePagar}>{saving ? 'Procesando...' : 'Pagar'}</button>
            </div>
          </div>

          <div className="mt-2">
            {compraResult && <small className="text-muted">Compra creada ID: {compraResult.id || compraResult._id || '—'}</small>}
            {detallesResult && <div><small className="text-muted">Detalles creados: {Array.isArray(detallesResult) ? detallesResult.length : '—'}</small></div>}
            {/* envio table removed from backend; no envioResult shown */}
          </div>
        </>
      )}
    </div>
  );
};

export default PagoPage;
