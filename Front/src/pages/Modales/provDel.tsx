import { Modal, Button, Form, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import { showToasty } from "../../utils/toasty"

import "../../App.css";

interface ProvDelProps {
    agent: any | null;
    show: boolean;
    onHide: () => void;
    onDel: (updatedAgent: any) => void;
}



const ProvDel = ({ show, onHide, agent, onDel }: ProvDelProps) => {

    const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string>("");

    useEffect(() => {

        setSelectedUuid(agent.uuid || "");
        setSelectedName(agent.displayName || "");

    }, [agent]);

    const handleDel = () => {
        if (!selectedUuid) return;
        if (agent) {
            const updatedAgent = {
                ...agent,
                displayName: selectedName
            };
            showToasty('Artículo eliminado exitosamente', 'success');
            onDel(updatedAgent);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Eliminar Artículo
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>


                    <Table className="tableArticulos">
                        <tbody>
                            <>
                                <tr >
                                    <td colSpan={2}><p>¿Seguro quiere eliminar a...</p></td>
                                </tr>
                                <tr key={agent.uuid}>
                                    <td style={{ width: '30%' }}>
                                        <p>{agent.uuid}</p>
                                    </td>
                                    <td style={{ width: '70%' }}>
                                        <p>{agent.displayName}</p>
                                    </td>
                                </tr>
                            </>


                        </tbody>
                    </Table>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="outline-success"
                    onClick={handleDel}
                >
                    Eliminar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProvDel;
