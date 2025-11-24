import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/user';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const { isAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Si quien registra NO es admin, forzamos rol 'cliente' aunque el form tenga otro valor
      const payload = { ...formData };
      if (!isAdmin) {
        payload.role = 'cliente';
      }
      const response = await registerUser(payload);
      setSuccess(true);
      // Limpia el formulario para evitar re-envíos accidentales
      setFormData({ name: "", email: "", password: "", role: "" });
      // OPCIONAL: Redirección automática después de 1.5s
      // setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar usuario la contraseña debe ser de 8 caracteres entre letras y numeros" );
    }
  };

  return (
    <div className="d-flex justify-content-center pt-5 body-background">
      <form
        className="card shadow bg-light px-4 py-3 mx-3"
        style={{ maxWidth: "600px", width: "100%" }}
        onSubmit={handleSubmit}
      >

        <h2 className="mb-3">Crear una cuenta</h2>

        {success && (
          <div className="alert alert-success d-flex justify-content-between align-items-center" role="alert">
            <span>Usuario registrado correctamente.</span>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar sesión
            </button>
          </div>
        )}

        <label htmlFor="name" className="form-label">
            Nombre de usuario
        </label>
        <input
          type="text"
          className="form-control mb-3"
          id="name"
          name="name"
          placeholder="Ingresa tu nombre de usuario"
          value={formData.name}
          onChange={handleChange}
          required 
        />

        <label htmlFor="email" className="form-label">
            Correo electrónico
        </label>
        <input 
          type="email"
          className="form-control mb-3"
          id="email"
          name="email"
          placeholder="Ingresa tu correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required 
        />

        <label htmlFor="password" className="form-label">
            Contraseña
        </label>
        <input 
            type="password" 
            className="form-control mb-3" 
            id="password"
            name="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange}
            required 
        />

        <label htmlFor="role" className="form-label">
          Rol
        </label>
        <select
          id="role"
          name="role"
          className="form-select mb-5"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un rol</option>
          <option value="cliente">Cliente</option>
          {isAdmin && <option value="admin">Administrador</option>}
        </select>

        <button type="submit" className="btn btn-success w-100 mb-5 pt-2">
          Registrarse
        </button>
        </form>
    </div>
  )
}

export default Signup
