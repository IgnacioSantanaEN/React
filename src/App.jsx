import { useState } from 'react'
import './index.css'
import Navbar from './componentes/navbar'
import Body from './componentes/body'
import { Route, Routes } from 'react-router-dom'
import Footer from './componentes/footer'
import Registro from './paginas/signup'
import Home from './paginas/home'
import Inicio from './paginas/login'
import AñadirProducto from './paginas/addProd'
import Productos from './paginas/productos'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Body />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signup" element={<Registro />} />
        <Route path="/login" element={<Inicio />} />
        <Route path="/add" element={<AñadirProducto />} />
        <Route path="/productos" element={<Productos />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App