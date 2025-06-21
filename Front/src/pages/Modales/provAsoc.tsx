import { Modal, Button, Form, InputGroup, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

type ArticulosData = { datos: any[] };

interface ProvAsocProps {
    show: boolean;
    agent: any | null;
    onHide: () => void;
    onSelectMultiple: (selectedAgents: any[]) => void;
}


const ProvAsoc = ({ show, onHide, agent, onSelectMultiple }: ProvAsocProps) => {
    const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get("agents");
                setData({ datos: response.data || [] });
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };
        fetchData();
    }, []);

    const handleCheckboxChange = (uuid: string) => {
        setSelectedUuids(prev =>
            prev.includes(uuid)
                ? prev.filter(id => id !== uuid)
                : [...prev, uuid]
        );
    };

    const filteredData = showAll
        ? data.datos
        : searchText.trim() === ""
            ? []
            : data.datos.filter(agent =>
                agent.displayName?.toLowerCase().includes(searchText.toLowerCase())
            );

    const handleSiguiente = () => {
        
        const seleccionados = data.datos.filter(agent =>
            selectedUuids.includes(agent.uuid)
        );
        console.log(seleccionados)
        onSelectMultiple(seleccionados);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h3>Asociar Proveedor-Artículo/s</h3>
                    <h5>Proveedor: <strong>{agent.uuid+" -- "+agent.displayName}</strong></h5>
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
                        <Button variant="outline-secondary" onClick={() => {
                            setSearchText("");
                            setShowAll(true);
                        }}>
                            Mostrar todos
                        </Button>
                    </InputGroup>

                    <div className="tabla-scroll-proveedores">
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
                                                ? "Busca un proveedor."
                                                : "No se encontraron resultados."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((agent) => (
                                        <tr key={agent.uuid}>
                                            <td>{agent.uuid}</td>
                                            <td>{agent.displayName}</td>
                                            <td>
                                                <Form.Check
                                                    // type="checkbox"
                                                    type="radio"
                                                    checked={selectedUuids.includes(agent.uuid)}
                                                    onChange={() => handleCheckboxChange(agent.uuid)}
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
                <Button variant="outline-danger" onClick={onHide}>Cancelar</Button>
                <Button variant={selectedUuids.length > 0 ? "success" : "outline-success"} onClick={handleSiguiente} disabled={selectedUuids.length === 0}>Siguiente</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProvAsoc;