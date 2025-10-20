import React, { useState }from 'react'
import { registerUser } from '../api/user';

const Signup = () => {
    const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerUser(formData);
      alert("Usuario registrado correctamente");
      setFormData({ name: "", email: "", password: "", role: "" });
    } catch (error) {
        console.error("Error:", error);
        alert("Error al registrar usuario la contraseña debe ser de 8 caracteres entre letras y numeros" );
    }
  };

  return (
    <div className="mt-5 pt-5 body-background">
      <form className="w-25 mx-auto align-text"  onSubmit={handleSubmit}>

        <h2 className="mb-3">Crear una cuenta</h2>

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
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" className="btn btn-primary w-100 mb-5 pt-2">
          Registrarse
        </button>
        </form>
    </div>
  )
}

export default Signup
