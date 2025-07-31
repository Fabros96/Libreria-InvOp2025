import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import MaintenancePage from '../pages/MaintenancePage';
import Articulos from '../pages/Articulos';
import Proveedores from '../pages/Proveedores';
import Ventas from '../pages/Ventas';
import Ordenes from '../pages/Ordenes' 

const AppRoutes: React.FC = () => {
  return (
    
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<MaintenancePage />} />      
      <Route path="/profile" element={<MaintenancePage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/articulos" element={<Articulos />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="/ventas" element={<Ventas />} />
      <Route path="/ordenes" element={<Ordenes />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    
  )
}

export default AppRoutes