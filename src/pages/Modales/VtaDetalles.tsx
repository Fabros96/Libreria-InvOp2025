import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { showToasty } from "../../utils/toasty";
import axiosClient from "../../api/axiosClient";
import { generarOCAutomatica } from "../../utils/ocAutomatica";

interface VtaDetalleProps {
    show: boolean;
    onHide: () => void;
    articulo: any;
}


interface Articulo {
    descripcion: string;
    fechaBaja: Date | null;
    idArticulo: number;
    idInventario: number;
    modeloInventario: string; // 'LF' o 'PF'
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
    invMaximo?: number; // Solo para modelo PF
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

interface Venta {
    idVenta: number;
    idArticulo: number;
    fecha: Date;
    cantidad: number;
    articulo: Articulo;
}

type VentasData = {
    datos: any[];
    totalPages: number;
};

const VtaDetalle = ({ show, onHide, articulo }: VtaDetalleProps) => {
    const [cantidad, setCantidad] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState<any | null>(null);
    const [data, setData] = useState<VentasData>({ datos: [], totalPages: 0 });


    // Al cambiar la cantidad o el proveedor, calculamos el total
    useEffect(() => {
        if (proveedorSeleccionado && cantidad > 0) {
            setTotalPrice(proveedorSeleccionado.precioUnitario * cantidad);
        } else {
            setTotalPrice(0);
        }
    }, [cantidad, proveedorSeleccionado]);


    useEffect(() => {
        if (articulo && articulo.articuloProveedorList && articulo.articuloProveedorList.length > 0) {
            const predeterminado = articulo.articuloProveedorList.find((p: any) => p.esPredeterminado);
            setProveedorSeleccionado(predeterminado);
        } else {
            setProveedorSeleccionado(null);
        }
        setCantidad(0);
        setTotalPrice(0);
    }, [articulo?.idArticulo]);



    // const handleVta = async (nuevaVenta: {
    //     idArticulo: number;
    //     cantidad: number;
    //     fecha: Date;
    //     articulo: Articulo;
    // }) => {
    //     try {

    //         if (articulo.modeloInventario === "LF" && cantidad <= articulo.stock) {

    //             const response = await axiosClient.post("/ventas", nuevaVenta);
    //             console.log(response)

    //             const ventaCreada = response.data;

    //             setData(prevData => ({
    //                 ...prevData,
    //                 datos: [...prevData.datos, ventaCreada],
    //             }));
    //             showToasty("Venta realizada exitosamente", "success");
    //             onHide();
    //             generarOCAutomatica(articulo, articulo.inventario, cantidad)
    //         }

    //         if (articulo.modeloInventario !== "LF") {
    //             // Para modelo PF, no se puede vender si hay órdenes pendientes o enviadas
    //             showToasty("Solo se puede crear la venta para modelo LF", "error");
    //         }
    //         if (cantidad > articulo.stock) {
    //             // Para modelo PF, no se puede vender si hay órdenes pendientes o enviadas
    //             showToasty("La cantidad es mayor al stock", "error");
    //         }

    //     } catch (error) {
    //         console.error(error);
    //         showToasty("Error al crear la venta", "error");
    //     }
    // };



    const handleVta = async (nuevaVenta: {
        idArticulo: number;
        cantidad: number;
        fecha: Date;
        articulo: Articulo;
    }) => {
        try {
            // Intento inicial de crear la venta
            const response: any = await axiosClient.post("/ventas", nuevaVenta);

            if (cantidad > articulo.stock) {
                showToasty("La cantidad es mayor al stock", "error");
            }

            // Si el backend devuelve advertencia, consultamos al usuario
            if (response.advertencia) {
                const confirmar = window.confirm(response.msg);
                if (!confirmar) {
                    showToasty("Venta cancelada por el usuario.", "info");
                    return; // Salimos sin crear la venta
                }

                // Usuario confirmó continuar → reenviamos con forzarVenta: true
                const confirmResponse = await axiosClient.post("/ventas", {
                    ...nuevaVenta,
                    forzarVenta: true
                });

                setData(prevData => ({
                    ...prevData,
                    datos: [...prevData.datos, confirmResponse.data],
                }));

                showToasty("Venta realizada exitosamente", "success");
                onHide();
                return;
            }

            // Si no hubo advertencia, guardamos la venta directamente
            setData(prevData => ({
                ...prevData,
                datos: [...prevData.datos, response.data],
            }));
            

            showToasty("Venta realizada exitosamente", "success");
            onHide();

        } catch (error: any) {
            console.error(error);

            const msg = error?.response?.data?.msg || "Error al crear la venta.";
            console.log("mostrando toasty", msg);
            showToasty(msg, "error");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nueva Venta</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <div>
                        <Form.Label>
                            Artículo: #{articulo?.idArticulo ?? "---"} - {articulo?.descripcion ?? "---"}
                        </Form.Label>

                    </div>
                    <Form.Label>
                        <strong>Proveedor: </strong>

                    </Form.Label>
                    <Form.Select
                        value={proveedorSeleccionado?.idProveedor ?? ''}
                        onChange={(e) => {
                            const seleccionado = articulo.articuloProveedorList.find(
                                (p: any) => p.idProveedor === parseInt(e.target.value)
                            );
                            setProveedorSeleccionado(seleccionado || null);
                        }}
                    >
                        {articulo?.articuloProveedorList?.length > 0 ? (
                            articulo.articuloProveedorList.map((p: any) => (
                                <option key={p.idProveedor} value={p.idProveedor}>
                                    {p.proveedor.nombre} - ${p.precioUnitario}
                                </option>
                            ))
                        ) : (
                            <option>No hay proveedores</option>
                        )}
                    </Form.Select>




                    <div className="mt-3">
                        <Form.Label>
                            <strong>Precio Unitario: </strong>
                            {proveedorSeleccionado ? `$${proveedorSeleccionado.precioUnitario}` : "---"}
                        </Form.Label>
                    </div>

                    <div className="mt-3">
                        <Form.Label>
                            <strong>Stock: </strong>
                            {articulo?.stock ?? "---"}
                        </Form.Label>
                    </div>

                    <div className="mt-3">
                        <Form.Label>
                            <strong>Cantidad</strong>
                        </Form.Label>
                        <Form.Control
                            type="number"
                            min={0}
                            max={articulo?.stock ?? 0}
                            value={cantidad}
                            onChange={(e) => setCantidad(Number(e.target.value))}
                            onBlur={() => {
                                if (cantidad > (articulo?.stock ?? 0)) {
                                    setCantidad(cantidad);
                                } else if (cantidad < 0) {
                                    setCantidad(0);
                                }
                            }}
                        />
                    </div>

                    <hr className="hr hr-blurry" style={{ fontWeight: "bolder", height: "3px", backgroundColor: "black" }} />

                    <Form.Label>
                        <strong>Precio Total: </strong>${totalPrice.toFixed(2)}
                    </Form.Label>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-success"
                    onClick={() => {
                        if (!proveedorSeleccionado || cantidad <= 0) {
                            showToasty("Seleccione un datos válidos", "warning");
                            return;
                        }

                        const nuevaVenta = {
                            idArticulo: articulo.idArticulo,
                            cantidad: cantidad,
                            fecha: new Date(Date.now()),
                            articulo: articulo,
                        };

                        handleVta(nuevaVenta);
                    }}
                >
                    Realizar Venta
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default VtaDetalle;
