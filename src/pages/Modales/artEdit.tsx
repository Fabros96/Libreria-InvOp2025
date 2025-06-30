import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty";
import ArtProv from "./artProv";

import "../../App.css";
import { calcularDatosInventario } from "../../utils/recalcular";


interface Articulo {
    descripcion: string;
    fechaBaja?: Date | null;
    idArticulo?: number;
    idInventario?: number;
    modeloInventario: string;
    stock: number;
    inventario?: Inventario;
    articuloProveedor?: ArticuloProveedor;
}

interface Inventario {
    costoAlmacenamiento: number;
    costoPedido: number;
    demandaArticulo: number;
    idInventario?: number;
    loteOptimo?: number;
    puntoPedido?: number;
    stockSeguridad?: number;
    invMaximo?: number;
}

interface ArticuloProveedor {
    idArticuloProveedor: number;
    cargoPedido: number;
    demoraEntrega: number;
    esPredeterminado: boolean;
    idArticulo: number;
    idProveedor: number;
    precioUnitario: number;
}

type ProveedorCambiado = {
    idArticuloProveedor: number;
    idArticulo: number;
    idProveedor: number;
    cargoPedido: number;
    demoraEntrega: number;
    esPredeterminado: boolean;
    precioUnitario: number;
};

interface ArtEditProps {
    show: boolean;
    onHide: () => void;
    articulo: any | null;
    onSave: (updatedArticulo: any, articulo?: any, updateProveedor?: any, proidProvOriginal?: any) => void | Promise<void>;
    mode: "edit" | "new";
}

const ArtEdit = ({ show, onHide, articulo, onSave, mode }: ArtEditProps) => {
    const [idArticulo, setIdArticulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [stock, setStock] = useState(0);
    const [demanda, setDemanda] = useState(0);
    const [costoAlmacenamiento, setCostoAlmacenamiento] = useState(0);
    const [costoPedido, setCostoPedido] = useState(0);
    const [modeloInventario, setModeloInventario] = useState("LF"); // Lote Fijo por defecto

    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorPredeterminado, setProveedorPredeterminado] = useState<any | null>(null);
    const [proveedoresCambiados, setProveedoresCambiados] = useState<ProveedorCambiado[]>([]);
    const [periodoRevision, setPeriodoRevision] = useState(0);

    useEffect(() => {
        if (mode === "edit" && articulo) {
            setIdArticulo(articulo.idArticulo || "");
            setDescripcion(articulo.descripcion || "");
            setStock(articulo.stock || 0);
            setDemanda(articulo.inventario?.demandaArticulo || 0);
            setCostoAlmacenamiento(articulo.inventario?.costoAlmacenamiento || 0);
            setCostoPedido(articulo.inventario?.costoPedido || 0);
            setModeloInventario(articulo.modeloInventario || "LF")

        } else if (mode === "new") {
            setIdArticulo("");
            setDescripcion("");
            setStock(0);
            setDemanda(0);
            setCostoAlmacenamiento(0);
            setCostoPedido(0);

        }
    }, [articulo, mode]);

    const handleSave = async () => {


        try {
            let updatedArticulo: Articulo;
            const demoraEntrega = proveedorPredeterminado?.demoraEntrega || 0;

            const inventarioCalculado = calcularDatosInventario({
                demanda,
                costoPedido,
                costoAlmacenamiento,
                modeloInventario,
                demoraEntrega,

            });
            if (mode === "edit") {
                updatedArticulo = {
                    ...articulo,
                    descripcion,
                    stock,
                    modeloInventario,
                    inventario: {
                        ...inventarioCalculado,
                        idInventario: articulo.inventario?.idInventario,
                    },
                    articuloProveedor: proveedorPredeterminado,
                };

                if (proveedoresCambiados.length > 0) {
                    onSave(updatedArticulo, articulo, proveedoresCambiados[0], proveedoresCambiados[1]);
                } else {
                    onSave(updatedArticulo, articulo);
                }

            } else {
                updatedArticulo = {
                    descripcion,
                    modeloInventario,
                    stock,
                    inventario: inventarioCalculado,
                    articuloProveedor: {
                        idArticuloProveedor: 0,
                        cargoPedido: proveedorPredeterminado?.cargoPedido || 0,
                        demoraEntrega,
                        esPredeterminado: true,
                        idArticulo: 0,
                        idProveedor: proveedorPredeterminado?.idProveedor || 0,
                        precioUnitario: proveedorPredeterminado?.precioUnitario || 0,
                    },
                };
                onSave(updatedArticulo);
            }
        } catch (error) {
            console.error("Error al guardar artículo:", error);
            showToasty("Error al guardar proveedor", "error");
        }
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Editar Artículo" : "Nuevo Artículo"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    {mode === "edit" && (
                        <>
                            <Form.Label>Código</Form.Label>
                            <Form.Control type="text" value={idArticulo} disabled />
                        </>
                    )}
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

                    <Form.Label className="mt-3">Stock</Form.Label>
                    <Form.Control type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />

                    <div className="d-flex justify-content-between gap-2 mt-3">

                        <div style={{ width: "50%" }}>
                            <Form.Label className="mt-3">Modelo de Inventario</Form.Label>
                            <Form.Select
                                aria-label="Modelo de Inventario"
                                value={modeloInventario}
                                onChange={(e) => setModeloInventario(e.target.value)}
                            >
                                <option value="LF">Lote Fijo</option>
                                <option value="PF">Periodo Fijo</option>
                            </Form.Select>
                        </div>

                        {mode !== "new" && (
                            <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <Form.Label className="mt-3">Proveedor predeterminado</Form.Label>
                                <Button onClick={() => setShowProveedorModal(true)} style={{ minWidth: "200px" }}>
                                    {proveedorPredeterminado?.nombre?.toString() || proveedorPredeterminado?.proveedor?.nombre || "Seleccionar..."}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-between gap-2 mt-3">
                        <div style={{ width: "80%" }}>


                            {modeloInventario === 'PF' && (
                                <>
                                    <Form.Label className="mt-3">Período de Revisión (en días)</Form.Label>
                                    <Form.Control type="number" min={1} value={periodoRevision} onChange={(e) => setPeriodoRevision(Number(e.target.value))} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="d-flex justify-content-between gap-2 mt-3">

                        <div style={{ width: "33%" }}>
                            <Form.Label>Demanda Anual</Form.Label>
                            <Form.Control type="number" min={0} value={demanda} onChange={(e) => setDemanda(Number(e.target.value))} />
                        </div>
                        <div style={{ width: "33%" }}>
                            <Form.Label>Costo Almacenamiento</Form.Label>
                            <Form.Control type="number" min={0} step={0.01} value={costoAlmacenamiento} onChange={(e) => setCostoAlmacenamiento(Number(e.target.value))} />
                        </div>

                        <div style={{ width: "33%" }}>
                            <Form.Label>Costo Pedido</Form.Label>
                            <Form.Control type="number" min={0} step={0.01} value={costoPedido} onChange={(e) => setCostoPedido(Number(e.target.value))} />
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
                articulo={mode === "edit" ? articulo : null}
                onHide={() => setShowProveedorModal(false)}
                onSave={({ proveedorPredeterminado, cambios }) => {
                    setProveedorPredeterminado(proveedorPredeterminado);
                    setProveedoresCambiados(cambios);
                }}
                mode={mode}
                onProveedorPredeterminadoChange={(prov) => setProveedorPredeterminado(prov)}
            />
        </Modal>
    );
};

export default ArtEdit;
