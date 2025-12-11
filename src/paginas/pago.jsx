import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../componentes/Notification';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const PagoPage = () => {
  const navigate = useNavigate();
  const { authToken, user } = useAuth();
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;

  const getLoggedUserId = () => {
    const ctxId = user?.id || user?._id || null;
    if (ctxId) return ctxId;
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.id || parsed?._id || null;
      }
    } catch (e) {
    }
    return null;
  };

  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [compraResult, setCompraResult] = useState(null);
  const [creatingCompra, setCreatingCompra] = useState(false);
  const [creatingEnvio, setCreatingEnvio] = useState(false);
  const [envioResult, setEnvioResult] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const detailsRes = await axios.get(`${API_BASE}/cart_detail`);
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
      gi  }));

        setLines(enriched);
      } catch (err) {
        console.error('Error cargando carrito o detalles:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Permitir recargar el carrito desde otros componentes mediante un evento global
    window.addEventListener('cartUpdated', load);
    return () => window.removeEventListener('cartUpdated', load);
  }, []);

  const updateQty = async (lineId, newQty) => {
    if (newQty < 1) return;
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      await axios.patch(`${API_BASE}/cart_detail/${lineId}`, { quantity: newQty }, { headers });
      setLines((prev) => prev.map(l => l.id === lineId ? { ...l, quantity: newQty } : l));
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
      setNotification({ message: 'No se pudo actualizar la cantidad', type: 'danger' });
    }
  };

  const removeLine = async (lineId) => {
    if (!window.confirm('Eliminar este producto del carrito?')) return;
    try {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      await axios.delete(`${API_BASE}/cart_detail/${lineId}`, { headers });
      setLines((prev) => prev.filter(l => l.id !== lineId));
      try { window.dispatchEvent(new Event('cartUpdated')); } catch(e){}
    } catch (err) {
      console.error('Error eliminando linea:', err?.response || err.message || err);
      const serverMsg = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || String(err));
      setNotification({ message: 'No se pudo eliminar la línea\n' + serverMsg, type: 'danger' });
    }
  };

  const handlePagar = async () => {
    if (!authToken && !user) {
      setNotification({ message: 'Debes iniciar sesión para completar la compra. Serás redirigido al login.', type: 'warning' });
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
      setNotification({ message: 'Usted no esta autorizado para comprar en este sitio', type: 'danger' });
      return;
    }

    if (lines.length === 0) { setNotification({ message: 'No hay carrito para procesar', type: 'warning' }); return; }
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
        // Enviar únicamente `id_compra`. El backend obtendrá `user` desde el token
        // y establecerá `status: 'pendiente'` por defecto.
        const envioBody = { id_compra: compraId };
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

      setNotification({ message: 'Compra realizada', type: 'success' });
      // Nota: se removió la navegación automática hacia la página principal
      // para mantener al usuario en la página de pago tras completar la compra.
      } catch (err) {
      console.error('Error al finalizar compra:', err);
      // err puede ser Error lanzado arriba con mensaje ya serializado o un axios error
      const status = err?.response?.status;
      const resp = err?.response?.data;
      const serverMsg = err?.message || (resp ? JSON.stringify(resp) : (err?.toString ? err.toString() : ''));
      console.error('Status:', status, 'Response:', resp);
      setNotification({ message: 'No se pudo completar la compra' + (status ? ` (status ${status})` : '') + '\n' + serverMsg, type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCompra = async () => {
    if (!authToken || !user) { setNotification({ message: 'Debes iniciar sesión (auth)', type: 'warning' }); navigate('/login'); return; }
    // Evitar que usuarios bloqueados creen compras de prueba
    // verificar estado más reciente en servidor
    try {
      const uid = user?.id || user?._id || getLoggedUserId();
      if (uid) {
        const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
        const ures = await axios.get(`${API_BASE}/user/${uid}`, { headers });
        const fresh = ures.data?.data ?? ures.data ?? null;
        if (fresh && (fresh.status === 'locked' || fresh.blocked)) {
          setNotification({ message: 'Usted no esta autorizado para comprar en este sitio', type: 'danger' });
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
        setNotification({ message: 'Compra creada OK. ID: ' + (model?.id || model?._id || '—'), type: 'success' });
      } catch (e) {
        setNotification({ message: 'Compra creada OK', type: 'success' });
      }
    } catch (err) {
      console.error('Error POST /compra:', err?.response || err?.message || err);
      const serverMsg = err?.response?.data ? JSON.stringify(err.response.data) : (err?.message || String(err));
      setNotification({ message: 'Error en POST /compra - revisa consola\n' + serverMsg, type: 'danger' });
    } finally {
      setCreatingCompra(false);
    }
  };

  const handleCreateEnvio = async () => {
    const compraId = compraResult?.id;
    if (!compraId) {
      setNotification({ message: 'Primero crea una compra con POST /compra (usa el botón correspondiente)', type: 'warning' });
      return;
    }
    try {
      setCreatingEnvio(true);
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      // Enviar solo id_compra; backend obtiene user desde el token y asigna status
      const body = { id_compra: compraId };
      const res = await axios.post(`${API_BASE}/envio`, body, { headers });
      const model = res.data?.data ?? res.data ?? res;
      setEnvioResult(model);
      try {
        setNotification({ message: 'Envío creado OK. ID: ' + (model?.id || model?._id || '—'), type: 'success' });
      } catch (e) {
        setNotification({ message: 'Envío creado OK', type: 'success' });
      }
    } catch (err) {
      console.error('Error POST /envio:', err?.response || err?.message || err);
      setNotification({ message: 'Error en POST /envio - revisa consola', type: 'danger' });
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
      <Notification notification={notification} onClose={() => setNotification(null)} />
      <h3>Informacion del carrito</h3>
      <div className="mb-2">Total unidades: <strong>{totalItems}</strong> — Productos distintos: <strong>{lines.length}</strong></div>
      {lines.length === 0 && <p>El carrito está vacío.</p>}

      
        <>
          {/* Estado del carrito: el backend no expone metadata `cart` en este proyecto */}

          <div className="row">
            <div className="col-md-8">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '50%' }}>Producto</th>
                      <th style={{ width: 110 }}>Precio</th>
                      <th style={{ width: 120 }}>Cantidad</th>
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
                          <td>
                            <div style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {prod?.name || `ID: ${l.product}`}
                            </div>
                          </td>
                          <td>{Math.round(price)}</td>
                          <td>
                            <div style={{ width: 80 }}>{qty}</div>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeLine(l.id)}>Eliminar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3" style={{ position: 'sticky', top: 100 }}>
                <h5 className="mb-3">Resumen</h5>
                <div className="d-flex justify-content-between mb-2"><span>Productos</span><strong>{lines.length}</strong></div>
                <div className="d-flex justify-content-between mb-3"><span>Total unidades</span><strong>{totalItems}</strong></div>
                <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: 20 }}>
                  <div>Total</div>
                  <div className="badge bg-primary" style={{ fontSize: 16, padding: '10px 14px' }}>${Math.round(total)}</div>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-success" onClick={handlePagar} disabled={saving || lines.length === 0}>{saving ? 'Procesando compra...' : 'Comprar'}</button>
                </div>
                <div className="mt-3 text-center">
                  <Link to="/envios" className="btn btn-outline-secondary">Ver envíos</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            {compraResult && <small className="text-muted">Compra creada ID: {compraResult.id || compraResult._id || '—'}</small>}
            {/* envio table removed from backend; no envioResult shown */}
          </div>
        </>
    </div>
  );
};

export default PagoPage;
