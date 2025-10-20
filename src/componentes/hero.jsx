import React from "react";
import HeroImage from "/imagenes/Tienda.jpeg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <header className="container-fluid p-5 my-5 body-background">
      <div className="row pb-2 mt-3 rounded align-items-center bg-light">
        <div className="col-md-6 my-5">
          <h1 className="display-4">
            Bienvenido a <span className="text-primary">The Holiday Shop</span>
          </h1>
          <p className="text-muted lead">
            Encuentra los mejores productos para cada festividad: Navidad, Halloween, Pascua y más.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg mt-0">
            Iniciar Sesión
          </Link>
        </div>

        <div className="col-md-6 text-center pt-2 mx-auto">
          <img 
            src={HeroImage}
            alt="Imagen tienda" 
            className="w-100 rounded" 
          />
        </div>

      </div>
    </header>
  );
};

export default Hero;
