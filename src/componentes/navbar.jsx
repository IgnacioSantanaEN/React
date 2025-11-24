import React from "react";
import logo from "/imagenes/Logo Tienda.jpg";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

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
            
            <li className="nav-item">
              <Link className="nav-link" to="/signup">Registro</Link>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/usuarios">Usuarios</Link>
              </li>
            )}

            {isAuthenticated && (
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
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;