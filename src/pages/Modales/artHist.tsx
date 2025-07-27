import { Modal, ModalFooter, Table } from "react-bootstrap";
import "../../App.css";
import axiosClient from "../../api/axiosClient";
import { useEffect, useState } from "react";

interface ArtHistProps {
    show: boolean;
    onHide: () => void;
    articulo: any | null;
}

const ArtHist = ({ show, onHide, articulo }: ArtHistProps) => {
    const [datos, setDatos] = useState<any[]>([]);

    useEffect(() => {
        if (articulo && show) {
            const fetchData = async () => {
                try {
                    const response = await axiosClient.get(
                        `ajuste-Inventarios/?filter[idArticulo][eq]=${articulo.idArticulo}`
                    );

                    if (Array.isArray(response.data) && response.data.length > 0) {
                        const ordenados = response.data.sort(
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
        }
    }, [articulo, show]);

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Cambios realizados en:
                    <br />
                    #{articulo?.idArticulo} — {articulo?.descripcion}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ maxHeight: "60vh", overflowY: "auto", width: '100%' }}>
                    <Table className="tableArticulos" striped bordered hover size="sm" style={{ textAlign: "center" }}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Atributo</th>
                                <th colSpan={3} style={{ width: '40%' }}>Cambio realizado</th>
                                <th>Modificado por</th>
                            </tr>
                        </thead>
                        <tbody>

                            {datos
                                .slice() // Para evitar mutar el array original
                                .sort((b, a) => {
                                    // Convierte a número si es necesario, o compara como strings
                                    const idA = parseInt(a.idAjusteInventario) || 0;
                                    const idB = parseInt(b.idAjusteInventario) || 0;
                                    return idA - idB;
                                })
                                .map((ai: any) => {

                                    const atributo =
                                        ai.atributo
                                        ?.startsWith("inventario.")
                                        ? ai.atributo.replace("inventario.", "")
                                        : ai.atributo?.startsWith("proveedor.proveedor.") ? ai.atributo.replace("proveedor.proveedor.", "") 
                                        :
                                        ai.atributo;

                                    const valorOriginal =
                                        ai.valorOriginal === "LF"
                                            ? "Lote Fijo"
                                            : ai.valorOriginal === "PF"
                                                ? "Periodo Fijo"
                                                : ai.valorOriginal;

                                    const valorNuevo =
                                        ai.valorNuevo === "LF"
                                            ? "Lote Fijo"
                                            : ai.valorNuevo === "PF"
                                                ? "Periodo Fijo"
                                                : ai.valorNuevo;

                                    return (
                                        <tr key={ai.idAjusteInventario}>
                                            <td><p>{ai.idAjusteInventario === "null" || ai.idAjusteInventario === "undefined" ? "-" : ai.idAjusteInventario}</p></td>
                                            <td>
                                                <p>
                                                    {ai.fecha === "null" || ai.fecha === "undefined"
                                                        ? "-"
                                                        : new Date(ai.fecha).toLocaleString("es-AR", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: false,
                                                        })}
                                                </p>
                                            </td>
                                            <td><p>{ai.atributo === "null" || ai.atributo === "undefined" ? "-" : atributo}</p></td>
                                            <td><p>{ai.valorOriginal === "null" || ai.valorOriginal === "undefined" ? "-" : valorOriginal}</p></td>
                                            <td>
                                                <p>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                                        className="bi bi-arrow-right-square" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd"
                                                            d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm4.5 5.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                                                    </svg>
                                                </p>
                                            </td>
                                            <td><p>{ai.valorNuevo === "null" || ai.valorNuevo === "undefined" ? "-" : valorNuevo}</p></td>
                                            <td><p>{ai.userName === "null" || ai.userName === "undefined" ? "-" : ai.userName}</p></td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <ModalFooter />
        </Modal>
    );
};

export default ArtHist;
