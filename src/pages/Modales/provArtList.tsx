import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty";

import "../../App.css";
import type { AxiosResponse } from "axios";

interface ProvProvProps {
    proveedor: any | null;
    show: boolean;
    onHide: () => void;
}

type ProveedoresData = {
    datos: any[];
};

const ProvProv = ({ proveedor, show, onHide }: ProvProvProps) => {
    const [data, setData] = useState<ProveedoresData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [selectedIdProveedor, setSelectedIdProveedor] = useState<number | null>(null);
    const [selectedNombre, setSelectedNombre] = useState<string>("");
    const [selectedDescripcion, setSelectedDescripcion] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: AxiosResponse<any, any> = await axiosClient.get(
                    `articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=proveedor,articulo&filter[articulo.fechaBaja][eq]=null&filter[fechaBaja][eq]=null`
                );

                const allData = response?.data?.datos || response?.data || [];
                setData({ datos: allData });
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        if (proveedor) {
            fetchData();
        }
    }, [proveedor]);

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const getFilteredData = () => {
        if (searchText.trim() === "") return data.datos;

        const textoBusqueda = normalizarTexto(searchText);

        return data.datos.filter(item => {
            const descripcion = normalizarTexto(item.articulo?.descripcion || "");
            const nombre = normalizarTexto(item.articulo?.nombre || "");

            return descripcion.includes(textoBusqueda) || nombre.includes(textoBusqueda);
        });
    };


    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Artículos asociados {proveedor ? "a " + proveedor.nombre : ""}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            id="srchArtProv"
                            placeholder="Buscar artículo"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setSearchText("")}
                        >
                            Limpiar
                        </Button>
                    </InputGroup>

                    <Table className="tableProveedores">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Descripción</th>
                                <th>Proveedor por defecto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted">
                                        <p>No se encontraron resultados.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((obj, index) => (
                                    <tr key={obj.articulo.idArticulo}>
                                        <td style={{ width: '22%' }}>
                                            <p>{obj.articulo.idArticulo}</p>
                                        </td>
                                        <td style={{ width: '50%' }}>
                                            <p>{obj.articulo.descripcion}</p>
                                        </td>
                                        <td className="botoneraTabla">
                                            <Form.Check
                                                type="checkbox"
                                                aria-label={`radio-${index}`}
                                                name="providerSelect"
                                                checked={obj.esPredeterminado}
                                                disabled
                                                onChange={() => {
                                                    const nuevosDatos = data.datos.map(item => ({
                                                        ...item,
                                                        esPredeterminado:
                                                            item.idProveedorProveedor === obj.idProveedorProveedor
                                                    }));

                                                    setData({ datos: nuevosDatos });
                                                    setSelectedIdProveedor(obj.idProveedor);
                                                    setSelectedDescripcion(obj.descripcion);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Form.Group>
            </Modal.Body>
        </Modal>
    );
};

export default ProvProv;
