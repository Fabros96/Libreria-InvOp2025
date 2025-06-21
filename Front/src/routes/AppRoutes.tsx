import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
// import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import MaintenancePage from '../pages/MaintenancePage';
import Articulos from '../pages/Articulos';
import Proveedores from '../pages/Proveedores';

const AppRoutes: React.FC = () => {
  return (
    
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/articulos" element={<Articulos />} />
      <Route path="/proveedores" element={<Proveedores />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    
  )
}

export default AppRoutes