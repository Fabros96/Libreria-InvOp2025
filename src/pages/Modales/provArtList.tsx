import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"

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
    const [showAll, setShowAll] = useState(true);
    const [selectedIdProveedor, setSelectedIdProveedor] = useState<number | null>(null);
    const [selectedNombre, setSelectedNombre] = useState<string>("");
    const [selectedDescripcion, setSelectedDescripcion] = useState<string>("");





    useEffect(() => {

        const fetchData = async () => {
            try {
                let response: AxiosResponse<any, any> | null = null;

                response = await axiosClient.get(`articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=proveedor,articulo&filter[articulo.fechaBaja][eq]=null`);

                const allData = response?.data?.datos || response?.data || [];

                setData({ datos: allData });


                if (allData.length <= 5) setShowAll(true);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, [proveedor]);




    const getFilteredData = () => {
        if (showAll) return data.datos;

        if (searchText.trim().length < 1) return data.datos;

        return data.datos.filter(proveedor =>
            proveedor.proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase())
            // proveedor.proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Proveedores {proveedor ? "de: " + proveedor.nombre : ""}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Buscar Proveedor"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setShowAll(false); // si se escribe, desactiva mostrar todos
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setSearchText("");
                                setShowAll(true);
                            }}
                        >
                            Mostrar todos
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
                                        <p>
                                            {searchText.trim() === "" && !showAll
                                                ? "Busca un proveedor para ver resultados."
                                                : "No se encontraron resultados."}
                                        </p>
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
                                                disabled={true}
                                                onChange={() => {
                                                    const nuevosDatos = data.datos.map((item) => ({
                                                        ...item,
                                                        esPredeterminado: item.idProveedorProveedor === obj.idProveedorProveedor
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
