import { Modal, Button } from "react-bootstrap";
import "../App.css"
import type { ReactNode } from "react";

type ConfirmModalProps = {
  show: boolean;
  title?: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({ show, title = "Confirmación ", message, onConfirm, onCancel }: ConfirmModalProps) => {
  return (
    <Modal
      show={show}
      onHide={() => { }}
      backdrop="static"    // bloquea clicks fuera
      keyboard={false}     // bloquea tecla ESC
      centered
      dialogClassName="auto-width-modal"
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ textAlign: "center", backgroundColor:'var(--terciario)', color:'var(--detalles)' }} className="fs-5">{message}</Modal.Body>

      <Modal.Footer className="d-flex justify-content-between w-100">
        <Button variant="outline-danger" onClick={onCancel}>Cancelar</Button>
        <Button variant="outline-success" onClick={onConfirm}>Confirmar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
