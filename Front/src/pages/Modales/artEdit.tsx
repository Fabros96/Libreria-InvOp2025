import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"
import ArtProv from "./artProv"; // ajustá el path si está en otra carpeta

import "../../App.css";



interface ArtEditProps {
    show: boolean;
    onHide: () => void;
    articulo: any | null;
    onSave: (updatedArticulo: any) => void;
    mode: "edit" | "new";
    precio: number;
}

const ArtEdit = ({ show, onHide, articulo,  onSave, mode}: ArtEditProps) => {
    const [idArticulo, setIdArticulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [stock, setStock] = useState(0);
    const [precio, setPrecio] = useState(0);
    const [modelo, setModelo] = useState(1);
    const [demanda, setDemanda] = useState(0);
    const [costoAlmacenamiento, setCostoAlmacenamiento] = useState(0);
    const [costoPedido, setCostoPedido] = useState(0);
    const [costoCompra, setCostoCompra] = useState(0);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedor, setProveedor] = useState<any | null>(null);



    useEffect(() => {
        if (mode === "edit" && articulo) {
            setIdArticulo(articulo.idArticulo || "");
            setDescripcion(articulo.descripcion || "");
            setStock(articulo.stock || 0);
            // setPrecio( || 0); QUE PONGO EN PRECIO? O COMO LLEGO?
            setModelo(articulo.modeloInventario || 0);
            setDemanda(articulo.demanda || 0);
            setCostoAlmacenamiento(articulo.cAlmacenamiento || 0);
            setCostoPedido(articulo.cPedido || 0);
            setCostoCompra(articulo.cCompra || 0);
        } else if (mode === "new") {
            // Limpiar todo
            setIdArticulo("");
            setDescripcion("");
            setStock(0);
            setModelo(0);
            setDemanda(0);
            setCostoAlmacenamiento(0);
            setCostoPedido(0);
            setCostoCompra(0);
        }
    }, [articulo, mode]);

    const handleSave = () => {
        if (!articulo) return;

        const updatedArticulo = {
            ...articulo, // esto mantiene el id original
            descripcion: name
            // otros campos...
        };
        showToasty('Artículo actualizado exitosamente', 'success');
        onSave(updatedArticulo);
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
                        value={idArticulo}
                        onChange={(e) => setIdArticulo(e.target.value)}
                        disabled={mode === "edit"}
                    />

                    <Form.Label>Descripcion</Form.Label>
                    <Form.Control
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}

                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                        <Form.Label>Stock</Form.Label>
                        <Form.Label>Precio</Form.Label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <Form.Control
                            type="number"
                            min={0}
                            max={9999999}
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                        />
                        <Form.Control
                            type="number"
                            min={0}
                            max={9999999}
                            step={0.01}
                            value={precio}
                            onChange={(e) => setPrecio(Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Label>Modelo de Inventario</Form.Label>
                        <Form.Label>Proveedor predeterminado</Form.Label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '100px' }}>
                        <Form.Select aria-label="Default select example" onChange={(e) => setModelo(Number(e.target.value)) }>
                            <option>Modelos...</option>
                            <option value="1001">One</option>
                            <option value="1002">Two</option>
                            <option value="1003">Three</option>
                            
                        </Form.Select>
                        
                        <Button onClick={() => setShowProveedorModal(true)}>{proveedor?.descripcion || "Seleccionar..."}</Button>
                    </div>
                    <Form.Label>Demanda</Form.Label>

                    <Form.Control
                        type="number"
                        min={0}
                        max={9999999}
                        step={0.01}
                        value={demanda}
                        onChange={(e) => setDemanda(Number(e.target.value))}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2px', marginTop: '25px' }}>

                        <div style={{ width: '30%' }}>
                            <Form.Label>Costo Almacenamiento</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={9999999}
                                step={0.01}
                                value={costoAlmacenamiento}
                                onChange={(e) => setCostoAlmacenamiento(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ width: '30%' }}>
                            <Form.Label>Costo Pedido</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={9999999}
                                step={0.01}
                                value={costoPedido}
                                onChange={(e) => setCostoPedido(Number(e.target.value))}
                            />
                        </div>
                        <div style={{ width: '30%' }}>
                            <Form.Label>Costo Compra</Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                max={9999999}
                                step={0.01}
                                value={costoCompra}
                                onChange={(e) => setCostoCompra(Number(e.target.value))}
                            />
                        </div>
                    </div>
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
                articulo={mode === "edit" ? articulo : null} 
                onSave={handleProveedorSeleccionado}
                mode={mode === "edit" ? "provEdit" : mode === "new" ? "provNew" : "provView"}
            />


        </Modal>
    );
};

export default ArtEdit;
