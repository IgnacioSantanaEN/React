import './index.css'
import { Route, Routes } from 'react-router-dom'

import Layout from './layout/Layout'
import Registro from './paginas/signup'
import Home from './paginas/home'
import Inicio from './paginas/login'
import AñadirProducto from './paginas/addProd'
import Productos from './paginas/productos'
import Producto from './paginas/producto_fixed'
import PagoPage from './paginas/pago'
import EnviosPage from './paginas/envios'
import Usuarios from './paginas/usuarios'
import RoleRoute from './routes/RoleRoute'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="signup" element={<Registro />} />
          <Route path="login" element={<Inicio />} />
          <Route
            path="add"
            element={
              <RoleRoute roles={['admin','vendedor']}>
                <AñadirProducto />
              </RoleRoute>
            }
          />
          <Route path="productos" element={<Productos />} />
          <Route path="producto/:id" element={<Producto />} />
          <Route path="pago" element={<PagoPage />} />
          <Route path="envios" element={<EnviosPage />} />
          <Route path="usuarios" element={
            <RoleRoute roles={['admin']}>
              <Usuarios />
            </RoleRoute>
          } />
        </Route>
      </Routes>
    </>
  )
}

export default App