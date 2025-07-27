import { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup, Table } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";

import "../styles/Articulos.css";
import "../styles/Proveedores.css";

type ArticulosData = { datos: any[] };

interface ProvAsocProps {
    show: boolean;
    proveedor: any | null;
    onHide: () => void;
    onSiguiente: (articulosSeleccionados: any[]) => void;
    articulosProveedorOriginalList: any[]; // <- nuevo prop
}

const ProvAsoc = ({
    show,
    proveedor,
    onHide,
    onSiguiente,
    articulosProveedorOriginalList,
}: ProvAsocProps) => {
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [selectedIdsArticulos, setSelectedIdsArticulos] = useState<string[]>([]);
    const [articulosProveedorSeleccionadosList, setArticulosProveedorSeleccionadosList] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);

    useEffect(() => {
        const fetchArticulos = async () => {
            try {
                const response = await axiosClient.get("articulos/?filter[fechaBaja][eq]=null");
                setData({ datos: response.data || [] });
            } catch (error) {
                console.error("Error al obtener artículos:", error);
            }
        };
        fetchArticulos();
    }, []);

    useEffect(() => {
        const ids = articulosProveedorOriginalList.map((ap) => ap.idArticulo.toString());
        setSelectedIdsArticulos(ids);
        setArticulosProveedorSeleccionadosList([]);
    }, [articulosProveedorOriginalList]);

    const articulosProveedorList =
        articulosProveedorSeleccionadosList.length > 0
            ? articulosProveedorSeleccionadosList
            : articulosProveedorOriginalList;

    const handleCheckboxChange = (idArticulo: string) => {
        setSelectedIdsArticulos((prev) =>
            prev.includes(idArticulo)
                ? prev.filter((id) => id !== idArticulo)
                : [...prev, idArticulo]
        );
    };

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const textoBusqueda = normalizarTexto(searchText.trim());

    const filteredData = showAll
        ? data.datos
        : textoBusqueda === ""
            ? data.datos
            : data.datos.filter((articulo) => {
                const descripcion = normalizarTexto(articulo.descripcion || "");
                const idArticulo = normalizarTexto(articulo.idArticulo?.toString() || "");
                return descripcion.includes(textoBusqueda) || idArticulo.includes(textoBusqueda);
            });

    const handleSiguiente = () => {
        const seleccionados = selectedIdsArticulos
            .map((idStr) => {
                const id = Number(idStr);

                const existente = articulosProveedorList.find((ap) => ap.idArticulo === id);
                if (existente) return existente;

                const nuevo = data.datos.find((art) => art.idArticulo === id);
                return nuevo || null;
            })
            .filter(Boolean);

        onSiguiente(seleccionados);
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h3>Asociar Proveedor-Artículo/s</h3>
                    <h5>
                        Proveedor:{" "}
                        {proveedor ? (
                            <strong>
                                {proveedor.idProveedor + " -- " + proveedor.nombre}
                            </strong>
                        ) : (
                            ""
                        )}
                    </h5>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            name="srchArticulos"
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
                                            <p>
                                                {searchText.trim() === "" && !showAll
                                                    ? "Busca un artículo para ver resultados."
                                                    : "No se encontraron resultados."}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((art) => (
                                        <tr key={art.idArticulo}>
                                            <td><p>{art.idArticulo}</p></td>
                                            <td><p>{art.descripcion}</p></td>
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    name="chbxArt"
                                                    checked={selectedIdsArticulos.includes(
                                                        art.idArticulo.toString()
                                                    )}
                                                    onChange={() =>
                                                        handleCheckboxChange(art.idArticulo.toString())
                                                    }
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
