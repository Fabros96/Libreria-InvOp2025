import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"

import "../../App.css";

interface ArtProvProps {
    agent: any | null;
    show: boolean;
    onHide: () => void;
    onSave: (updatedAgent: any) => void;
    mode: "provEdit" | "provNew";
}

type ArticulosData = {
    datos: any[];
};

const ArtProv = ({ show, onHide, onSave, mode }: ArtProvProps) => {
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get("agents");
                const allData = response.data || [];
                setData({ datos: allData });
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, []);

    const handleSave = () => {
        if (!selectedUuid) return;

        const selectedAgent = data.datos.find(agent => agent.uuid === selectedUuid);
        if (selectedAgent) {
            const updatedAgent = {
                ...selectedAgent,
                displayName: selectedName
            };
            showToasty('Proveedor actualizado exitosamente', 'success');
            onSave(updatedAgent);
        }
    };

    const getFilteredData = () => {
        if (showAll) return data.datos;
        if (searchText.trim() === "") return [];
        return data.datos.filter(agent =>
            agent.displayName?.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {mode === "provEdit" ? "Cambiar Proveedor" : "Nuevo Proveedor"}
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
                                filteredData.map((agent, index) => (
                                    <tr key={agent.uuid}>
                                        <td style={{ width: '22%' }}>
                                            <p>{agent.uuid}</p>
                                        </td>
                                        <td style={{ width: '50%' }}>
                                            <p>{agent.displayName}</p>
                                        </td>
                                        <td className="botoneraTabla">
                                            <Form.Check
                                                type="radio"
                                                aria-label={`radio-${index}`}
                                                name="providerSelect"
                                                checked={selectedUuid === agent.uuid}
                                                onChange={() => {
                                                    setSelectedUuid(agent.uuid);
                                                    setSelectedName(agent.displayName);
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

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant={selectedUuid ? "success" : "outline-success"}
                    onClick={handleSave}
                    disabled={!selectedUuid}
                >
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ArtProv;
