import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProducts } from "../api/product";
import { useAuth } from "../context/AuthContext";
import ProductoLista from "../componentes/listaProducto";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const { isAdmin } = useAuth();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mt-5 pt-5 body-background">
      <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
        <h2>Productos</h2>
        {isAdmin && (
          <Link className="btn btn-success" to="/addProd">
            + Añadir Producto
          </Link>
        )}
      </div>

      {location.state?.created && (
        <div className="alert alert-success" role="alert">
          Producto "{location.state?.name || ""}" creado correctamente.
        </div>
      )}

      <ProductoLista products={products} onProductsChange={fetchData} />
    </div>
  );
};

export default ProductsPage;