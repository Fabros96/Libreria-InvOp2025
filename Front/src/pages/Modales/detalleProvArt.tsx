import { Modal, Tab, Tabs, Button, Stack } from "react-bootstrap";
import { useState } from "react";

type ProvTabsModalProps = {
    show: boolean;
    onHide: () => void;
    proveedores: any[];
    limpiarProveedores: () => void;
};

const DetalleProvArt = ({ show, onHide, proveedores }: ProvTabsModalProps) => {
    const [activeKey, setActiveKey] = useState(proveedores.length > 0 ? proveedores[0].uuid : '');

    const currentIndex = proveedores.findIndex(p => p.uuid === activeKey);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setActiveKey(proveedores[currentIndex - 1].uuid);
        }
    };

    const handleNext = () => {
        if (currentIndex < proveedores.length - 1) {
            setActiveKey(proveedores[currentIndex + 1].uuid);
        } else {
            onHide(); // Finalizar cierra el modal
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header>
                <Button variant="secondary" onClick={onHide}>Volver</Button>
                <Modal.Title className="ms-3">Detalles Artículo/s - Proveedor {}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || '')} id="prov-tabs" className="mb-3">
                    {proveedores.map((prov) => (
                        <Tab eventKey={prov.uuid} title={prov.displayName} key={prov.uuid}>
                            {/* Acá podés poner cualquier contenido para el proveedor */}
                            <div>Detalles y/o formulario para {prov.displayName}</div>
                        </Tab>
                    ))}
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <Stack direction="horizontal" gap={2} className="w-100 justify-content-between">
                    <Button variant="primary" disabled={currentIndex === 0} onClick={handlePrev}>
                        Anterior
                    </Button>
                    <Button variant="success" onClick={handleNext}>
                        {currentIndex === proveedores.length - 1 ? "Finalizar" : "Siguiente"}
                    </Button>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleProvArt;
