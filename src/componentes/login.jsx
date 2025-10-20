import React, { useState } from "react";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

const Ingreso = () => {
  const { login, user, authToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

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

  return (
    <div className="d-flex justify-content-center mt-5 pt-5 body-background">
      <div className="card my-0 shadow bg-light">
        <h3 className="mt-5 text-center">Iniciar Sesión</h3>

        <form className="mx-5 py-0 align-text" onSubmit={handleSubmit}>
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

          <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
        </form>

        {authToken && user && (
          <div className="mt-1 p-3 bg-light border rounded">
            <strong>Token:</strong> {authToken} <br />
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingreso;