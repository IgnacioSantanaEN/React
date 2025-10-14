import React from "react";
import logo from "/imagenes/Logo Tienda.jpg"; // Ajusta la ruta según tu carpeta
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top py-0">
      <div className="container-fluid">

        <Link className="navbar-brand d-flex align-items-center fs-3" to="/home">
          <img
            src={logo}
            alt="Logo"
            width="60"
            height="60"
            className="me-4"
          />
          <span>The Holiday Shop</span>
        </Link>

        {/* Menú de navegación entre vistas */}
        <div className="collapse navbar-collapse fs-3">
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="productos.html">Productos</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="blogs.html">Blogs</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="nosotros.html">Nosotros</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="contacto.html">Contacto</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">Registro</Link>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;