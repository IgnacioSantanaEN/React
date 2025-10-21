import React, { useEffect, useState } from "react";
import { getProducts } from "../api/product"; 
import ProductoLista from "../componentes/listaProducto";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };
    fetchData();
  }, []);

  return <ProductoLista products={products} />;
};

export default ProductsPage;