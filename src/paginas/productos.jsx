import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductoLista from "../componentes/listaProducto";

const API_BASE = 'https://x8ki-letl-twmt.n7.xano.io/api:ua2_1To9';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/product`);
        // Normalizar respuesta: algunas APIs devuelven array directo, otras { data: [...] }
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setProducts(list || []);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    fetchData();
  }, []);

  return <ProductoLista products={products} />;
};

export default ProductsPage;