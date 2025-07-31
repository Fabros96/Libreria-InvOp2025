import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty";
import ArtProv from "./artProv";

import "../../App.css";

import { useFormik } from "formik";
import * as Yup from "yup";

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
    periodoRevision?: number;
}

interface ArticuloProveedor {
    idArticuloProveedor: number;
    demoraEntrega: number;
    fechaBaja?: Date | null;
    esPredeterminado: boolean;
    idArticulo: number;
    idProveedor: number;
    precioUnitario: number;
}

type ProveedorCambiado = {
    idArticuloProveedor: number;
    idArticulo: number;
    idProveedor: number;
    demoraEntrega: number;
    fechaBaja: Date | null;
    esPredeterminado: boolean;
    precioUnitario: number;
};

interface ArtEditProps {
    show: boolean;
    onHide: () => void;
    articulo: any | null;
    onSave: (updatedArticulo: any, articulo?: any, updateProveedor?: any, proidProvOriginal?: any, nuevaAP?: any) => void | Promise<void>;
    mode: "edit" | "new";
}

const validationSchema = Yup.object({
    descripcion: Yup.string().required("La descripción es requerida"),
    stock: Yup.number().min(0, "El stock no puede ser negativo").required("El stock no puede ser negativo"),
    demandaArticulo: Yup.number().min(1, "Debe ingresar un valor mayor a cero").required("Debe ingresar un valor mayor a cero"),
    costoAlmacenamiento: Yup.number().min(1, "Debe ingresar un valor mayor a cero").required("Debe ingresar un valor mayor a cero"),
    costoPedido: Yup.number().min(1, "Debe ingresar un valor mayor a cero").required("Debe ingresar un valor mayor a cero"),
    modeloInventario: Yup.string().required("Modelo requerido"),
    periodoRevision: Yup.number()
        .when("modeloInventario", {
            is: "PF",
            then: (schema) => schema
                .min(1, "Debe ingresar un valor mayor a cero")
                .required("Debe ingresar un valor mayor a cero"),
            otherwise: (schema) => schema.notRequired(),
        }),
});

