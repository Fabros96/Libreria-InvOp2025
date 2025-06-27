import { useState } from 'react';
import { Button, Stack } from 'react-bootstrap';
import ModalEx from '../components/MyModalProps/ModalEx';
import './styles/HomePage.css';
import '../App.css';

import Routes from "../routes/Routes";
import { Link } from 'react-router-dom';

const HomePage = () => {



  return (
    <div className="w-100" style={{ margin: '50px' }}>

      <Stack className='menuStack'>

        <div className="menuLinksContainer" >
          {Routes.filter(route => route.to !== "/" && route.to !== "/prediccionDemanda" && route.to !== "/modelos").map((route) => (
            <Link
              key={route.to}
              to={route.to}
              className="d-flex flex-column align-items-center text-decoration-none">
              <div>{route.svg}</div>
              <small>{route.text}</small>
            </Link>
          )
          )}
        </div>

        <div className="menuLinksContainer">
          {Routes.filter(route => route.to === "/prediccionDemanda" || route.to === "/modelos").map((route) => (
            <Link
              to={route.to}
              className="d-flex flex-column align-items-center text-decoration-none">
              <div>{route.svg}</div>
              <small>{route.text}</small>
            </Link>
          ))}
        </div>
      </Stack>

    </div>
  )
}

export default HomePage