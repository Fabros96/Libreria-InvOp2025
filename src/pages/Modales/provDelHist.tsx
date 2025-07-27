import { Modal, ModalFooter, Table } from "react-bootstrap";
import "../../App.css";
import axiosClient from "../../api/axiosClient";
import { useEffect, useState } from "react";

interface ProvDelHistProps {
    show: boolean;
    onHide: () => void;
}

const ProvDelHist = ({ show, onHide }: ProvDelHistProps) => {
    const [datos, setDatos] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(
                    `proveedores/`
                );
                const conFechaBaja = response.data.filter((p: any) => !!p.fechaBaja);

                if (Array.isArray(conFechaBaja) && conFechaBaja.length > 0) {
                    const ordenados = conFechaBaja.sort(
                        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                    );
                    setDatos(ordenados);
                } else {
                    setDatos([]);
                }
            } catch (error) {
                console.error("❌ Error al traer historial:", error);
            }
        };

        fetchData();
    }, [show]);


    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Proveedores Eliminados:
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ maxHeight: "60vh", overflowY: "auto", width: '100%' }}>
                    <Table className="tableArticulos" striped bordered hover size="sm" style={{ textAlign: "center" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Proveedor</th>
                                <th>Fecha Eliminación</th>
                                <th>Eliminado por</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((ai: any) => {
                                return (
                                    <tr key={ai.idProveedor} style={{ backgroundColor: "#ff4949c7" }}>
                                        <td><p>{ai.idProveedor === "null" || ai.idProveedor === "undefined" ? "-" : ai.idProveedor}</p></td>
                                        <td><p>{ai.nombre === "null" || ai.nombre === "undefined" ? "-" : ai.nombre}</p></td>
                                        <td>
                                            <p>
                                                {ai.fechaBaja === "null" || ai.fechaBaja === "undefined"
                                                    ? "-"
                                                    : new Date(ai.fechaBaja).toLocaleString("es-AR", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                    })}
                                            </p>
                                        </td>
                                        <td>
                                            <p>Usuario</p>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <ModalFooter />
        </Modal>
    );
};

export default ProvDelHist;
