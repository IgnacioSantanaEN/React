import './index.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout'
import Registro from './paginas/signup'
import Home from './paginas/home'
import Inicio from './paginas/login'
import AñadirProducto from './paginas/addProd'
import Productos from './paginas/productos'
import Producto from './paginas/producto'
import Usuarios from './paginas/usuarios'
import Usuario from './paginas/usuario'
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
              <RoleRoute roles={['admin']}>
                <AñadirProducto />
              </RoleRoute>
            }
          />
          <Route path="productos" element={<Productos />} />
          <Route path="producto/:id" element={<Producto />} />
          <Route
            path="usuarios"
            element={
              <RoleRoute roles={["admin"]}>
                <Usuarios />
              </RoleRoute>
            }
          />
          <Route
            path="usuario/:id"
            element={
              <RoleRoute roles={["admin"]}>
                <Usuario />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </>
  )
}

export default App