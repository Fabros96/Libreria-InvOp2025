import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"
import ArtProv from "./artProv"; // ajustá el path si está en otra carpeta

import "../../App.css";
import { setIn } from "formik";

interface Articulo {
    descripcion: string;
    fechaBaja: Date | null;
    idArticulo: number;
    idInventario: number;
    modeloInventario: number;
    stock: number;

    inventario?: Inventario;
    articuloProveedor?: ArticuloProveedor;
}

interface Inventario {
    costoAlmacenamiento: number;
    costoCompra: number;
    costoPedido: number;
    demandaArticulo: number;
    idInventario: number;
    loteOptimo: number;
    puntoPedido: number;
    stockSeguridad: number;
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

type ArticulosData = {
    datos: any[];
    totalPages: number;
};

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
    const [inventario, setInventario] = useState<Inventario | null>(null);
    const [modelo, setModelo] = useState<string>("");
    const [demanda, setDemanda] = useState(0);
    const [costoAlmacenamiento, setCostoAlmacenamiento] = useState(0);
    const [costoPedido, setCostoPedido] = useState(0);
    const [costoCompra, setCostoCompra] = useState(0);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorPredeterminado, setProveedorPredeterminado] = useState<any | null>(null);


    const [proveedoresCambiados, setProveedoresCambiados] = useState<ProveedorCambiado[]>([]);

    useEffect(() => {
        if (mode === "edit" && articulo) {
            setIdArticulo(articulo.idArticulo || "");
            setDescripcion(articulo.descripcion || "");
            setStock(articulo.stock || 0);
            setModelo(articulo.modeloInventario || 0);
            setDemanda(articulo.inventario?.demandaArticulo || 0);
            setCostoAlmacenamiento(articulo.inventario?.costoAlmacenamiento || 0);
            setCostoPedido(articulo.inventario?.costoPedido || 0);
            setCostoCompra(articulo.inventario?.costoCompra || 0);
            setInventario(articulo.inventario || null);

        } else if (mode === "new") {
            setIdArticulo("");
            setDescripcion("");
            setStock(0);
            setModelo("");
            setDemanda(0);
            setCostoAlmacenamiento(0);
            setCostoPedido(0);
            setCostoCompra(0);
            setInventario(null);
        }
    }, [articulo, mode]);


    const handleSave = async () => {
        try {
            let updatedArticulo: Articulo;

            if (mode === "edit") {
                // Actualizar proveedores si cambiaron
                if (proveedoresCambiados.length > 0) {
                    await Promise.all(
                        proveedoresCambiados.map(async (prov) => {
                            const response = await fetch(`http://localhost:3000/articulo-proveedores/${prov.idArticuloProveedor}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    idArticulo: prov.idArticulo,
                                    idProveedor: prov.idProveedor,
                                    cargoPedido: prov.cargoPedido,
                                    demoraEntrega: prov.demoraEntrega,
                                    esPredeterminado: prov.esPredeterminado,
                                    precioUnitario: prov.precioUnitario,
                                }),
                            });

                            if (!response.ok) {
                                throw new Error(`Error al actualizar proveedor con ID ${prov.idArticuloProveedor}`);
                            }
                        })
                    );
                }

                updatedArticulo = {
                    ...articulo,
                    descripcion: descripcion,
                    stock: stock,
                    modeloInventario: modelo,
                    inventario: {
                        demandaArticulo: demanda,
                        costoAlmacenamiento: costoAlmacenamiento,
                        costoPedido: costoPedido,
                        costoCompra: costoCompra,
                        idInventario: articulo.inventario?.idInventario || 0,
                        loteOptimo: 0,
                        puntoPedido: 0,
                        stockSeguridad: 0,
                    },
                    articuloProveedor: {
                        idArticuloProveedor: articulo.articuloProveedor?.idArticuloProveedor || 0,
                        cargoPedido: articulo.articuloProveedor?.cargoPedido || 0,
                        demoraEntrega: articulo.articuloProveedor?.demoraEntrega || 0,
                        esPredeterminado: true,
                        idArticulo: articulo.idArticulo,
                        idProveedor: proveedorPredeterminado?.idProveedor || 0,
                        precioUnitario: proveedorPredeterminado?.precioUnitario || 0,
                    },
                };
            } else {
                // Si estás en modo creación y querés hacer algo, podés ponerlo acá
                updatedArticulo = { ...articulo }; // o lanzar error si no está implementado
            }
            onSave(updatedArticulo);
        } catch (error) {
            console.error("Error al guardar artículo:", error);
            showToasty('Error al guardar proveedor', 'error');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{mode === "edit" ? "Editar Artículo" : "Nuevo Artículo"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    {mode === "edit" &&
                        <>

                            <Form.Label>Codigo</Form.Label>
                            <Form.Control
                                type="text"
                                value={idArticulo}
                                onChange={(e) => setIdArticulo(e.target.value)}
                                disabled={mode === "edit"}
                            />

                        </>}
                    <Form.Label>Descripcion</Form.Label>
                    <Form.Control
                        type="text"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}

                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                        <Form.Label>Stock</Form.Label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <Form.Control
                            type="number"
                            min={0}
                            max={9999999}
                            value={stock}
                            onChange={(e) => setStock(Number(e.target.value))}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Form.Label>Modelo de Inventario</Form.Label>
                        {mode === "edit" && <> <Form.Label>Proveedor predeterminado</Form.Label></>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '100px' }}>

                        <Form.Select
                            aria-label="Modelo de inventario"
                            value={modelo}
                            onChange={(e) => setModelo(e.target.value)}>
                            <option>Modelos...</option>
                            <option value="LF">Lote Fijo</option>
                            <option value="PF">Periodo Fijo</option>

                        </Form.Select>
                        {mode === "edit" && <> <Button onClick={() => setShowProveedorModal(true)} style={{ minWidth: '200px' }} > {proveedorPredeterminado?.nombre?.toString() || proveedorPredeterminado?.proveedor.nombre || "Seleccionar..."} </Button>  </>}

                    </div>
                    <Form.Label>Demanda anual</Form.Label>

                    <Form.Control
                        type="number"
                        min={0}
                        max={9999999}
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
                                value={costoPedido }
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
                <Button variant="outline-success" onClick={handleSave}>Guardar</Button>

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
