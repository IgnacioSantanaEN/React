import React, { useEffect, useState } from "react";
import ProductoLista from "../componentes/listaProducto";
import { getProducts } from "../api/product";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProducts();
        const list = Array.isArray(response) ? response : (response?.data || []);
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