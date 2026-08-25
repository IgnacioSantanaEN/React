import React from "react";
import HeroImage from "/imagenes/Tienda.jpeg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <header className="container my-5 col-md-12 body-background">
      <div className="row p-5 rounded align-items-center bg-light">
        <div className="col-md-6">
          <h1 className="display-4">
            Bienvenido a <span className="text-primary">The Holiday Shop</span>
          </h1>
          <p className="text-muted lead">
            Encuentra y realiza tus pedidos en linea con Delivery barato en Maipú.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg mt-3">
            Iniciar Sesión
          </Link>
        </div>

        {/* Imagen a la derecha */}
        <div className="col-md-6 text-center">
          <img 
            src={HeroImage} 
            alt="Imagen tienda" 
            className="img-fluid w-100 rounded" 
          />
        </div>

      </div>
    </header>
  );
};

export default Hero;