const ArtEdit = ({ show, onHide, articulo, onSave, mode }: ArtEditProps) => {
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [proveedorPredeterminado, setProveedorPredeterminado] = useState<any | null>(null);
    const [proveedoresCambiados, setProveedoresCambiados] = useState<ProveedorCambiado[]>([]);
    const [provOriginalRecibido, setProvOriginalRecibido] = useState<any | null>(null);
    const [provNuevoRecibido, setProvNuevoRecibido] = useState<any | null>(null);
    const [nuevoAP, setNuevoAP] = useState<any | null>(null);


    useEffect(() => {
        if (mode === "edit" && articulo) {
            setProveedorPredeterminado(articulo.articuloProveedor || null);
        } else if (mode === "new") {
            setProveedorPredeterminado(null);
        }
    }, [articulo, mode]);


    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            descripcion: articulo?.descripcion || "",
            stock: articulo?.stock || 0,
            demandaArticulo: articulo?.inventario?.demandaArticulo || 0,
            costoAlmacenamiento: articulo?.inventario?.costoAlmacenamiento || 0,
            costoPedido: articulo?.inventario?.costoPedido || 0,
            periodoRevision: articulo?.inventario?.periodoRevision || 0,
            modeloInventario: articulo?.modeloInventario || "LF", // <-- agregar esto
        },
        validationSchema,
        onSubmit: (values) => {
            onSave(values);
            onHide();
        },
    });

    const handleSave = async () => {
        // Ejecuta validación de Formik
        const errors = await formik.validateForm();
        formik.setTouched({
            descripcion: true,
            stock: true,
            demandaArticulo: true,
            costoAlmacenamiento: true,
            costoPedido: true,
            modeloInventario: true,
            periodoRevision: true,
        });

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            let updatedArticulo: Articulo;
            const demoraEntrega = proveedorPredeterminado?.demoraEntrega || 0;
            const fechaBaja = proveedorPredeterminado?.fechaBaja || null;

            if (mode === "edit") {
                // Aseguramos que siempre mandamos inventario completo
                const inventario = {
                    idInventario: articulo?.inventario?.idInventario,
                    demandaArticulo: formik.values.demandaArticulo,
                    costoAlmacenamiento: formik.values.costoAlmacenamiento,
                    costoPedido: formik.values.costoPedido,
                    periodoRevision: formik.values.periodoRevision,
                };

                // Combinamos proveedor actualizado con el original si falta algo
                const proveedorFinal = {
                    ...articulo?.articuloProveedor,
                    ...proveedorPredeterminado,
                };

                updatedArticulo = {
                    ...articulo,
                    descripcion: formik.values.descripcion,
                    stock: formik.values.stock,
                    modeloInventario: formik.values.modeloInventario,
                    inventario,
                    articuloProveedor: proveedorFinal,
                };

                if (proveedoresCambiados.length > 0) {
                    onSave(articulo, updatedArticulo, provOriginalRecibido, provNuevoRecibido);
                } else {
                    onSave(articulo, updatedArticulo);
                }
            } else {
                // Modo NEW
                updatedArticulo = {
                    descripcion: formik.values.descripcion,
                    modeloInventario: formik.values.modeloInventario,
                    stock: formik.values.stock,
                    inventario: {
                        demandaArticulo: formik.values.demandaArticulo,
                        costoAlmacenamiento: formik.values.costoAlmacenamiento,
                        costoPedido: formik.values.costoPedido,
                        periodoRevision: formik.values.periodoRevision,
                    },
                    articuloProveedor: {
                        idArticuloProveedor: 0,
                        demoraEntrega,
                        fechaBaja,
                        esPredeterminado: true,
                        idArticulo: 0,
                        idProveedor: proveedorPredeterminado?.idProveedor || 0,
                        precioUnitario: proveedorPredeterminado?.precioUnitario || 0,
                    },
                };
                onSave(updatedArticulo, nuevoAP); // Para modo NEW
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
                            <Form.Label htmlFor="idArticulo">Código</Form.Label>
                            <Form.Control id="idArticulo" type="text" value={articulo?.idArticulo ?? ""} disabled />
                        </>
                    )}

                    {/* Descripción */}
                    <Form.Label htmlFor="descripcion">Descripción</Form.Label>
                    <Form.Control
                        type="text"
                        id="descripcion"
                        value={formik.values.descripcion}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.descripcion && !!formik.errors.descripcion}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.descripcion as string}
                    </Form.Control.Feedback>

                    {/* Stock */}
                    <Form.Label htmlFor="stock" className="mt-3">Stock</Form.Label>
                    <Form.Control
                        type="number"
                        id="stock"
                        min={0}
                        value={formik.values.stock}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        isInvalid={formik.touched.stock && !!formik.errors.stock}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.stock as string}
                    </Form.Control.Feedback>

                    {/* Modelo de Inventario y Proveedor */}
                    <div className="d-flex justify-content-between gap-2 mt-3">
                        <div style={{ width: "50%" }}>
                            <Form.Label htmlFor="modeloInventario" className="mt-3">Modelo de Inventario</Form.Label>
                            <Form.Select
                                aria-label="Modelo de Inventario"
                                id="modeloInventario"
                                value={formik.values.modeloInventario}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.modeloInventario && !!formik.errors.modeloInventario}
                            >
                                <option value="LF">Lote Fijo</option>
                                <option value="PF">Periodo Fijo</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.modeloInventario as string}
                            </Form.Control.Feedback>
                        </div>

                        {/* {mode !== "new" && (
                            <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                <Form.Label htmlFor="btnProveedor" className="mt-3">Proveedor predeterminado</Form.Label>
                                <Button id="btnProveedor" onClick={() => setShowProveedorModal(true)} style={{ minWidth: "200px" }}>
                                    {proveedorPredeterminado?.nombre?.toString() ||
                                        proveedorPredeterminado?.proveedor?.nombre ||
                                        "Seleccionar..."}
                                </Button>
                            </div>
                        )} */}

                        <div style={{ width: "50%", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <Form.Label htmlFor="btnProveedor" className="mt-3">Proveedor predeterminado</Form.Label>
                            <Button id="btnProveedor" onClick={() => setShowProveedorModal(true)} style={{ minWidth: "200px" }}>
                                {proveedorPredeterminado?.nombre?.toString() ||
                                    proveedorPredeterminado?.proveedor?.nombre ||
                                    "Seleccionar..."}
                            </Button>
                        </div>

                    </div>

                    {/* Período de Revisión (si aplica) */}
                    {formik.values.modeloInventario === "PF" && (
                        <div className="mt-3">
                            <Form.Label htmlFor="periodoRevision">Período de Revisión (en días)</Form.Label>
                            <Form.Control
                                type="number"
                                id="periodoRevision"
                                min={1}
                                value={formik.values.periodoRevision}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.periodoRevision && !!formik.errors.periodoRevision}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.periodoRevision as string}
                            </Form.Control.Feedback>
                        </div>
                    )}

                    {/* Demanda, Costos */}
                    <div className="d-flex justify-content-between gap-2 mt-3">
                        <div style={{ width: "33%" }}>
                            <Form.Label htmlFor="demandaArticulo">Demanda Diaria</Form.Label>
                            <Form.Control
                                type="number"
                                id="demandaArticulo"
                                min={0}
                                value={formik.values.demandaArticulo}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.demandaArticulo && !!formik.errors.demandaArticulo}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.demandaArticulo as string}
                            </Form.Control.Feedback>
                        </div>

                        <div style={{ width: "33%" }}>
                            <Form.Label htmlFor="costoAlmacenamiento">Costo Almacenamiento</Form.Label>
                            <Form.Control
                                type="number"
                                step={0.01}
                                id="costoAlmacenamiento"
                                min={0}
                                value={formik.values.costoAlmacenamiento}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.costoAlmacenamiento && !!formik.errors.costoAlmacenamiento}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.costoAlmacenamiento as string}
                            </Form.Control.Feedback>
                        </div>

                        <div style={{ width: "33%" }}>
                            <Form.Label htmlFor="costoPedido">Costo Pedido</Form.Label>
                            <Form.Control
                                type="number"
                                id="costoPedido"
                                step={0.01}
                                min={0}
                                value={formik.values.costoPedido}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.costoPedido && !!formik.errors.costoPedido}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.costoPedido as string}
                            </Form.Control.Feedback>
                        </div>
                    </div>
                </Form.Group>

            </Modal.Body>
             <Modal.Footer className="d-flex justify-content-between w-100">
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
                onSave={({ proveedorPredeterminado, cambios, proveedorOriginal, proveedorNuevo, nuevoAP }) => {
                    // Guardar inmediatamente cuando está en modo editar
                    setProveedorPredeterminado(proveedorPredeterminado);
                    setProveedoresCambiados(cambios);
                    setProvOriginalRecibido(proveedorOriginal);
                    setProvNuevoRecibido(proveedorNuevo);
                    setShowProveedorModal(false);

                    if (mode === "edit") {
                        setProveedorPredeterminado(proveedorPredeterminado);
                    } else if (mode === "new") {
                        // En modo new, proveedorPredeterminado viene undefined, pero tenemos nuevoAP
                        setNuevoAP(nuevoAP);
                        setProveedorPredeterminado(nuevoAP); // <-- actualizar proveedorPredeterminado también
                    }


                }}
                mode={mode}
                onProveedorPredeterminadoChange={(prov) => setProveedorPredeterminado(prov)}
            />

        </Modal>
    );
};

export default ArtEdit;