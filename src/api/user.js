// src/api/user.js
// Módulo para manejar autenticación y usuarios con Xano

import axios from "axios";

// ✅ URL base de autenticación (usa variable de entorno o directamente la URL)
const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE;

// ✅ Helper para agregar el token JWT al header
export const makeAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

// 🔹 Registrar un nuevo usuario
export async function registerUser({ name, email, password, role }) {
  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/signup`,
      { name, email, password, role }, // Xano usa estos nombres exactos
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error.response?.data || error.message);
    throw error;
  }
}

// 🔹 Iniciar sesión
export async function loginUser({ email, password }) {
  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    // Xano devuelve { authToken: "...", user: {...} }
    return data;
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error.response?.data || error.message);
    throw error;
  }
}

// 🔹 Obtener información del usuario autenticado
export async function getUserProfile(token) {
  try {
    const { data } = await axios.get(`${AUTH_BASE}/me`, {
      headers: makeAuthHeader(token),
    });
    return data;
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error.response?.data || error.message);
    throw error;
  }
}
