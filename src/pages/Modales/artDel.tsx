import { Modal, Button, Form, Table } from "react-bootstrap";
import { showToasty } from "../../utils/toasty"

import "../../App.css";
import axiosClient from "../../api/axiosClient";
import { useState } from "react";


type Articulo = {
    idArticulo: number;
    idProveedor: number;
    idInventario: number;
    fechaBaja: Date | null;
    descripcion: string;
    modeloInventario: number;
    stock: number;
}


interface ArtDelProps {
    articulo: any | null;
    show: boolean;
    onHide: () => void;
    onDel: (articuloToDelete: any) => void;
}

type ArticulosData = {
    datos: any[];
    totalPages: number;
};





const ArtDel = ({ show, onHide, articulo, onDel }: ArtDelProps) => {

    const [data, setData] = useState<ArticulosData>({ datos: [], totalPages: 0 });
    const [showModal, setShowModal] = useState(false);

    const handleDel = async () => {
        try {
            // Validamos stock primero
            if (articulo.stock > 0) {
                showToasty('No se puede eliminar, todavía tiene stock disponible', 'error');
                return;
            }

            // Validamos órdenes pendientes o enviadas
            const responsePendiente = await axiosClient.get(
                `orden-compras/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Pendiente`
            );
            const responseEnviada = await axiosClient.get(
                `orden-compras/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Enviado`
            );


            const pendientes: any[] = responsePendiente.data || [];
            const enviadas: any[] = responseEnviada.data || [];

            const tieneOrdenes = pendientes.length > 0 || enviadas.length > 0;

            if (tieneOrdenes) {
                if (pendientes.length > 0) {
                    showToasty('No se puede eliminar el artículo, tiene órdenes pendientes', 'error');
                }
                if (enviadas.length > 0) {
                    showToasty('No se puede eliminar el artículo, tiene órdenes enviadas', 'error');
                }
                if (pendientes.length > 0 && enviadas.length > 0) {
                    showToasty('No se puede eliminar el artículo, tiene órdenes pendientes y enviadas', 'error');
                }
            } else {
                handleDelArticulo(articulo);
            }
        } catch (error) {
            console.error("El Error es: ", error);
            showToasty('Error al verificar datos del artículo', 'error');
        }
    };

    const handleDelArticulo = (articuloToDelete: Articulo) => {
        axiosClient.delete(`/articulos/${articuloToDelete.idArticulo}`)
            .then(() => {
                setData(prevData => {
                    const nuevosDatos = prevData.datos.filter(
                        articulo => articulo.idArticulo !== articuloToDelete.idArticulo
                    );
                    return {
                        ...prevData,
                        datos: nuevosDatos
                    };
                });
                showToasty('Artículo eliminado exitosamente', 'success');
                setShowModal(false);
            })
            .catch(error => {
                console.error("Error al eliminar el artículo:", error);
                showToasty('No se pudo eliminar el artículo. Intente nuevamente.', 'error');
            });
        onDel(articulo);
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
                                    <tr key={articulo.idArticulo}>
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


