import axios from "axios";

const BASE_URL = import.meta.env.VITE_XANO_BASE;

export async function getProducts() {
  try {
    const { data } = await axios.get(`${BASE_URL}/product`);
    return data;
  } catch (error) {
    console.error("Error al obtener productos:",
        error.response?.data || error.message);
    throw error;
  }
}

export async function getProductById(productId) {
  try {
    const { data } = await axios.get(`${BASE_URL}/product/${productId}`);
    return data;
  } catch (error) {
    console.error(`Error al obtener producto con ID ${productId}:`,
        error.response?.data || error.message);
    throw error;
  }
}

export async function createProduct(payload, token) {
    try {
        const { data } = await axios.post(
            `${BASE_URL}/product`,
            payload,
            { headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
            }
        );
        return data;
    }
    catch (error) {
        console.error("Error al crear producto:",
            error.response?.data || error.message);
        throw error;
    }
}

export async function updateProduct(productId, payload, token) {
    try {
        const { data } = await axios.put(
            `${BASE_URL}/product/${productId}`,
            payload,
            { headers: { "Content-Type": "application/json",
                Authorization: `Bearer ${token}` } }
        );
        return data;
    }
    catch (error) {
        console.error(`Error al actualizar producto con ID ${productId}:`,
            error.response?.data || error.message);
        throw error;
    }
}

export async function deleteProduct(productId, token) {
    try {
        const { data } = await axios.delete(
            `${BASE_URL}/product/${productId}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        return data;
    }
    catch (error) {
        console.error(`Error al eliminar producto con ID ${productId}:`,
            error.response?.data || error.message);
        throw error;
    }
}

export async function uploadProductImages(fileList) {
    const formData = new FormData();
    fileList.forEach((file) => formData.append("content", file));

    try {
        const { data } = await axios.post(`${BASE_URL}/upload/image`, formData);
        return data;
    } catch (error) {
        console.error("Error al subir imágenes:", error.response?.data || error.message);
        throw error;
    }
}

export async function updateProductImages(productId, payload, token) {
    try {
        const { data } = await axios.patch(
            `${BASE_URL}/product/${productId}`,
            payload,
            { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
        );
        return data;
    } catch (error) {
        console.error("Error al asociar imágenes al producto:", error.response?.data || error.message);
        throw error;
    }
}