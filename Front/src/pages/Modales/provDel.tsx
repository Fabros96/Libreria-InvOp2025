import { Modal, Button, Form, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { showToasty } from "../../utils/toasty"

import "../../App.css";

interface ProvDelProps {
    proveedor: any | null;
    show: boolean;
    onHide: () => void;
    onDel: (updatedProveedor: any) => void;
}


const ProvDel = ({ show, onHide, proveedor, onDel }: ProvDelProps) => {

    //const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    //const [selectedName, setSelectedName] = useState<string>("");

    //useEffect(() => {

      //  setSelectedUuid(proveedor.uuid || "");
        //setSelectedName(proveedor.displayName || "");

    //}, [proveedor]);

    //const handleDel = () => {
      //  if (!selectedUuid) return;
        //if (proveedor) {
          //  const updatedProveedor = {
            //    ...proveedor,
              //  displayName: selectedName
            //};
            //showToasty('Proveedor eliminado exitosamente', 'success');
            //onDel(updatedProveedor);
        //}
    //};

    const handleDel = () => {
    if (!proveedor) return;
    showToasty('Proveedor eliminado exitosamente', 'success');
    onDel(proveedor);
};

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Dar de Baja
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>


                    <Table className="tableProveedores">
                        <tbody>
                            <>
                                <tr >
                                    <td colSpan={2}><p>¿Seguro quiere eliminar a...</p></td>
                                </tr>
                                <tr key={proveedor.idProveedor}>
                                    <td style={{ width: '30%' }}>
                                        <p>{proveedor.idProveedor}</p>
                                    </td>
                                    <td style={{ width: '70%' }}>
                                        <p>{proveedor.nombre}</p>
                                    </td>
                                </tr>
                            </>


                        </tbody>
                    </Table>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="outline-success"
                    onClick={handleDel}
                >
                    Dar de Baja
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProvDel;
