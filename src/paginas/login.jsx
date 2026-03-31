import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

const Ingreso = () => {
  const { login, user, authToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: ""});

  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);
      login(data.authToken, data.user);
      alert(`Bienvenido ${data.user.name}`);

    } catch (error) {
      console.error("Error:", error);
      alert("Email o contraseña incorrectos");
      
    }
  };

  // El token ahora es manejado implícitamente por el backend; no se muestra en frontend.

  return (
    <div className="d-flex justify-content-center my-5 py-5 body-background">
      <div className="card mx-3 px-3 shadow bg-light">
        <h3 className="mt-3 text-center mt-3">Iniciar Sesión</h3>

  <form className="mx-5 px-5 pb-4 align-text" onSubmit={handleSubmit}>
          <div className="py-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="py-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success w-100 mt-4">Iniciar Sesión</button>
        </form>

        <div className="mx-5 px-5 pb-3 text-center">
          <div className="d-inline-block bg-dark rounded px-3 py-2">
            <span className="text-white">¿No tienes cuenta?</span>
            <Link to="/signup" className="text-white fw-bold ms-2" style={{ textDecoration: 'underline' }}>
              Regístrate
            </Link>
          </div>
        </div>

        {/* El token no se muestra en frontend por motivos de seguridad; lo maneja el backend. */}
      </div>
    </div>
  );
};

export default Ingreso;