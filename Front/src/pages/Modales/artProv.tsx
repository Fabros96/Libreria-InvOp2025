import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"

import "../../App.css";
import type { AxiosResponse } from "axios";

interface ArtProvProps {
    articulo: any | null;
    show: boolean;
    onHide: () => void;
    onSave: (updatedArticulo: any) => void;
    mode: "provView" | "provEdit" | "provNew";
}

type ArticulosData = {
    datos: any[];
};

const ArtProv = ({ articulo, show, mode, onHide, onSave }: ArtProvProps) => {
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);
    const [selectedIdArticulo, setSelectedIdArticulo] = useState<number | null>(null);
    const [selectedIdProveedor, setSelectedIdProveedor] = useState<number | null>(null);
    const [selectedNombre, setSelectedNombre] = useState<string>("");
    const [selectedDescripcion, setSelectedDescripcion] = useState<string>("");





    useEffect(() => {

        const fetchData = async () => {
            try {
                let response: AxiosResponse<any, any> | null = null;
                if (mode === "provEdit" || mode === "provView") {
                    response = await axiosClient.get(`articulo-proveedores/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=proveedor`);
                } else if (mode === "provNew") {
                    response = await axiosClient.get(`proveedores/`);
                }
                const allData = response?.data?.datos || response?.data || [];

                setData({ datos: allData });


                if (allData.length <= 5) setShowAll(true);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, [articulo, mode]);



    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await axiosClient.get(`articulo-proveedores/?filter[idArticulo][eq]=${articulo.idArticulo}`);
    //             const allData = response.data || [];
    //             setData({ datos: allData });
    //         } catch (error) {
    //             console.error("Error al obtener datos:", error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    const handleSave = () => {
        const selectedArticulo = data.datos.find(articulo => articulo.idArticulo === selectedIdArticulo);
        if (selectedArticulo) {
            const updatedArticulo = {
                ...selectedArticulo,
                descripcion: selectedDescripcion
            };
            showToasty('Proveedor actualizado exitosamente', 'success');
            onSave(updatedArticulo);
        }
    };

    const getFilteredData = () => {
        if (showAll) return data.datos;

        if (searchText.trim().length < 1) return data.datos;

        return data.datos.filter(articulo =>
            articulo.proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase())
            // articulo.proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Proveedores {articulo ? "de: " + articulo.descripcion : ""}
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

                    <Table className="tableArticulos">
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
                                    mode === "provNew"?
                                    <tr key={obj.idProveedor}>
                                        <td style={{ width: '22%' }}>
                                            <p>{obj.idProveedor}</p>
                                        </td>
                                        <td style={{ width: '50%' }}>
                                            <p>{obj.nombre}</p>
                                        </td>
                                        <td className="botoneraTabla">
                                            <Form.Check
                                                type="radio"
                                                aria-label={`radio-${index}`}
                                                name="providerSelect"
                                                onChange={() => {
                                                    const nuevosDatos = data.datos.map((item) => ({
                                                        ...item,
                                                        esPredeterminado: item.idArticuloProveedor === obj.idArticuloProveedor
                                                    }));
                                                    console.log(obj.nombre);
                                                    setData({ datos: nuevosDatos });
                                                    setSelectedIdProveedor(obj.idProveedor);
                                                    setSelectedNombre(obj.nombre);
                                                }}
                                            />


                                        </td>
                                    </tr>
                                    :
                                    <tr key={obj.proveedor.nombre}>
                                        <td style={{ width: '22%' }}>
                                            <p>{obj.proveedor.idProveedor}</p>
                                        </td>
                                        <td style={{ width: '50%' }}>
                                            <p>{obj.proveedor.nombre}</p>
                                        </td>
                                        <td className="botoneraTabla">
                                            <Form.Check
                                                type="radio"
                                                aria-label={`radio-${index}`}
                                                name="providerSelect"
                                                checked={obj.esPredeterminado}
                                                disabled={mode === "provView"}
                                                onChange={() => {
                                                    const nuevosDatos = data.datos.map((item) => ({
                                                        ...item,
                                                        esPredeterminado: item.idArticuloProveedor === obj.idArticuloProveedor
                                                    }));

                                                    setData({ datos: nuevosDatos });
                                                    setSelectedIdArticulo(obj.idArticulo);
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
            </Modal.Body><>
                {mode !== "provView" && (
                    <Modal.Footer>
                        <Button variant="outline-danger" onClick={onHide}>
                            Cancelar
                        </Button>
                        <Button
                            variant={selectedIdArticulo ? "success" : "outline-success"}
                            onClick={handleSave}
                            disabled={!selectedIdArticulo}
                        >
                            Guardar
                        </Button>
                    </Modal.Footer>
                )}
            </>

        </Modal>
    );
};

export default ArtProv;
