import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty";
import ArtProv from "./artProv";

import "../../App.css";

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
    costoCompra: number;
    costoPedido: number;
    demandaArticulo: number;
    idInventario?: number;
    loteOptimo?: number;
    puntoPedido?: number;
    stockSeguridad?: number;
    invMaximo?: number; // Solo para modelo PF
    periodoRevision?: number; // Solo para modelo PF
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
    onSave: (updatedArticulo: any) => void | Promise<void>;
    mode: "edit" | "new";
}

const ArtEdit = ({ show, onHide, articulo, onSave, mode }: ArtEditProps) => {
    const [idArticulo, setIdArticulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [stock, setStock] = useState(0);
    const [demanda, setDemanda] = useState(0);
    const [costoAlmacenamiento, setCostoAlmacenamiento] = useState(0);
    const [costoPedido, setCostoPedido] = useState(0);
    const [costoCompra, setCostoCompra] = useState(0);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorPredeterminado, setProveedorPredeterminado] = useState<any | null>(null);
    const [proveedoresCambiados, setProveedoresCambiados] = useState<ProveedorCambiado[]>([]);
    const [modeloInventario, setModeloInventario] = useState<'LF' | 'PF' >("LF");
    const [periodoRevision, setPeriodoRevision] = useState(0);

    useEffect(() => {
        console.log("useEffect edit - articulo:", articulo);
        if (mode === "edit" && articulo) {
            setIdArticulo(articulo.idArticulo || "");
            setDescripcion(articulo.descripcion || "");
            setStock(articulo.stock || 0);
            setDemanda(articulo.inventario?.demandaArticulo || 0);
            setCostoAlmacenamiento(articulo.inventario?.costoAlmacenamiento || 0);
            setCostoPedido(articulo.inventario?.costoPedido || 0);
            setCostoCompra(articulo.inventario?.costoCompra || 0);
            setModeloInventario(articulo.modeloInventario);
            setProveedorPredeterminado(articulo.articuloProveedor || null)
        } else if (mode === "new") {
            setIdArticulo("");
            setDescripcion("");
            setStock(0);
            setDemanda(0);
            setCostoAlmacenamiento(0);
            setCostoPedido(0);
            setCostoCompra(0);
            setModeloInventario(modeloInventario);
        }
    }, [articulo, mode]);

//     const handleSave = async () => {
//         try {
//             let updatedArticulo: Articulo;

//             if (mode === "edit") {
//                 if (proveedoresCambiados.length > 0) {
//                     await Promise.all(
//                         proveedoresCambiados.map(async (prov) => {
//                             const response = await fetch(`http://localhost:3000/articulo-proveedores/${prov.idArticuloProveedor}`, {
//                                 method: "PUT",
//                                 headers: { "Content-Type": "application/json" },
//                                 body: JSON.stringify(prov),
//                             });

//                             if (!response.ok) {
//                                 throw new Error(`Error al actualizar proveedor con ID ${prov.idArticuloProveedor}`);
//                             }
//                         })
//                     );
//                 }

//                 updatedArticulo = {
//                     ...articulo,
//                     descripcion,
//                     stock,
//                     modeloInventario: 'LF',
//                     inventario: {
//                         demandaArticulo: demanda,
//                         costoAlmacenamiento,
//                         costoPedido,
//                         costoCompra,
//                         idInventario: articulo.inventario?.idInventario || 0,
//                         //loteOptimo: 0,
//                         //puntoPedido: 0,
//                         //stockSeguridad: 0,
//                     },
//                     articuloProveedor: {
//                         idArticuloProveedor: articulo.articuloProveedor?.idArticuloProveedor || 0,
//                         cargoPedido: articulo.articuloProveedor?.cargoPedido || 0,
//                         demoraEntrega: articulo.articuloProveedor?.demoraEntrega || 0,
//                         esPredeterminado: true,
//                         idArticulo: articulo.idArticulo,
//                         idProveedor: proveedorPredeterminado?.idProveedor || 0,
//                         precioUnitario: proveedorPredeterminado?.precioUnitario || 0,
//                     },
//                 };
//             } else {
//                 updatedArticulo = {
//                     descripcion,
//                     modeloInventario: 'LF',
//                     stock,
//                     inventario: {
//                         demandaArticulo: demanda,
//                         costoAlmacenamiento,
//                         costoPedido,
//                         costoCompra,
//                         //loteOptimo: 0,
//                         //puntoPedido: 0,
//                         //stockSeguridad: 0,
//                     },
//                     articuloProveedor: {
//                         idArticuloProveedor: 0,
//                         cargoPedido: proveedorPredeterminado?.cargoPedido || 0,
//                         demoraEntrega: proveedorPredeterminado?.demoraEntrega || 0,
//                         esPredeterminado: true,
//                         idArticulo: 0,
//                         idProveedor: proveedorPredeterminado?.idProveedor || 0,
//                         precioUnitario: proveedorPredeterminado?.precioUnitario || 0,
//                     },
//                 };
//             }
// console.log("Articulo a guardar:", updatedArticulo);

//             onSave(updatedArticulo);
//         } catch (error) {
//             console.error("Error al guardar artículo:", error);
//             showToasty("Error al guardar proveedor", "error");
//         }
//     };

       const handleSave = async () => {
    try {
        let updatedArticulo: Articulo;

        if (mode === "edit") {
            // 1. Actualizar proveedores modificados
            if (proveedoresCambiados.length > 0) {
                await Promise.all(
                    proveedoresCambiados.map(async (prov) => {
                        const response = await fetch(`http://localhost:3000/articulo-proveedores/${prov.idArticuloProveedor}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(prov),
                        });

                        if (!response.ok) {
                            throw new Error(`Error al actualizar proveedor con ID ${prov.idArticuloProveedor}`);
                        }
                    })
                );
            }

            // 2. Preparar artículo para actualizar
            updatedArticulo = {
                ...articulo,
                descripcion,
                stock,
                modeloInventario,
                inventario: {
                    idInventario: articulo.inventario?.idInventario ?? 0,
                    demandaArticulo: demanda,
                    costoAlmacenamiento,
                    costoPedido,
                    costoCompra,
                    periodoRevision, //agrego para enviarle el periodo si es PF
                },
                articuloProveedor: {
                    idArticuloProveedor: articulo.articuloProveedor?.idArticuloProveedor ?? 0,
                    cargoPedido: proveedorPredeterminado?.cargoPedido ?? articulo.articuloProveedor?.cargoPedido ?? 0,
                    demoraEntrega: proveedorPredeterminado?.demoraEntrega ?? articulo.articuloProveedor?.demoraEntrega ?? 0,
                    esPredeterminado: true,
                    idArticulo: articulo.idArticulo,
                    idProveedor: proveedorPredeterminado?.idProveedor ?? articulo.articuloProveedor?.idProveedor ?? 0,
                    precioUnitario: proveedorPredeterminado?.precioUnitario ?? articulo.articuloProveedor?.precioUnitario ?? 0,
                },
            };

            console.log("articulo.ModeloInventario")
            console.log(updatedArticulo.inventario)

            console.log("🟡 MODO EDIT: artículoProveedor generado:");
            console.log(updatedArticulo.articuloProveedor);

        } else {
            // 3. Crear nuevo artículo
            updatedArticulo = {
                descripcion,
                modeloInventario,
                stock,
                inventario: {
                    demandaArticulo: demanda,
                    costoAlmacenamiento,
                    costoPedido,
                    costoCompra,
                    periodoRevision
                                             //agrego para enviarle el periodo si es PF
                },
                articuloProveedor: {
                    idArticuloProveedor: 1,
                    cargoPedido: proveedorPredeterminado?.cargoPedido ?? 0,
                    demoraEntrega: proveedorPredeterminado?.demoraEntrega ?? 0,
                    esPredeterminado: true,
                    idArticulo: 0,
                    idProveedor: proveedorPredeterminado?.idProveedor ?? 0,
                    precioUnitario: proveedorPredeterminado?.precioUnitario ?? 0,
                },
            };

            console.log("🟢 MODO NEW: artículoProveedor generado:");
            console.log(updatedArticulo.articuloProveedor);
        }

        // Log completo del artículo
        console.log("✅ Articulo a guardar:", updatedArticulo);

        // Envío al backend
        onSave(updatedArticulo);
    } catch (error) {
        console.error("❌ Error al guardar artículo:", error);
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
                    <Form.Label>Modelo de Inventario</Form.Label>
                    <Form.Select
                    value={modeloInventario}
                    onChange={(e) => setModeloInventario(e.target.value as 'LF' | 'PF')}
                    >
                    <option value="LF">Lote Fijo (LF)</option>
                    <option value="PF">Intervalo Fijo (PF)</option>
                    </Form.Select>

                    {modeloInventario === 'PF' && (
                        <>
                            <label>Período de Revisión (días)</label>
                            <input
                            type="number"
                            value={periodoRevision}
                            onChange={(e) => setPeriodoRevision(Number(e.target.value))}
                            min={1}
                            />
                        </>
                        )}



                    {mode === "edit" && (
                        <>
                            <Form.Label className="mt-3">Proveedor predeterminado</Form.Label>
                            <Button onClick={() => setShowProveedorModal(true)} style={{ minWidth: "200px" }}>
                                {proveedorPredeterminado?.nombre?.toString() || proveedorPredeterminado?.proveedor?.nombre || "Seleccionar..."}
                            </Button>
                        </>
                    )}

                    <Form.Label className="mt-3">Demanda anual</Form.Label>
                    <Form.Control type="number" min={0} value={demanda} onChange={(e) => setDemanda(Number(e.target.value))} />

                    <div className="d-flex justify-content-between gap-2 mt-3">
                        <div style={{ width: "33%" }}>
                            <Form.Label>Costo Almacenamiento</Form.Label>
                            <Form.Control type="number" min={0} step={0.01} value={costoAlmacenamiento} onChange={(e) => setCostoAlmacenamiento(Number(e.target.value))} />
                        </div>
                        <div style={{ width: "33%" }}>
                            <Form.Label>Costo Pedido</Form.Label>
                            <Form.Control type="number" min={0} step={0.01} value={costoPedido} onChange={(e) => setCostoPedido(Number(e.target.value))} />
                        </div>
                        <div style={{ width: "33%" }}>
                            <Form.Label>Costo Compra</Form.Label>
                            <Form.Control type="number" min={0} step={0.01} value={costoCompra} onChange={(e) => setCostoCompra(Number(e.target.value))} />
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
