import './styles/NotFoundPage.css';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="image-container">
      <img
        src="src/assets/404Perrito.png" // Reemplazalo con tu imagen
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

export default NotFoundPage