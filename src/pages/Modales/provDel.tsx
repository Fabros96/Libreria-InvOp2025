import { Modal, Button, Form, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { showToasty } from "../../utils/toasty"

import "../../App.css";
import axiosClient from "../../api/axiosClient";

interface ProvDelProps {
    proveedor: any | null;
    show: boolean;
    onHide: () => void;
    onDel: (updatedProveedor: any) => void;
}


const ProvDel = ({ show, onHide, proveedor, onDel }: ProvDelProps) => {

    const handleDel = async () => {

        if (!proveedor) return;

        try {
            // Validamos si es Predeterminado primero
            const responseEsPredeterminado = await axiosClient.get(`articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=articulo&filter[articulo.fechaBaja][eq]=null`);

            const lista = responseEsPredeterminado.data;

            if (Array.isArray(lista) && lista.some(item => item.esPredeterminado === true)) {
                showToasty('No se puede eliminar este proveedor, es predeterminado de al menos un artículo', 'error');
                return
            }

            // Validamos órdenes pendientes o enviadas
            const responsePendiente = await axiosClient.get(
                `orden-compras/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Pendiente`
            );
            const responseEnviada = await axiosClient.get(
                `orden-compras/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Enviado`
            );



            const pendientes: any[] = responsePendiente.data || [];
            const enviadas: any[] = responseEnviada.data || [];

            const tieneOrdenes = pendientes.length > 0 || enviadas.length > 0;

            if (tieneOrdenes) {
                if (pendientes.length > 0) {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes pendientes', 'error');
                }
                if (enviadas.length > 0) {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes enviadas', 'error');
                }
                if (pendientes.length > 0 && enviadas.length > 0) {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes pendientes y enviadas', 'error');
                }
            } else {
                showToasty('Proveedor eliminado exitosamente', 'success');
                onDel(proveedor);
            }
        } catch (error) {
            console.error("El Error es: ", error);
            showToasty('Error al verificar datos del proveedor', 'error');
        }
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
