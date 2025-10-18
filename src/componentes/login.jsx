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
    <div className="d-flex justify-content-center mt-5 pt-5">
      <div className="card px-5 py-5 mx-auto shadow">
        <h3 className="mb-4 text-center">Iniciar Sesión</h3>

        <form className="mx-5 px-5" onSubmit={handleSubmit}>
          <div className="mb-3 py-4">
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

          <div className="mb-3 py-5">
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
          <div className="mt-3 p-2 bg-light border rounded">
            <strong>Token:</strong> {authToken} <br />
            <strong>Rol:</strong> {user.role}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingreso;