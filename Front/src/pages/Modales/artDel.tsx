import { Modal, Button, Form, Table } from "react-bootstrap";
import { showToasty } from "../../utils/toasty"

import "../../App.css";

interface ArtDelProps {
    articulo: any | null;
    show: boolean;
    onHide: () => void;
    onDel: (articuloToDelete: any) => void;
}



const ArtDel = ({ show, onHide, articulo, onDel }: ArtDelProps) => {


    const handleDel = () => {
        if (articulo) {
            showToasty('Artículo eliminado exitosamente', 'success');
            onDel(articulo);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Eliminar Artículo
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    {/* Si el artículo no existe, no deberíamos mostrar el modal, pero es una buena práctica comprobarlo. */}
                    {!articulo ? <p>No se ha seleccionado ningún artículo.</p> : (
                        <Table className="tableArticulos">
                            <tbody>
                                <>
                                    <tr >
                                        <td colSpan={2}><p>¿Seguro quiere eliminar</p></td>
                                    </tr>
                                    <tr key={articulo.uuid}>
                                        <td style={{ width: '30%' }}>
                                            <p>{articulo.idArticulo}</p>
                                        </td>
                                        <td style={{ width: '70%' }}>
                                            <p>{articulo.descripcion}</p>
                                        </td>
                                    </tr>
                                </>
                            </tbody>
                        </Table>
                    )}
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="outline-success"
                    onClick={handleDel}
                >
                    Eliminar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ArtDel;
