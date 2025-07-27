import { Modal, ModalFooter, Table } from "react-bootstrap";
import "../../App.css";
import axiosClient from "../../api/axiosClient";
import { useEffect, useState } from "react";

interface ArtDelHistProps {
    show: boolean;
    onHide: () => void;
}

const ArtDelHist = ({ show, onHide }: ArtDelHistProps) => {
    const [datos, setDatos] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(
                    `articulos/?filter[include]=ajusteInventarioList`
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
                    Artículos Eliminados:
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ maxHeight: "60vh", overflowY: "auto", width: '100%' }}>
                    <Table className="tableArticulos" striped bordered hover size="sm" style={{ textAlign: "center" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Artículo</th>
                                <th>Fecha Eliminación</th>
                                <th>Eliminado por</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((ai: any) => {
                                return (
                                    <tr key={ai.idArticulo} style={{ backgroundColor: "#ff4949c7" }}>
                                        <td><p>{ai.idArticulo === "null" || ai.idArticulo === "undefined" ? "-" : ai.idArticulo}</p></td>
                                        <td><p>{ai.descripcion === "null" || ai.descripcion === "undefined" ? "-" : ai.descripcion}</p></td>
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
                                            <p>{ai.ajusteInventarioList[ai.ajusteInventarioList.length - 1]?.userName == null ? "-" : ai.ajusteInventarioList[ai.ajusteInventarioList.length - 1]?.userName}</p>
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

export default ArtDelHist;
