import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../componentes/navbar";
import Footer from "../componentes/footer";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="app-main" style={{ minHeight: "100vh", paddingBottom: "3.5rem" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
