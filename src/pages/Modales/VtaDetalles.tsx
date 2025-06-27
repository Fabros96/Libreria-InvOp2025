import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { showToasty } from "../../utils/toasty";
import axiosClient from "../../api/axiosClient";

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

    // Cuando cambie el articulo (nuevo artículo), seleccionamos el primer proveedor por defecto
    useEffect(() => {
        if (articulo && articulo.articuloProveedorList && articulo.articuloProveedorList.length > 0) {
            setProveedorSeleccionado(articulo.articuloProveedorList[0]);
        } else {
            setProveedorSeleccionado(null);
        }
        setCantidad(0);
        setTotalPrice(0);
    }, [articulo?.idArticulo]); // depende del id para detectar cambio


    const handleVta = async (nuevaVenta: {
        idArticulo: number;
        cantidad: number;
        fecha: Date;
        articulo: Articulo;
    }) => {
        try {
            const response = await axiosClient.post("/ventas", nuevaVenta);

            const ventaCreada = response.data;

            setData(prevData => ({
                ...prevData,
                datos: [...prevData.datos, ventaCreada],
            }));

            //  // Validamos órdenes pendientes o enviadas
            // const responsePendiente = await axiosClient.get(
            //     `orden-compras/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Pendiente`
            // );
            // const responseEnviada = await axiosClient.get(
            //     `orden-compras/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Enviado`
            // );


            // const pendientes: any[] = responsePendiente.data || [];
            // const enviadas: any[] = responseEnviada.data || [];

            // const tieneOrdenes = pendientes.length > 0 || enviadas.length > 0;

            // if (tieneOrdenes) {
            //     if (pendientes.length > 0) {
            //         showToasty('No se puede eliminar el artículo, tiene órdenes pendientes', 'error');
            //     }
            //     if (enviadas.length > 0) {
            //         showToasty('No se puede eliminar el artículo, tiene órdenes enviadas', 'error');
            //     }
            //     if (pendientes.length > 0 && enviadas.length > 0) {
            //         showToasty('No se puede eliminar el artículo, tiene órdenes pendientes y enviadas', 'error');
            //     }
            // } else {
            //     onDel(articulo);
            // }



            showToasty("Venta realizada exitosamente", "success");
            onHide();
        } catch (error) {
            console.error(error);
            showToasty("Error al crear la venta", "error");
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
                        {proveedorSeleccionado ? proveedorSeleccionado.nombreProveedor : "---"}
                    </Form.Label>
                    <Form.Select
                        value={proveedorSeleccionado ? proveedorSeleccionado.idProveedor : ""}
                        onChange={(e) => {
                            const id = e.target.value;
                            const proveedor = articulo.articuloProveedorList.find(
                                (p: any) => p.idProveedor.toString() === id
                            );
                            setProveedorSeleccionado(proveedor);
                        }}
                    >
                        {articulo?.articuloProveedorList?.map((p: any) => (
                            <option key={p.idProveedor} value={p.idProveedor}>
                                {p.proveedor.nombre} - ${p.precioUnitario}
                            </option>
                        )) || <option>No hay proveedores</option>}
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
                                    setCantidad(articulo.stock);
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
                            showToasty("Seleccione un proveedor y una cantidad válida", "warning");
                            return;
                        }

                        const nuevaVenta = {
                            idArticulo: articulo.idArticulo,
                            cantidad: cantidad,
                            fecha: new Date(),
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
