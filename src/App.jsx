import './index.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Registro from './paginas/signup'
import Home from './paginas/home'
import Inicio from './paginas/login'
import AñadirProducto from './paginas/addProd'
import Productos from './paginas/productos'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<Registro />} />
          <Route path="login" element={<Inicio />} />
          <Route path="addProd" element={<AñadirProducto />} />
          <Route path="productos" element={<Productos />} />
        </Route>
      </Routes>
    </>
  )
}

export default App