import axios from 'axios';

const IMG_DATOS = import.meta.env.VITE_XANO_IMG_DATOS;

export async function uploadImage(file, token) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await axios.post(IMG_DATOS, formData, {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    return data;
  }
    catch (error) {
    console.error("Error al subir imagen:", error.response?.data || error.message);
    throw error;
    }
}
