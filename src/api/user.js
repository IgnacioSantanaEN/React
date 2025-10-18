import axios from "axios";

const AUTH_BASE = import.meta.env.VITE_XANO_AUTH_BASE;

export const makeAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export async function registerUser({ name, email, password, role }) {
  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/signup`,
      { name, email, password, role },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("Error al registrar usuario:", error.response?.data || error.message);
    throw error;
  }
}

export async function loginUser({ email, password }) {
  try {
    const { data } = await axios.post(
      `${AUTH_BASE}/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error.response?.data || error.message);
    throw error;
  }
}

export async function getUserProfile(token) {
  try {
    const { data } = await axios.get(`${AUTH_BASE}/me`, {
      headers: makeAuthHeader(token),
    });
    return data;
  } catch (error) {
    console.error("Error al obtener perfil:", error.response?.data || error.message);
    throw error;
  }
}
