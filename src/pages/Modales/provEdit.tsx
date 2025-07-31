import { useState, useEffect } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

import ProvAsoc from "./provAsoc";
import DetalleProvArt from "./detalleProvArt";

import axiosClient from "../../api/axiosClient";
import "../../App.css";
import { showToasty } from "../../utils/toasty";

interface ProvEditProps {
    show: boolean;
    onHide: () => void;
    proveedor: any | null;
    onSave: (updatedProveedor: any, x?: string | null, articulosProveedorList?: any[]) => void;
    mode: "edit" | "new";
}

const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es requerido"),
    articulos: Yup.array()
        .min(1, "Debe asociar al menos un artículo")
        .required("Debe asociar al menos un artículo"),
});

const ProvEdit = ({ show, onHide, proveedor, onSave, mode }: ProvEditProps) => {
    const [showProvAsoc, setShowProvAsoc] = useState(false);
    const [showDetalleProvArt, setShowDetalleProvArt] = useState(false);
    const [articulosProveedorList, setArticulosProveedorList] = useState<any[]>([]);
    const [articulosSeleccionados, setArticulosSeleccionados] = useState<any[]>([]);

    // Cargar artículos asociados al proveedor
    useEffect(() => {
        if (!proveedor) {
            setArticulosProveedorList([]);
            return;
        }

        const fetchArticulosProveedor = async () => {
            try {
                const response = await axiosClient.get(
                    `articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=articulo.inventario,proveedor&filter[articulo.fechaBaja][eq]=null`
                );

                const articulosProv = response.data || [];

                const activos = articulosProv.filter(
                    (ap: any) => ap.fechaBaja === null
                );
                setArticulosProveedorList(activos);
            } catch (error) {
                console.error("Error al obtener artículos del proveedor:", error);
                setArticulosProveedorList([]);
            }
        };
        
        fetchArticulosProveedor();
    }, [proveedor, show]);
    
    const ordenarPorIdArticulo = (arr: any[]) => {
        return [...arr].sort((a, b) => {
            return a.articulo.idArticulo - b.articulo.idArticulo;
        });
    };

    const sonArraysIguales = (a: any[], b: any[]) => {
        const ordenadoA = ordenarPorIdArticulo(a);
        const ordenadoB = ordenarPorIdArticulo(b);
        return JSON.stringify(ordenadoA) === JSON.stringify(ordenadoB);
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            idProveedor: proveedor?.idProveedor || "",
            nombre: proveedor?.nombre || "",
            articulos: articulosProveedorList || [],
            showData: false,
        },
        validationSchema,
        onSubmit: (values) => {
            if (proveedor) {
                if (formik.values.nombre === proveedor.nombre) {
                    if (sonArraysIguales(formik.values.articulos, articulosProveedorList)) {
                        showToasty("No se realizaron cambios", "warning");
                        onHide();
                        return;
                    } else {
                        onSave(values, "asoc", articulosProveedorList);
                    }
                } else {
                    if (sonArraysIguales(formik.values.articulos, articulosProveedorList)) {
                        onSave(values, "nomProv");
                    } else {
                        onSave(values, "ambos");
                    }
                }
            }else{
                onSave(values);
            }
            onHide();
        },
    });

    const abrirProvAsoc = () => {
        setShowProvAsoc(true);
    };

    const onArticulosSeleccionados = (seleccionados: any[]) => {
        setArticulosSeleccionados(seleccionados);
        setShowProvAsoc(false);
        setShowDetalleProvArt(true);
    };

    const onDetallesGuardados = (articulosProveedorConDetalles: any[]) => {
        formik.setFieldValue("showData", true);

        if (articulosProveedorList.length === 0 && articulosProveedorConDetalles.length === 0) {
            formik.setFieldError("articulos", "Debe asociar al menos un artículo.");
        } else {
            formik.setFieldValue("articulos", articulosProveedorConDetalles);
        }

        setShowDetalleProvArt(false);
    };




    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Form onSubmit={formik.handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>{mode === "edit" ? "Editar Proveedor" : "Nuevo Proveedor"}</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group>
                            {mode === "edit" && (
                                <>
                                    <Form.Label htmlFor="idProveedor">Código</Form.Label>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Form.Control
                                            id="idProveedor"
                                            name="idProveedor"
                                            type="text"
                                            value={formik.values.idProveedor}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}

                            <Form.Label htmlFor="nombre">Nombre</Form.Label>
                            <Form.Control
                                id="nombre"
                                type="text"
                                name="nombre"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.nombre && !!formik.errors.nombre}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.nombre as string}
                            </Form.Control.Feedback>

                            <div className="mt-3">
                                <Button onClick={abrirProvAsoc}>Asociar Artículo/s</Button>
                            </div>

                            {/* Mostrar artículos seleccionados */}
                            {formik.values.articulos.length > 0 && formik.values.showData && (
                                <div className="mt-3">
                                    <strong> Artículos seleccionados:</strong>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {formik.values.articulos.map((art: any) => (
                                            <Badge key={art.articulo.idArticulo} bg="info">
                                                {art.articulo.descripcion || "Sin descripción"}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {formik.touched.articulos && formik.errors.articulos && (
                                <div className="text-danger mt-2">
                                    {typeof formik.errors.articulos === "string"
                                        ? formik.errors.articulos
                                        : Array.isArray(formik.errors.articulos)
                                            ? formik.errors.articulos.join(", ")
                                            : ""}
                                </div>
                            )}

                        </Form.Group>
                    </Modal.Body>

                     <Modal.Footer className="d-flex justify-content-between w-100">
                        <Button variant="outline-danger" onClick={onHide}>
                            Cancelar
                        </Button>
                        <Button variant="outline-success" type="submit">
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal para seleccionar artículos */}
            <ProvAsoc
                show={showProvAsoc}
                onHide={() => setShowProvAsoc(false)}
                proveedor={proveedor}
                onSiguiente={onArticulosSeleccionados}
                articulosProveedorOriginalList={articulosProveedorList}
            />

            {/* Modal para ingresar detalles */}
            <DetalleProvArt
                show={showDetalleProvArt}
                onHide={() => setShowDetalleProvArt(false)}
                articulos={articulosSeleccionados}
                onVolver={onDetallesGuardados}
                proveedor={proveedor}
            />
        </>
    );
};

export default ProvEdit;