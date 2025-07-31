import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";

import "../../App.css";

interface VtaNewProps {
    show: boolean;
    onHide: () => void;
    onSelect: (articulo: any) => void; // nuevo prop
    onSave: (venta: any) => void; // nuevo prop para manejar la venta creada
}


type VentasData = {
    datos: any[];
};

const VtaNew = ({ show, onHide, onSelect, onSave }: VtaNewProps) => {
    const [data, setData] = useState<VentasData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get(`articulos/?filter[fechaBaja][eq]=null&filter[include]=inventario,articuloProveedorList.proveedor`);
                const allData = response?.data?.datos || response?.data || [];

                // Filtrado: solo los que tienen articuloProveedorList con al menos un elemento
                const filteredData = allData.filter((item: { articuloProveedorList: string | any[]; }) =>
                    Array.isArray(item.articuloProveedorList) && item.articuloProveedorList.length > 0
                );

                setData({ datos: filteredData });

                if (filteredData.length <= 5) setShowAll(true);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, [show]);




    const handleSeleccionar = (item: any) => {

        onSelect(item);
        onHide();
        // Si necesitás pasar este artículo al padre, agregamos un prop como:
        // onSelect(item); <-- lo agregamos luego si querés
    };

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const getFilteredData = () => {
        if (showAll) return data.datos;

        if (searchText.trim() === "") return data.datos;
        const textoBusqueda = normalizarTexto(searchText);

        return data.datos.filter(art => {
            const descripcion = normalizarTexto(art.descripcion || "");
            const idArticulo = normalizarTexto(art.idArticulo || "");

            return (
                descripcion.includes(textoBusqueda) ||
                idArticulo.includes(textoBusqueda)
            );
        });
    };

    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Seleccione un artículo
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            id="srchArt"
                            placeholder="Buscar Artículo"
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
                                <th>Seleccionar</th>
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
                                    <tr key={obj.idArticulo}>
                                        <td style={{ width: '22%' }}>
                                            <p>{obj.idArticulo}</p>
                                        </td>
                                        <td style={{ width: '50%' }}>
                                            <p>{obj.descripcion}</p>
                                        </td>
                                        <td className="botoneraTabla">
                                            <Button
                                                style={{ width: '80%' }}
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleSeleccionar(obj)}
                                            >
                                                Seleccionar
                                            </Button>


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

export default VtaNew;
