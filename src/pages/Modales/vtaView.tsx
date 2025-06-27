import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

interface Venta {
  idVenta: number;
  idArticulo: number;
  cantidad: number;
  fechaCreacion: string;
  articulo?: {
    nombre: string;
    descripcion?: string;
  };
}

interface VentaModalProps {
  venta: Venta | null;
  show: boolean;
  onHide: () => void;
}

const VentaModal: React.FC<VentaModalProps> = ({ venta, show, onHide }) => {
  if (!venta) return null;

  return (
    <Modal show={show} onHide={onHide} centered >
      <Modal.Header closeButton>
        <Modal.Title>Detalle de Venta #{venta.idVenta}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered>
          <tbody>
            <tr>
              <th>ID Artículo</th>
              <td>{venta.idArticulo}</td>
            </tr>
            <tr>
              <th>Nombre del Artículo</th>
              <td>{venta.articulo?.nombre || 'N/D'}</td>
            </tr>
            <tr>
              <th>Descripción</th>
              <td>{venta.articulo?.descripcion || 'Sin descripción'}</td>
            </tr>
            <tr>
              <th>Cantidad Vendida</th>
              <td>{venta.cantidad}</td>
            </tr>
            <tr>
              <th>Fecha de Venta</th>
              <td>{new Date(venta.fechaCreacion).toLocaleString()}</td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VentaModal;
