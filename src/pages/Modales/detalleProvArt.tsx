import { Modal, Tab, Tabs, Button, Stack } from "react-bootstrap";
import { useState, useEffect } from "react";

// Define o importá el tipo Proveedor
type Proveedor = {
    idProveedor: number;
    nombre: string;
    // Podés agregar otras propiedades si necesitás
};

type ProvTabsModalProps = {
    show: boolean;
    onHide: () => void;
    proveedor: Proveedor[];
    articulos: any[];
    onVolver?: () => void;
};

const DetalleProvArt = ({ show, onHide, proveedor, articulos, onVolver }: ProvTabsModalProps) => {
    const [activeKey, setActiveKey] = useState<string>(
        articulos.length > 0 ? articulos[0].idArticulo.toString() : ''
    );

    useEffect(() => {
        if (articulos.length > 0) {
            setActiveKey(articulos[0].idArticulo.toString());
        }
    }, [articulos]);

    const currentIndex = articulos.findIndex(p => p.idArticulo.toString() === activeKey);

    const handlePrev = () => {
        if (currentIndex > 0) {
            setActiveKey(articulos[currentIndex - 1].idArticulo.toString());
        }
    };

    const handleNext = () => {
        if (currentIndex < articulos.length - 1) {
            setActiveKey(articulos[currentIndex + 1].idArticulo.toString());
        } else {
            onHide(); // Finalizar cierra el modal
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header>
                <Button variant="secondary" onClick={onHide}>Volver</Button>
                <Modal.Title className="ms-3">
                    Detalles Artículo/s - Proveedor
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs
                    activeKey={activeKey}
                    onSelect={(k) => setActiveKey(k || '')}
                    id="prov-tabs"
                    className="mb-3"
                >
                    {articulos.map((art) => (
                        <Tab
                            eventKey={art.idArticulo.toString()}
                            title={art.descripcion || "Sin nombre"}
                            key={art.idArticulo}
                        >
                            <div>Detalles y/o formulario para {art.descripcion}</div>
                        </Tab>
                    ))}
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <Stack direction="horizontal" gap={2} className="w-100 justify-content-between">
                    <Button
                        variant="primary"
                        disabled={currentIndex === 0}
                        onClick={handlePrev}
                    >
                        Anterior
                    </Button>
                    <Button variant="success" onClick={handleNext}>
                        {currentIndex === articulos.length - 1 ? "Finalizar" : "Siguiente"}
                    </Button>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleProvArt;
