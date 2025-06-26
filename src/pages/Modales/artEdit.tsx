import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty"
import ArtProv from "./artProv"; // ajustá el path si está en otra carpeta

import "../../App.css";
import axiosClient from "../../api/axiosClient";

type Articulo = {
    idArticulo: number;
    idProveedor: number;
    idInventario: number;
    fechaBaja: Date | null;
    descripcion: string;
    modeloInventario: number;
    stock: number;
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
    onSave: (updatedArticulo: any) => void;
    mode: "edit" | "new";
    precio: number;
}

const ArtEdit = ({ show, onHide, articulo, onSave, mode }: ArtEditProps) => {
    const [data, setData] = useState<ArticulosData>({ datos: [], totalPages: 0 });
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
    const [proveedorPredeterminado, setProveedorPredeterminado] = useState<any | null>(null);


    const [proveedoresCambiados, setProveedoresCambiados] = useState<ProveedorCambiado[]>([]);





    useEffect(() => {
        if (mode === "edit" && articulo) {
            setIdArticulo(articulo.idArticulo || "");
            setDescripcion(articulo.descripcion || "");
            setStock(articulo.stock || 0);
            // setPrecio(articulo.precio || 0);  
            setModelo(articulo.modeloInventario || 0);
            setDemanda(articulo.demanda || 0);
            setCostoAlmacenamiento(articulo.cAlmacenamiento || 0);
            setCostoPedido(articulo.cPedido || 0);
            setCostoCompra(articulo.cCompra || 0);

            // // ✅ Buscamos el proveedor predeterminado si existe
            // if (articulo.proveedores && Array.isArray(articulo.proveedores)) {
            //     const predeterminado = articulo.proveedores.find((p) => p.esPredeterminado);
            //     if (predeterminado) {
            //         setProveedorPredeterminado(predeterminado);
            //     }
            // }

        } else if (mode === "new") {
            setIdArticulo("");
            setDescripcion("");
            setStock(0);
            setPrecio(0);
            setModelo(0);
            setDemanda(0);
            setCostoAlmacenamiento(0);
            setCostoPedido(0);
            setCostoCompra(0);
            setProveedorPredeterminado(null);
        }
    }, [articulo, mode]);



    // const handleSave = () => {
    //     const datosArticulo = {
    //         idArticulo,
    //         descripcion,
    //         stock,
    //         precio,
    //         modeloInventario: modelo,
    //         demanda,
    //         cAlmacenamiento: costoAlmacenamiento,
    //         cPedido: costoPedido,
    //         cCompra: costoCompra,
    //         idProveedor: proveedorPredeterminado?.idProveedor || null,
    //     };

    //     const request = mode === "edit"
    //         ? axiosClient.put(`/articulos/${idArticulo}`, datosArticulo)
    //         : axiosClient.post(`/articulos`, datosArticulo);

    //     request
    //         .then(() => {
    //             const mensaje = mode === "edit"
    //                 ? "Artículo actualizado exitosamente"
    //                 : "Artículo creado exitosamente";
    //             showToasty(mensaje, 'success');
    //             onSave(datosArticulo); // Notificás al padre que se guardó
    //             onHide(); // Cerrás modal
    //         })
    //         .catch(error => {
    //             console.error("Error al guardar el artículo:", error);
    //             showToasty("No se pudo guardar el artículo. Intente nuevamente.", "error");
    //         });
    // };

    const handleSave = async () => {
        try {
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
            onHide();
            // acá va el resto del guardado del artículo, etc.

            showToasty("Cambios guardados correctamente", "success");
        } catch (error) {
            showToasty("Error al guardar cambios", "error");
        }
    };





    const handleProveedorSeleccionado = (selectedProv: any) => {
        setProveedorPredeterminado({ ...selectedProv.proveedor });
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
                        <Form.Select aria-label="Default select example" onChange={(e) => setModelo(Number(e.target.value))}>
                            <option>Modelos...</option>
                            <option value="1001">One</option>
                            <option value="1002">Two</option>
                            <option value="1003">Three</option>

                        </Form.Select>

                        <Button
                            onClick={() => setShowProveedorModal(true)}
                            style={{ minWidth: '200px' }}
                        >
                            {proveedorPredeterminado?.nombre?.toString() || proveedorPredeterminado?.proveedor.nombre || "Seleccionar..."}
                        </Button>


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
                <Button variant="outline-success" onClick={handleSave}>Guardar</Button>

            </Modal.Footer>
            <ArtProv
                show={showProveedorModal}
                articulo={mode === "edit" ? articulo : null}
                onHide={() => setShowProveedorModal(false)}
                // onSave={handleProveedorSeleccionado}
                onSave={({ proveedorPredeterminado, cambios }) => {
                    setProveedorPredeterminado(proveedorPredeterminado);
                    setProveedoresCambiados(cambios);
                }}
                onReload={() => { }}
                mode={mode === "edit" ? "provEdit" : mode === "new" ? "provNew" : "provView"}
                onProveedorPredeterminadoChange={(prov) => setProveedorPredeterminado(prov)}
            />


        </Modal>
    );
};

export default ArtEdit;
