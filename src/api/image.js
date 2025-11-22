import axios from 'axios';

const BASE_DATOS = import.meta.env.VITE_XANO_BASE_DATOS;
const IMG_DATOS = import.meta.env.VITE_XANO_IMG_DATOS || `${BASE_DATOS}/upload/image`;

export async function uploadImage(file, token) {
  try {
    const formData = new FormData();
    // Algunos backends (ej. repositorio del profesor) esperan 'content[]' como nombre
    // para múltiples archivos: content[]: file1, content[]: file2 ...
    formData.append('content[]', file);
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

export async function uploadImages(files, token) {
  try {
    const formData = new FormData();
    // Añadimos cada archivo usando el nombre 'content[]' (array de contenido)
    for (const file of files) {
      formData.append('content[]', file);
    }

    const { data } = await axios.post(IMG_DATOS, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Esperamos que Xano devuelva un arreglo de metadatos/URLs de las imágenes subidas
    return data;
  } catch (error) {
    console.error('Error al subir imágenes:', error.response?.data || error.message);
    throw error;
  }
}
