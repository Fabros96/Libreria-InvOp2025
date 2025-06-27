import { useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";

import ProvAsoc from "./provAsoc";
import DetalleProvArt from "./detalleProvArt";

import "../../App.css";

interface ProvEditProps {
    show: boolean;
    onHide: () => void;
    proveedor: any | null;
    onSave: (updatedProveedor: any) => void;
    mode: "edit" | "new";
}

const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es requerido"),
    articulos: Yup.array().min(1, "Debe seleccionar al menos un artículo").required("Debe seleccionar al menos un artículo"),
});

const ProvEdit = ({ show, onHide, proveedor, onSave, mode }: ProvEditProps) => {
    const [showProvAsoc, setShowProvAsoc] = useState(false);
    const [showDetalleProvArt, setShowDetalleProvArt] = useState(false);
    const [articulosSeleccionados, setArticulosSeleccionados] = useState<any[]>([]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            idProveedor: proveedor?.idProveedor || "",
            nombre: proveedor?.nombre || "",
            articulos: proveedor?.articulosProveedor || [],
        },
        validationSchema,
        onSubmit: (values) => {
            onSave(values);
            onHide();
        },
    });

    // Abrir selección de artículos
    const abrirProvAsoc = () => {
        setShowProvAsoc(true);
    };

    // Al seleccionar artículos en ProvAsoc
    const onArticulosSeleccionados = (seleccionados: any[]) => {
        setArticulosSeleccionados(seleccionados);
        setShowProvAsoc(false);
        setShowDetalleProvArt(true); // Abrir detalle de cada artículo
    };

    // Al finalizar edición de detalles
    const onDetallesGuardados = (articulosProveedorConDetalles: any[]) => {
        if (articulosProveedorConDetalles.length === 0) {
            // Mostrar error usando setFieldError de Formik
            formik.setFieldError("articulos", "Debe seleccionar al menos un artículo con detalles.");
        } else {
            // Guardar los artículos en el formulario
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
                        <Form.Group controlId="formProveedor">
                            {mode === "edit" && (
                                <>
                                    <Form.Label>Código</Form.Label>
                                    <div style={{ marginBottom: '20px' }}>
                                        <Form.Control
                                            type="text"
                                            value={formik.values.idProveedor}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}

                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
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
                            {formik.values.articulos.length > 0 && (
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

                    <Modal.Footer>
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
