import { Modal, Tab, Tabs, Button, Stack, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

type Proveedor = {
    idProveedor: number;
    nombre: string;
};

type Articulo = {
    cargoPedido: number;
    demoraEntrega: number;
    precioUnitario: number;
    articulo: number;
    idArticulo: number;
    descripcion: string;
    observaciones?: string;
};

type ArticuloProveedor = {
    idArticuloProveedor: number,
    idArticulo: number,
    idProveedor: number,
    cargoPedido: number | null,
    demoraEntrega: number,
    esPredeterminado: boolean,
    precioUnitario: number,
    proveedor: Proveedor,
    articulo: Articulo,
};

type ProvTabsModalProps = {
    show: boolean;
    onHide: () => void;
    proveedor: Proveedor;
    articulos: Articulo[];
    onVolver?: (articulosEditados: ArticuloProveedor[]) => void;
};

interface DetalleProvArtProps {
    show: boolean;
    onHide: () => void;
    articulos: any[]; // artículos seleccionados desde ProvAsoc
    proveedor: any;   // proveedor actual
    onVolver: (tabsArticulosProveedor: any[]) => void;
}


const validationSchema = Yup.object({
    precioUnitario: Yup.number().required("El precio unitario es requerido").min(1, "El precio unitario debe ser mayor a 0"),
    demoraEntrega: Yup.number().required("La demora de entrega es requerida").min(1, "La demora de entrega debe ser mayor a 0"),
    cargoPedido: Yup.number().required("El cargo por pedido es requerido").min(1, "El cargo por pedido debe ser mayor a 0"),
});

const DetalleProvArt = ({ show, onHide, proveedor, articulos, onVolver }: ProvTabsModalProps) => {
    const [activeKey, setActiveKey] = useState<string>(articulos.length > 0 ? articulos[0].idArticulo.toString() : '');
    const [articulosEditados, setArticulosEditados] = useState<ArticuloProveedor[]>([]);

    const [detalles, setDetalles] = useState(() =>
        articulos.map((art: Articulo) => ({
            idArticuloProveedor: (art as any).idArticuloProveedor ?? 0,
            idArticulo: typeof art.idArticulo === "object" ? (art.idArticulo as any).idArticulo : art.idArticulo, // usa el id correctamente
            idProveedor: proveedor?.idProveedor ?? 0,
            cargoPedido: art.cargoPedido || 0,
            demoraEntrega: art.demoraEntrega || 0,
            precioUnitario: art.precioUnitario || 0,
            articulo: (art as any).idArticulo || (art as any).articulo,  // asegurate de tenerlo
            proveedor: proveedor
        }))
    );


    // Estado que guarda los valores de cada formulario por idArticulo
    const [formikStates, setFormikStates] = useState<Record<string, {
        precioUnitario: number;
        demoraEntrega: number;
        cargoPedido: number;
    }>>({});


    useEffect(() => {
        if (articulos.length > 0) {
            setActiveKey(articulos[0].idArticulo.toString());

            const inicializados = articulos.map(item => {
                // Si tiene idArticuloProveedor, asumimos que es ArticuloProveedor
                if ('idArticuloProveedor' in item) {
                    return {
                        ...item,
                        idArticuloProveedor: Number((item as any).idArticuloProveedor) || 0,
                        idProveedor: (item as any).idProveedor ?? (proveedor?.idProveedor ?? 0),
                        esPredeterminado: (item as any).esPredeterminado ?? false,
                        proveedor: proveedor ?? { idProveedor: 0, nombre: "" }, // aseguramos proveedor
                        articulo: (item as any).articulo && typeof (item as any).articulo === "object"
                            ? (item as any).articulo
                            : articulos.find((a: Articulo) => a.idArticulo === (item as any).idArticulo) ?? item,
                    } as ArticuloProveedor;
                } else {
                    // Sino es Articulo simple, transformamos a ArticuloProveedor "vacío"
                    return {
                        idArticuloProveedor: 0,
                        idArticulo: item.idArticulo,
                        idProveedor: proveedor?.idProveedor ?? 0,
                        cargoPedido: null,
                        demoraEntrega: 0,
                        esPredeterminado: false,
                        precioUnitario: 0,
                        proveedor: proveedor ?? { idProveedor: 0, nombre: "" },
                        articulo: item,
                    } as ArticuloProveedor;
                }
            });

            setArticulosEditados(inicializados);

            // Inicializo formikStates con valores iniciales para cada artículo
            const estadosIniciales: Record<string, { precioUnitario: number; demoraEntrega: number; cargoPedido: number }> = {};
            inicializados.forEach(item => {
                estadosIniciales[item.idArticulo.toString()] = {
                    precioUnitario: item.precioUnitario ?? 0,
                    demoraEntrega: item.demoraEntrega ?? 0,
                    cargoPedido: item.cargoPedido ?? 0,
                };
            });
            setFormikStates(estadosIniciales);
        }
    }, [articulos, proveedor]);


    // Formik para el artículo activo:
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: formikStates[activeKey] || {
            precioUnitario: 0,
            demoraEntrega: 0,
            cargoPedido: 0,
        },
        validationSchema,
        onSubmit: (values) => {
            // Actualizo el estado global formikStates con los valores actuales
            setFormikStates(prev => ({ ...prev, [activeKey]: values }));

            // Actualizo articulosEditados también para que mantenga la data actual
            setArticulosEditados(prev => {
                const index = prev.findIndex(a => a.idArticulo.toString() === activeKey);
                if (index >= 0) {
                    const actualizado = { ...prev[index], ...values };
                    const copy = [...prev];
                    copy[index] = actualizado;
                    return copy;
                }
                return prev;
            });
        },
    });

    const currentIndex = articulosEditados.findIndex(p => p.idArticulo.toString() === activeKey);

    // Al cambiar de tab, guardo los datos actuales y cambio activeKey
    const handleSelectTab = (k: string | null) => {
        if (!k) return;

        // Antes de cambiar, guardo los datos actuales (forzando submit de formik)
        formik.submitForm().then(() => {
            setActiveKey(k);
        });
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            handleSelectTab(articulosEditados[currentIndex - 1].idArticulo.toString());
        }
    };

    const handleNext = async () => {
        // Validar formulario actual
        const errors = await formik.validateForm();
        const hasErrors = Object.keys(errors).length > 0;

        if (hasErrors) {
            formik.setTouched({
                precioUnitario: true,
                demoraEntrega: true,
                cargoPedido: true,
            });
            return;
        }

        // Guardar los datos actuales en articulosEditados
        const actualizados = [...articulosEditados];
        actualizados[currentIndex] = {
            ...actualizados[currentIndex],
            precioUnitario: formik.values.precioUnitario,
            demoraEntrega: formik.values.demoraEntrega,
            cargoPedido: formik.values.cargoPedido,
        };

        if (currentIndex < articulosEditados.length - 1) {
            // Siguiente tab
            const siguiente = actualizados[currentIndex + 1];
            setArticulosEditados(actualizados);
            setActiveKey(siguiente.idArticulo.toString());
            formik.resetForm({
                values: {
                    precioUnitario: siguiente.precioUnitario,
                    demoraEntrega: siguiente.demoraEntrega,
                    cargoPedido: siguiente.cargoPedido ?? 0,
                }
            });
        } else {

            if (onVolver) onVolver(actualizados);
            handleVolver(); // limpia y cierra
        }
    };



    const handleVolver = () => {
        setArticulosEditados([]);
        setFormikStates({});
        formik.resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header>
                <Button variant="secondary" onClick={handleVolver}>Volver</Button>
                <Modal.Title className="ms-3">
                    Detalles Artículo/s - Proveedor
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs
                    activeKey={activeKey}
                    onSelect={handleSelectTab}
                    id="prov-tabs"
                    className="mb-3"
                >
                    {articulosEditados.map((art, index) => (
                        <Tab
                            eventKey={art.idArticulo.toString()}
                            title={art.articulo.descripcion || "Sin nombre"}
                            key={art.idArticulo}
                        >
                            {activeKey === art.idArticulo.toString() && (
                                <Form noValidate onSubmit={formik.handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Precio Unitario</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="precioUnitario"
                                            value={formik.values.precioUnitario}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={formik.touched.precioUnitario && !!formik.errors.precioUnitario}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.precioUnitario}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Demora de Entrega</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="demoraEntrega"
                                            value={formik.values.demoraEntrega}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={formik.touched.demoraEntrega && !!formik.errors.demoraEntrega}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.demoraEntrega}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cargos Pedido</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="cargoPedido"
                                            value={formik.values.cargoPedido}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={formik.touched.cargoPedido && !!formik.errors.cargoPedido}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.cargoPedido}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                            )}
                        </Tab>
                    ))}
                </Tabs>
            </Modal.Body>

            <Modal.Footer>
                <Stack direction="horizontal" gap={2} className="w-100 justify-content-between">
                    <Button
                        variant="primary"
                        disabled={currentIndex === 0}
                        onClick={handlePrev}
                    >
                        Anterior
                    </Button>
                    <Button variant="success" onClick={handleNext}>
                        {currentIndex === articulosEditados.length - 1 ? "Finalizar" : "Siguiente"}
                    </Button>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleProvArt;
