import React from "react";
import logo from "/imagenes/Logo Tienda.jpg";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();

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

            {user && (
              <span className="navbar-text ms-3">
                {user.name}
              </span>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;