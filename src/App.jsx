import { useState } from 'react'
import './App.css'
import Navbar from './componentes/navbar'
import Body from './componentes/body'
import { Route, Routes } from 'react-router-dom'
import Footer from './componentes/footer'
import Registro from './paginas/signup'
import Home from './paginas/home'
import Inicio from './paginas/login'

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
      </Routes>
      <Footer />
    </>
  )
}

export default App