import { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer/Footer";
import './App.css';

import { BrowserRouter as Router } from 'react-router-dom';
import { Container } from "react-bootstrap";
import { Suspense } from "react";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'oscuro') {
      setTemaOscuro(true);
    }
  }, []);

  // Aplicar clase al body directamente
  useEffect(() => {
    if (temaOscuro) {
      document.body.classList.add('tema-oscuro');
    } else {
      document.body.classList.remove('tema-oscuro');
    }
    localStorage.setItem('tema', temaOscuro ? 'oscuro' : 'claro');
  }, [temaOscuro]);

  const toggleTema = () => setTemaOscuro(prev => !prev);

  return (
    <>
      <ToastContainer />
      <Router>
        <Header temaOscuro={temaOscuro} toggleTema={toggleTema} />
        <Container style={{ display: 'flex', minHeight: '85vh', maxWidth: '100%', padding: '0' }}>
          <Sidebar />
          <Suspense fallback={<Loader />}>
            <AppRoutes />
          </Suspense>
        </Container>
        <Footer />
      </Router>
    </>
  );
}

export default App;
