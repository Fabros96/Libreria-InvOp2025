import { Modal, Tab, Tabs, Button, Stack, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ExclamationCircleFill } from "react-bootstrap-icons";
import { showToasty } from "../../utils/toasty";

type Proveedor = {
    idProveedor: number;
    nombre: string;
};

type Articulo = {
    precioUnitario: number;
    articulo: number;
    idArticulo: number;
    descripcion: string;
    observaciones?: string;
};

type ArticuloProveedor = {
    idArticuloProveedor: number;
    idArticulo: number;
    idProveedor: number;
    demoraEntrega: number;
    fechaBaja:Date | null;
    esPredeterminado: boolean;
    precioUnitario: number;
    nivelServicio: number;
    desviacionEstandar: number;
    proveedor: Proveedor;
    articulo: Articulo;
};

type ProvTabsModalProps = {
    show: boolean;
    onHide: () => void;
    proveedor: Proveedor;
    articulos: Articulo[];
    onVolver?: (articulosEditados: ArticuloProveedor[]) => void;
};

const validationSchema = Yup.object({
    precioUnitario: Yup.number()
        .required("El precio unitario es requerido")
        .min(1, "El precio unitario debe ser mayor a 0"),
    demoraEntrega: Yup.number()
        .required("La demora de entrega es requerida")
        .min(1, "La demora de entrega debe ser mayor a 0"),
    nivelServicio: Yup.number()
        .required("El nivel de servicio es requerido")
        .min(1, "El nivel de servicio debe ser mayor a 0"),
    desviacionEstandar: Yup.number()
        .required("La desviación estándar es requerida")
        .min(1, "La desviación estándar debe ser mayor a 0"),
});

