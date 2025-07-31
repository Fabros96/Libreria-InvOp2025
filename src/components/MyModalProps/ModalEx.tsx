//import { useState } from "react"
import { Button, Form, Modal } from "react-bootstrap";
import FormEx from "../FormEx/FormEx";

import '../../App.css';


//Aca vamos a declarar el tipo de datos que vamos a recibir en el modal
type ModalProps = {
    show: boolean;    //Propiedad para mostrar el modal
    onHide: () => void; //Propiedad para ocultar el modal
    //title: string;   //Propiedad para el titulo del modal
    //body: string;    //Propiedad para el cuerpo del modal
    //footer: string;  //Propiedad para el pie del modal
}

/* Ejemplo completo de un modal con propiedades 
const ModalEx = ({ show, onHide, title, body, footer }: ModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
            </Modal.Body>
             <Modal.Footer className="d-flex justify-content-between w-100">
                {footer}
                <button type="button" className="btn btn-secondary" onClick={onHide}>
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    )
}*/

const ModalEx = ({ show, onHide }: ModalProps) => {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Modal de Ejemplo</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Body de Ejemplo
                <Form.Label htmlFor="exampleInputEmail1">Email</Form.Label>
                <Form.Control
                    type="email"
                    id="exampleInputEmail1"
                    placeholder="Enter email"
                    onChange={(e) => console.log(e.target.value)}
                />
            </Modal.Body>
            <FormEx />

             <Modal.Footer className="d-flex justify-content-between w-100">
                <Button variant="secondary"  onClick={onHide}>Cancelar</Button>
                <Button variant="primary"  onClick={() => console.log("Ejemplo")}>Aceptar</Button>
            </Modal.Footer>
        </Modal>
    )
}
export default ModalEx