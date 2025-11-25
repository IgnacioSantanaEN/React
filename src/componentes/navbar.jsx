import React, { useEffect, useState } from "react";
import logo from "/imagenes/Logo Tienda.jpg";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [cartIdState, setCartIdState] = useState(typeof window !== 'undefined' ? localStorage.getItem('cartId') : null);
  const [cartCount, setCartCount] = useState(0);

  const ensureCart = async () => {
    try {
      let cid = localStorage.getItem('cartId');
      // Si hay un cartId guardado, comprobar que el carrito siga siendo 'active'
      if (cid) {
        try {
          const check = await axios.get(`${API_BASE}/cart/${cid}`);
          const cartObj = check?.data?.data ?? check?.data ?? null;
          if (!cartObj || (cartObj.status && cartObj.status !== 'active')) {
            // carrito no válido o no activo -> crear nuevo activo
            cid = null;
          }
        } catch (e) {
          // si falla la comprobación, vamos a crear uno nuevo
          cid = null;
        }
      }

      if (!cid) {
        // crear carrito público activo
        const resp = await axios.post(`${API_BASE}/cart`, { status: 'active' });
        const d = resp?.data;
        cid = d?.id || d?._id || d?.cartId || d?.data?.id || d?.data?._id || null;
        if (cid) localStorage.setItem('cartId', String(cid));
      }
      setCartIdState(cid);
      return cid;
    } catch (err) {
      console.error('No se pudo asegurar carrito público:', err);
      return null;
    }
  };

  const refreshCartCount = async (cid) => {
    try {
      if (!cid) { setCartCount(0); return; }
      const resp = await axios.get(`${API_BASE}/cart_detail?cart_id=${cid}`);
      const details = Array.isArray(resp.data) ? resp.data : (resp.data?.data || []);
      const count = details.reduce((s, d) => s + (Number(d.quantity) || 0), 0);
      setCartCount(count);
    } catch (err) {
      console.error('Error leyendo cart_detail para contador:', err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    // asegurar carrito público al montar y obtener contador
    (async () => {
      const cid = await ensureCart();
      await refreshCartCount(cid);
    })();

    const onCartUpdated = async () => {
      const cid = localStorage.getItem('cartId');
      setCartIdState(cid);
      await refreshCartCount(cid);
    };

    window.addEventListener('cartUpdated', onCartUpdated);
    // storage para cambios en otras pestañas
    window.addEventListener('storage', onCartUpdated);
    return () => {
      window.removeEventListener('cartUpdated', onCartUpdated);
      window.removeEventListener('storage', onCartUpdated);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top my-0 py-0">
      <div className="container-fluid">

        {/* Logo Tienda The Holiday Shop*/}
        <Link className="navbar-brand d-flex align-items-center fs-3" to="/">
          <img
            src={logo}
            alt="Logo"
            width="60"
            height="60"
            className="me-3"
          />
          <span>The Holiday Shop</span>
        </Link>


        {/* Barra de navegacion*/}
        <div className="collapse navbar-collapse fs-3">
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto">

            {/* Links de navegación */}
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/productos">Productos</Link>
            </li>
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/usuarios">Usuarios</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center" to="/pago">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-cart3 me-1" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1h1a.5.5 0 0 1 .485.379L2.89 5H14.5a.5.5 0 0 1 .49.598l-1.5 6A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.49-.402L1.01 2H.5a.5.5 0 0 1-.5-.5zM5 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 1a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                Carrito
                <span className="badge bg-light text-dark ms-2" style={{ fontSize: 12 }}>{cartCount}</span>
              </Link>
            </li>
            
            {/* Mostrar 'Registro' solo si NO está autenticado */}
            {!isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/signup">Registro</Link>
              </li>
            )}

            {/* Enlace de usuarios eliminado */}

            {isAuthenticated && (
              <>
                <li className="nav-item d-flex align-items-center ms-3">
                  <span className="navbar-text me-2">{user?.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
                {/* No mostrar enlaces de pago en el navbar; la página /pago gestiona el flujo */}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;