const DetalleProvArt = ({ show, onHide, proveedor, articulos, onVolver }: ProvTabsModalProps) => {
    const [activeKey, setActiveKey] = useState<string>("");
    const [articulosEditados, setArticulosEditados] = useState<ArticuloProveedor[]>([]);
    const [formikStates, setFormikStates] = useState<Record<string, any>>({});
    const [tabsWithErrors, setTabsWithErrors] = useState<Set<string>>(new Set());

    const formik = useFormik({
        initialValues: {
            precioUnitario: 0,
            demoraEntrega: 0,
            nivelServicio: 1.65,
            desviacionEstandar: 0,
        },
        validationSchema,
        onSubmit: () => { },
        enableReinitialize: false,
    });

    useEffect(() => {
        if (articulos.length > 0) {
            const initialized = articulos.map((item) => ({
                idArticuloProveedor: "idArticuloProveedor" in item ? Number(item.idArticuloProveedor) || 0 : 0,
                idArticulo: item.idArticulo,
                idProveedor: proveedor?.idProveedor ?? 0,
                demoraEntrega: (item as any).demoraEntrega ?? 0,
                fechaBaja: (item as any).fechaBaja ?? null,
                esPredeterminado: (item as any).esPredeterminado ?? false,
                precioUnitario: (item as any).precioUnitario ?? 0,
                proveedor,
                articulo: typeof (item as any).articulo === "object" ? (item as any).articulo : item,
                nivelServicio: (item as any).nivelServicio ?? 1.65,
                desviacionEstandar: (item as any).desviacionEstandar ?? 0.0,
            }));
            const noDuplicados = initialized.filter(
                (item, index, self) =>
                    index === self.findIndex((t) => t.idArticulo === item.idArticulo)
            );

            setArticulosEditados(noDuplicados);
            setActiveKey(noDuplicados[0]?.idArticulo.toString() ?? "");

            const initialStates: Record<string, any> = {};
            noDuplicados.forEach((item) => {
                initialStates[item.idArticulo.toString()] = {
                    precioUnitario: item.precioUnitario,
                    demoraEntrega: item.demoraEntrega,
                    nivelServicio: item.nivelServicio,
                    desviacionEstandar: item.desviacionEstandar,
                };
            });
            setFormikStates(initialStates);
        }
    }, [articulos, proveedor]);

    useEffect(() => {
        if (activeKey && formikStates[activeKey]) {
            formik.setValues(formikStates[activeKey]);
            formik.setTouched({});
        }
    }, [activeKey]);

    const currentIndex = articulosEditados.findIndex(
        (p) => p.idArticulo.toString() === activeKey
    );

    const handleSelectTab = (k: string | null) => {
        if (!k) return;
        setFormikStates((prev) => ({
            ...prev,
            [activeKey]: formik.values,
        }));
        setActiveKey(k);
    };

    const validarPestaniaActiva = async (): Promise<boolean> => {
        const errores = await formik.validateForm();
        const tieneErrores = Object.keys(errores).length > 0;

        if (tieneErrores) {
            formik.setTouched({
                precioUnitario: true,
                demoraEntrega: true,
                nivelServicio: true,
                desviacionEstandar: true,
            });
            setTabsWithErrors((prev) => new Set(prev).add(activeKey));
        } else {
            setTabsWithErrors((prev) => {
                const updated = new Set(prev);
                updated.delete(activeKey);
                return updated;
            });
        }

        return tieneErrores;
    };

    const validarTodasLasTabs = async (): Promise<boolean> => {
        let hayErrores = false;
        const nuevasErrores = new Set<string>();

        for (const [key, values] of Object.entries(formikStates)) {
            try {
                await validationSchema.validate(values);
            } catch {
                hayErrores = true;
                nuevasErrores.add(key);
            }
        }

        setTabsWithErrors(nuevasErrores);
        return hayErrores;
    };

    const handleNav = async (offset: number) => {
        const hasErrors = await validarPestaniaActiva();
        if (hasErrors) return;

        // Guardar los datos actualizados del tab actual
        setFormikStates((prev) => ({ ...prev, [activeKey]: formik.values }));

        const updated = [...articulosEditados];
        updated[currentIndex] = {
            ...updated[currentIndex],
            ...formik.values,
        };
        setArticulosEditados(updated);

        const nextIndex = currentIndex + offset;

        if (nextIndex >= 0 && nextIndex < updated.length) {
            setActiveKey(updated[nextIndex].idArticulo.toString());
        } else if (offset > 0) {
            // Guardar todos los tabs antes de validar
            const nuevosEstados: Record<string, any> = { ...formikStates, [activeKey]: formik.values };
            setFormikStates(nuevosEstados);

            // Validar todas las pestañas
            const nuevasTabsConErrores = new Set<string>();
            let hayErrores = false;

            for (const key of Object.keys(nuevosEstados)) {
                try {
                    await validationSchema.validate(nuevosEstados[key], { abortEarly: false });
                } catch {
                    nuevasTabsConErrores.add(key);
                    hayErrores = true;
                }
            }

            setTabsWithErrors(nuevasTabsConErrores);

            if (hayErrores) {                
                showToasty("Hay error/es en al menos un formulario, por favor revise.", "error");
                return;
            }
            if (onVolver) {
                onVolver(updated);
            }
            handleVolver();
        }
    };


    const handleVolver = () => {
        setArticulosEditados([]);
        setFormikStates({});
        setTabsWithErrors(new Set());
        formik.resetForm();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
            <Modal.Header>
                <Button variant="secondary" onClick={handleVolver}>
                    Volver
                </Button>
                <Modal.Title className="ms-3">Detalles Artículo/s - Proveedor</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs activeKey={activeKey} onSelect={handleSelectTab} className="mb-3">
                    {articulosEditados.map((art) => (
                        <Tab
                            eventKey={art.idArticulo.toString()}
                            key={art.idArticulo}
                            title={
                                <>
                                    {(art.articulo as Articulo)?.descripcion || "Sin nombre"}
                                    {tabsWithErrors.has(art.idArticulo.toString()) && (
                                        <ExclamationCircleFill color="red" className="ms-2" />
                                    )}
                                </>
                            }
                        >
                            {activeKey === art.idArticulo.toString() && (
                                <Form noValidate onSubmit={formik.handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor="precioUnitario">Precio Unitario</Form.Label>
                                        <Form.Control
                                            type="number"
                                            id="precioUnitario"
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
                                        <Form.Label htmlFor="demoraEntrega">Demora de Entrega</Form.Label>
                                        <Form.Control
                                            type="number"
                                            id="demoraEntrega"
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
                                        <Form.Label htmlFor="nivelServicio">Nivel de Servicio (Z)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            id="nivelServicio"
                                            value={formik.values.nivelServicio}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={formik.touched.nivelServicio && !!formik.errors.nivelServicio}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.nivelServicio}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor="desviacionEstandar">Desviación Estándar</Form.Label>
                                        <Form.Control
                                            type="number"
                                            id="desviacionEstandar"
                                            value={formik.values.desviacionEstandar}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            isInvalid={formik.touched.desviacionEstandar && !!formik.errors.desviacionEstandar}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.desviacionEstandar}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Form>
                            )}
                        </Tab>
                    ))}
                </Tabs>
            </Modal.Body>

             <Modal.Footer className="d-flex justify-content-between w-100">
                <Stack direction="horizontal" gap={2} className="w-100 justify-content-between">
                    <Button variant="primary" disabled={currentIndex === 0} onClick={() => handleNav(-1)}>
                        Anterior
                    </Button>
                    <Button variant="success" onClick={() => handleNav(1)}>
                        {currentIndex === articulosEditados.length - 1 ? "Finalizar" : "Siguiente"}
                    </Button>
                </Stack>
            </Modal.Footer>
        </Modal>
    );
};

export default DetalleProvArt;
