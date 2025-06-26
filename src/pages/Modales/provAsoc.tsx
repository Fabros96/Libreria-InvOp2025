import { Modal, Button, Form, InputGroup, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

import "../styles/Articulos.css"
import "../styles/Proveedores.css"

type ArticulosData = { datos: any[] };

interface ProvAsocProps {
    show: boolean;
    proveedor: any | null;
    onHide: () => void;
    onSiguiente: (articulosSeleccionados: any[]) => void;
}

const ProvAsoc = ({ show, onHide, proveedor, onSiguiente }: ProvAsocProps) => {
    const [selectedIdsArticulos, setSelectedIdsArticulos] = useState<string[]>([]);
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);

    // 🔁 Cargar todos los artículos una vez
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get("articulos");
                setData({ datos: response.data || [] });
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };
        fetchData();
    }, []);

    // 🔁 Cuando cambia el proveedor, marcamos los artículos ya asociados
    useEffect(() => {
        if (proveedor?.articulosProveedor) {
            const articulosAsociados = proveedor.articulosProveedor.map((ap: any) => ap.idArticulo?.toString());
            setSelectedIdsArticulos(articulosAsociados);
        } else {
            setSelectedIdsArticulos([]);
        }
    }, [proveedor]);

    const handleCheckboxChange = (idArticulo: string) => {
        setSelectedIdsArticulos((prev) =>
            prev.includes(idArticulo)
                ? prev.filter((id) => id !== idArticulo)
                : [...prev, idArticulo]
        );
    };

    const filteredData = showAll
        ? data.datos
        : searchText.trim() === ""
            ? []
            : data.datos.filter((articulo) =>
                articulo.descripcion?.toLowerCase().includes(searchText.toLowerCase())
            );

    const handleSiguiente = () => {
        const seleccionados = data.datos.filter((art) =>
            selectedIdsArticulos.includes(art.idArticulo.toString())
        );
        onSiguiente(seleccionados);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h3>Asociar Proveedor-Artículo/s</h3>
                    <h5>
                        Proveedor: <strong>{proveedor?.idProveedor + " -- " + proveedor?.nombre}</strong>
                    </h5>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Buscar Artículo/s"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setShowAll(false);
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

                    <div className="tableProveedores">
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Descripción</th>
                                    <th>Seleccionar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted">
                                            {searchText.trim() === "" && !showAll
                                                ? "Busca un artículo para ver resultados."
                                                : "No se encontraron resultados."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((art) => (
                                        <tr key={art.idArticulo}>
                                            <td>{art.idArticulo}</td>
                                            <td>{art.descripcion}</td>
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedIdsArticulos.includes(art.idArticulo.toString())}
                                                    onChange={() => handleCheckboxChange(art.idArticulo.toString())}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button
                    variant="success"
                    onClick={handleSiguiente}
                    disabled={selectedIdsArticulos.length === 0}
                >
                    Siguiente
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProvAsoc;
