import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"
import ProvAsoc from "./provAsoc";



import "../../App.css";

interface ProvEditProps {
    show: boolean;
    onHide: () => void;
    proveedor: any | null;
    onSave: (updatedProveedor: any) => void;
    mode: "edit" | "new";
}

const ProvEdit = ({ show, onHide, proveedor, onSave, mode }: ProvEditProps) => {
    const [idProveedor, setIdProveedor] = useState("");
    const [nombre, setNombre] = useState("");
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<any | null>(null);
    



    useEffect(() => {
        if (mode === "edit" && proveedor) {
            setIdProveedor(proveedor.idProveedor || "");
            setNombre(proveedor.nombre || "");


        } else if (mode === "new") {
            // Limpiar todo
            setIdProveedor("");
            setNombre("");

        }
    }, [proveedor, mode]);

    const handleSave = () => {
        const updatedProveedor = mode === "edit"
            ? {
                ...proveedor,
                nombre: nombre,
                idProveedor: idProveedor,
            }
            : {
                idProveedor,
                nombre,
            };

        showToasty('Proveedor guardado exitosamente', 'success');
        onSave(updatedProveedor);
    };

    const handleProveedorSeleccionado = (selectedProv: any) => {
        setSelectedProveedor(selectedProv);
        setIdProveedor(selectedProv.idProveedor || "");
        setNombre(selectedProv.nombre || "");
        setShowProveedorModal(false);
    };




    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Editar Proveedor" : "Nuevo Proveedor"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Codigo</Form.Label>
                    <div style={{ display: 'flex', gap: '50px' }}>

                        <Form.Control
                            type="text"
                            value={idProveedor}
                            onChange={(e) => setIdProveedor(e.target.value)}
                            disabled={mode === "edit"}
                        />
                        <Button onClick={() => setShowProveedorModal(true)}>Articulo/s</Button>

                    </div>

                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}

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
            <ProvAsoc
                show={showProveedorModal}
                onHide={() => setShowProveedorModal(false)}
                // onSave={handleProveedorSeleccionado}
                proveedor={selectedProveedor}
                onSiguiente={function (articulosSeleccionados: any[]): void {
                    throw new Error("Function not implemented.");
                }} />



        </Modal>
    );
};

export default ProvEdit;
