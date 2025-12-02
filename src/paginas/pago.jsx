import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const PagoPage = () => {
  const navigate = useNavigate();
  const cartId = typeof window !== 'undefined' ? localStorage.getItem('cartId') : null;

  const [loading, setLoading] = useState(true);
  // No usamos entidad `cart` aquí — trabajamos sobre `cart_detail`.
  const [lines, setLines] = useState([]); // each: { id, cart_id, product, quantity, productData }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!cartId) { setLoading(false); return; }
      try {
        setLoading(true);
        // obtener líneas del carrito
        const detailsRes = await axios.get(`${API_BASE}/cart_detail?cart_id=${cartId}`);
        const details = Array.isArray(detailsRes.data) ? detailsRes.data : (detailsRes.data?.data || []);

        // para cada detalle, obtener info del producto (si es necesario)
        const enriched = await Promise.all(details.map(async (d) => {
          // Soportar varias formas de cómo el detalle puede referenciar al producto
          // - d.product puede ser id (number/string)
          // - d.product_id
          // - d.product puede ser un objeto embebido con name/price
          let productData = null;
          let productId = null;

          // Si d.product es un objeto que ya contiene datos útiles, úsalo directamente
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
  }, [cartId]);

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
    if (!cartId) { alert('No hay carrito para procesar'); return; }
    if (!window.confirm('Confirmar compra?')) return;
    try {
      setSaving(true);
      // Ahora no existe tabla `cart`. Procedemos a eliminar todos los cart_detail del cartId
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

      // Generar un nuevo cartId en cliente y guardarlo
      try {
        let newId;
        try {
          newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `cart-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        } catch (e) {
          newId = `cart-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        }
        if (newId) {
          localStorage.setItem('cartId', String(newId));
          window.dispatchEvent(new Event('cartUpdated'));
        } else {
          localStorage.removeItem('cartId');
        }
      } catch (createErr) {
        console.error('No se pudo generar nuevo cartId tras pagar:', createErr);
        localStorage.removeItem('cartId');
      }

      alert('Compra realizada');
      navigate('/');
    } catch (err) {
      console.error('Error al finalizar compra:', err);
      const status = err?.response?.status;
      const resp = err?.response?.data;
      console.error('Status:', status, 'Response:', resp);
      alert('No se pudo completar la compra' + (status ? ` (status ${status})` : ' - revisa la consola'));
    } finally {
      setSaving(false);
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
      {cartId && <div className="mb-2">Total unidades: <strong>{totalItems}</strong> — Productos distintos: <strong>{lines.length}</strong></div>}
      {!cartId && <p>No hay carrito activo. Crea uno primero desde Productos.</p>}

      {cartId && (
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
            <button className="btn btn-success" disabled={saving} onClick={handlePagar}>{saving ? 'Procesando...' : 'Pagar'}</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PagoPage;
