import './styles/MaintenancePage.css';
import { Link } from 'react-router-dom';

const MaintenancePage = () => {
  return (
    <div className="image-container">
      <img
        src="src/assets/mojoMantenimiento.png"
        alt="Fondo"
        className="background-image"
      />

      <Link
        className="back-button"
        style={{
          color: 'black',
          backgroundColor: 'var(--secundario)',
          borderRadius: '15px',
          padding: '10px',
          textDecoration: 'none'
        }}
        to='/'
      >
        Volver
      </Link>
    </div>
  );
}

export default MaintenancePage