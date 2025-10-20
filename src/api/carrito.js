import axios from "axios";

const BASE_DATOS = import.meta.env.VITE_XANO_BASE_DATOS;

export const makeAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

export async function getCarrito() {
  try {
    const { data } = await axios.get(`${BASE_DATOS}/cart`, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    console.error("Error al obtener productos:", error.response?.data || error.message);
    throw error;
  }
}

export async function getCarritoById(id) {
  try {
    const { data } = await axios.get(`${BASE_DATOS}/cart/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error) {
    console.error("Error al obtener producto por ID:", error.response?.data || error.message);
    throw error;
  }
}

export async function createCarrito(producto, token) {
  try {
    const { data } = await axios.post(
        `${BASE_DATOS}/cart`,
        producto,
        { headers: { ...makeAuthHeader(token), "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("Error al crear producto:", error.response?.data || error.message);
    throw error;
  }
}

export async function updateCarrito(id, producto, token) {
    try {
        const { data } = await axios.put(
            `${BASE_DATOS}/cart/${id}`,
            producto,
            { headers: { ...makeAuthHeader(token), "Content-Type": "application/json" } }
        );
        return data;
    } catch (error) {
        console.error("Error al actualizar producto:", error.response?.data || error.message);
        throw error;
    }
}

export async function deleteCarrito(id, token) {
    try {
        const { data } = await axios.delete(
            `${BASE_DATOS}/cart${id}`,
            { headers: makeAuthHeader(token) }
        );
        return data;
    } catch (error) {
        console.error("Error al eliminar producto:", error.response?.data || error.message);
        throw error;
    }
}

