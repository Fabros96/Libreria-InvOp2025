import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"
import ArtProv from "./artProv"; // ajustá el path si está en otra carpeta

import "../../App.css";

interface ArtEditProps {
    show: boolean;
    onHide: () => void;
    agent: any | null;
    onSave: (updatedAgent: any) => void;
    mode: "edit" | "new";
}

const ArtEdit = ({ show, onHide, agent, onSave, mode }: ArtEditProps) => {
    const [uuid, setUuid] = useState("");
    const [name, setName] = useState("");
    const [stock, setStock] = useState(0);
    const [price, setPrice] = useState(0);
    const [modelo, setModelo] = useState("1");
    const [rotacion, setRotacion] = useState(0);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedor, setProveedor] = useState<any | null>(null);



    useEffect(() => {
        if (mode === "edit" && agent) {
            setUuid(agent.uuid || "");
            setName(agent.displayName || "");
            setStock(agent.stock || 0);
            setPrice(agent.price || 0);
            setModelo(agent.modeloInventario || "1");
            setRotacion(agent.tasaRotacion || 0);
        } else if (mode === "new") {
            // Limpiar todo
            setUuid("");
            setName("");
            setStock(0);
            setPrice(0);
            setModelo("1");
            setRotacion(0);
        }
    }, [agent, mode]);

    const handleSave = () => {
        if (!agent) return;

        const updatedAgent = {
            ...agent, // esto mantiene el id original
            displayName: name
            // otros campos...
        };
        showToasty('Artículo actualizado exitosamente', 'success');
        onSave(updatedAgent);
    };

    const handleProveedorSeleccionado = (selectedProv: any) => {
        setProveedor(selectedProv);
        setShowProveedorModal(false);
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Editar Artículo" : "Nuevo Artículo"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Codigo</Form.Label>
                    <Form.Control
                        type="text"
                        value={uuid}
                        onChange={(e) => setUuid(e.target.value)}
                        disabled={mode === "edit"}
                    />

                    <Form.Label>Descripcion</Form.Label>
                    <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}

                    />

                    <Form.Label>Stock</Form.Label>
                    <Form.Control
                        type="number"
                        min={0}
                        max={9999999}
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                    />

                    <Form.Label>Precio</Form.Label>
                    <Form.Control
                        type="number"
                        min={0}
                        max={9999999}
                        step={0.01}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Label>Modelo de Inventario</Form.Label>
                        <Form.Label>Proveedor</Form.Label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '100px' }}>

                        <Form.Select
                            value={modelo}
                            disabled={mode === "edit"}
                            onChange={(e) => setModelo(e.target.value)}
                        >
                            <option value="1">One</option>
                            <option value="2">Two</option>
                        </Form.Select>
                        <Button onClick={() => setShowProveedorModal(true)}>{proveedor?.displayName || "Seleccionar..."}</Button>
                    </div>
                    <Form.Label>Tasa de Rotación</Form.Label>
                    <Form.Control
                        type="number"
                        min={0}
                        max={9999999}
                        step={0.01}
                        value={rotacion}
                        onChange={(e) => setRotacion(Number(e.target.value))}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="outline-success" onClick={handleSave}>
                    Guardar
                </Button>
            </Modal.Footer>
            <ArtProv
                show={showProveedorModal}
                onHide={() => setShowProveedorModal(false)}
                agent={mode === "edit" ? agent : null} // o podés pasar el proveedor actual si estás editando
                onSave={handleProveedorSeleccionado}
                mode={mode === "edit" ? "provEdit" : "provNew"}
            />


        </Modal>
    );
};

export default ArtEdit;
