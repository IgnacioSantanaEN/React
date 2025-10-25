import React from "react";
import logo from "/imagenes/Logo Tienda.jpg";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top py-0">
      <div className="container-fluid">

        <Link className="navbar-brand d-flex align-items-center fs-3" to="/home">
          <img
            src={logo}
            alt="Logo"
            width="60"
            height="60"
            className="me-3"
          />
          <span>The Holiday Shop</span>
        </Link>

        <div className="collapse navbar-collapse fs-3">
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
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