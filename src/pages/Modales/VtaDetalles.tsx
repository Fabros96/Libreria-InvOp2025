import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { showToasty } from "../../utils/toasty";
import { useFormik } from "formik";
import * as Yup from "yup";

interface VtaDetalleProps {
    show: boolean;
    onHide: () => void;
    onSave: (venta: any) => void;
    venta: any | null;
    modo: String | null;
}


interface Articulo {
    descripcion: string;
    fechaBaja: Date | null;
    idArticulo: number;
    idInventario: number;
    modeloInventario: string;
    stock: number;
    inventario?: any;
    articuloProveedorList: ArticuloProveedor[];
}

interface ArticuloProveedor {
    idArticuloProveedor: number;
    demoraEntrega: number;
    fechaBaja: Date | null;
    esPredeterminado: boolean;
    idArticulo: number;
    idProveedor: number;
    precioUnitario: number;
    proveedor: {
        nombre: string;
    };
}

const getValidationSchema = (stock: number) =>
    Yup.object({
        cantidad: Yup.number()
            .min(1, "La cantidad debe ser mayor que cero.")
            .required("La cantidad es requerida")
            .max(stock, `No puede superar el stock disponible (${stock})`)
            .positive("La cantidad debe ser mayor que cero."),
    });


const VtaDetalle = ({ show, onHide, onSave, venta, modo }: VtaDetalleProps) => {

    // Buscamos el proveedor predeterminado
    const proveedorPredeterminado = venta?.articuloProveedorList?.find((p: any) => p.esPredeterminado) || null;

    // Si no hay predeterminado, proveedorPredeterminado es null
    // estado para el proveedor seleccionado (puede ser null)
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(proveedorPredeterminado);
    const articuloActual = (modo === 'new') ? venta : venta?.articulo ?? null;
    const [cantidadOriginal, setCantidadOriginal] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            cantidad: (modo !== 'new' && venta?.cantidad) || 0,
        },
        validationSchema: getValidationSchema(articuloActual?.stock ?? 0),
        onSubmit: async (values) => {
            const nuevaVenta = {
                idArticulo: articuloActual.idArticulo,
                cantidad: values.cantidad,
                total: totalPrice,
                fecha: new Date(Date.now()),
                venta,
            };

            await handleVta(nuevaVenta);
        },
    });

    useEffect(() => {
        if (show) {
            const proveedor =
                articuloActual?.articuloProveedorList?.find(
                    (p: any) => p.idProveedor === venta?.idProveedor
                ) ||
                articuloActual?.articuloProveedorList?.find((p: any) => p.esPredeterminado) ||
                null;
            setProveedorSeleccionado(proveedor);
            // Si no hay proveedor predeterminado, se elige el más barato de la lista
            if (!proveedor) {
                const proveedorBarato =
                    articuloActual?.articuloProveedorList?.find(
                        (p: any) => p.idProveedor === venta?.idProveedor
                    ) ||
                    articuloActual?.articuloProveedorList?.find((p: any) => p.esPredeterminado) ||
                    articuloActual?.articuloProveedorList?.reduce((min: { precioUnitario: number; }, current: { precioUnitario: number; }) => {
                        return current.precioUnitario < min.precioUnitario ? current : min;
                    }) ||
                    null;
                setProveedorSeleccionado(proveedorBarato);
            }


            const cantidadInicial = (modo !== 'new' && venta?.cantidad) || 0;

            setTotalPrice(proveedor ? proveedor.precioUnitario * cantidadInicial : 0);

            formik.resetForm({
                values: {
                    cantidad: cantidadInicial,
                },
                errors: {},
                touched: {},
            });
        }
    }, [show, venta, modo]);


    useEffect(() => {
        if (modo === 'new') {
            if (proveedorSeleccionado && formik.values.cantidad > 0) {
                setTotalPrice(proveedorSeleccionado.precioUnitario * formik.values.cantidad);
            } else {
                setTotalPrice(0);
            }
        } else if (modo === 'view') {

            setCantidadOriginal(venta?.cantidad || 0);
            setTotalPrice(venta?.total || 0);
        }
    }, [formik.values.cantidad, proveedorSeleccionado]);

    const handleVta = async (nuevaVenta: {
        idArticulo: number;
        cantidad: number;
        fecha: Date;
        venta: Articulo;
    }) => {



        try {
            onSave(nuevaVenta);
        } catch (error: any) {
            const msg = error?.response?.data?.msg || "Error al crear la venta.";
            showToasty(msg, "error");
        }
    };
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{modo === 'new' ? 'Nueva Venta' : 'Editar Venta'}.</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group style={{ fontSize: "1.15rem" }}>
                    <Form.Text style={{ fontSize: "1.15rem" }}>
                        <strong>Artículo: </strong>
                    </Form.Text>
                    <Form.Text style={{ fontSize: modo === 'view' ? "1.2rem" : "", fontWeight: modo === 'view' ? "bold" : "normal", marginTop: modo === 'view' ? "10px" : "", marginBottom: modo === 'view' ? "10px" : "", color: modo === 'view' ? "blue" : "inherit", }}>
                        #{articuloActual?.idArticulo ?? "---"} - {articuloActual?.descripcion ?? "---"}
                    </Form.Text>

                    <div className="mt-3">
                        <Form.Text style={{ fontSize: "1.15rem" }}>
                            <strong>Precio Unitario: </strong>
                        </Form.Text>
                        <Form.Text style={{ fontSize: modo === 'view' ? "1.2rem" : "", fontWeight: modo === 'view' ? "bold" : "normal", marginTop: modo === 'view' ? "10px" : "", marginBottom: modo === 'view' ? "10px" : "", color: modo === 'view' ? "blue" : "inherit", }}>

                            {modo === 'view' ? (venta?.total ? venta.total.toFixed(2) / cantidadOriginal : "N/D")
                                : proveedorSeleccionado
                                    ? `$${proveedorSeleccionado.precioUnitario.toFixed(2)}`
                                    : "Necesita seleccionar primero un proveedor para realizar la venta."}
                        </Form.Text>
                    </div>

                    {modo === 'new' && (
                        <div className="mt-3">
                            <Form.Text>
                                <strong>Stock: </strong>
                                {articuloActual?.stock ?? "---"}
                            </Form.Text>
                        </div>
                    )}

                    <div className="mt-3">
                        <Form.Text style={{ fontSize: "1.15rem" }}>
                            <strong>Cantidad: </strong>
                        </Form.Text>
                        {modo === 'new' ? (
                            <>
                                <Form.Control
                                    type="number"
                                    id="cantidad"
                                    name="cantidad"
                                    min={0}
                                    max={venta?.stock ?? 0}
                                    value={formik.values.cantidad}
                                    disabled={modo !== 'new'}
                                    onChange={(e) => {
                                        const value = Math.max(0, Number(e.target.value));
                                        formik.setFieldValue("cantidad", value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    isInvalid={formik.touched.cantidad && !!formik.errors.cantidad}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.cantidad as string}
                                </Form.Control.Feedback>
                            </>
                        ) : (


                            <Form.Text style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px", marginBottom: "10px", color: "blue" }}>
                                <strong>{" " + formik.values.cantidad} </strong>
                            </Form.Text>)}

                    </div>

                    <hr
                        className="hr hr-blurry"
                        style={{ fontWeight: "bolder", height: "3px", backgroundColor: "black" }}
                    />


                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px", marginBottom: "10px", color: "blue" }}>

                        <strong>Precio Total: </strong>
                        {typeof venta?.total === "number"
                            ? `$${venta.total.toFixed(2)}`
                            : (proveedorSeleccionado
                                ? `$${(proveedorSeleccionado.precioUnitario * formik.values.cantidad).toFixed(2)}`
                                : "$0.00")}
                    </div>



                    {modo === 'view' && (
                        <div>
                            <strong>Fecha de Venta: </strong> {venta?.fechaCreacion ? new Date(venta.fechaCreacion).toLocaleString() : 'N/D'}
                            <br />
                            <strong>Venta realizada por: </strong> Usuario
                        </div>
                    )}
                </Form.Group>
            </Modal.Body>
            {modo !== "view" && (
                <Modal.Footer className="d-flex justify-content-between w-100">
                    <Button variant="outline-danger" onClick={onHide}>Cancelar</Button>
                    <Button
                        variant="outline-success"
                        onClick={() => { formik.handleSubmit() }}
                        style={{ visibility: modo === "new" ? (proveedorSeleccionado ? 'visible' : 'hidden') : 'visible' }}

                    >
                        {modo === 'new' ? 'Realizar Venta' : 'Editar Venta'}
                    </Button>
                </Modal.Footer>
            )}

        </Modal>
    );
};

export default VtaDetalle;
