import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import "../../App.css";
import type { AxiosResponse } from "axios";

interface ArtProvProps {
    articulo: any | null;
    show: boolean;
    onHide: () => void;
    onSave: (updatedArticulo: any) => void;
    mode: "view" | "edit" | "new";
    onProveedorPredeterminadoChange?: (proveedor: any | null) => void;
    onReload?: () => void;
}

type ArticuloProveedor = {
    idArticuloProveedor: number,
    idArticulo: number,
    idProveedor: number,
    demoraEntrega: number,
    fechaBaja: Date | null,
    esPredeterminado: boolean,
    precioUnitario: number,
    proveedor: any,
    articulo: any,
};

type ArticulosData = {
    datos: any[];
};

const ArtProv = ({ articulo, show, mode, onHide, onSave, onProveedorPredeterminadoChange }: ArtProvProps) => {



    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);
    const [selectedPredeterminado, setSelectedPredeterminado] = useState<ArticuloProveedor | null>(null);
    const [originales, setOriginales] = useState<ArticuloProveedor[]>([]);
    const [proveedorDeterminadoOriginal, setProveedorDeterminadoOriginal] = useState<any | null>(null);




    useEffect(() => {
        if (articulo && articulo.proveedor) {
            setSelectedPredeterminado(articulo.proveedor);
            if (onProveedorPredeterminadoChange) {
                onProveedorPredeterminadoChange(articulo.proveedor);
            }
        }

        const fetchData = async () => {
            try {
                let response: AxiosResponse<any, any> | null = null;

                if (mode === "edit" || mode === "view") {
                    response = await axiosClient.get(
                        `articulo-proveedores/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=proveedor,articulo&filter[proveedor.fechaBaja][eq]=null`
                    );
                } else if (mode === "new") {
                    response = await axiosClient.get(`proveedores/`);
                }

                const allData = response?.data?.datos || response?.data || [];
                const mapa = new Map<number, ArticuloProveedor>();

                for (const item of allData) {
                    const existente = mapa.get(item.idProveedor);
                    // Si no existe, o si este es predeterminado y el anterior no, lo reemplaza
                    if (!existente || item.esPredeterminado) {
                        mapa.set(item.idProveedor, item);
                    }
                }

                const dataUnicaPorProveedor = Array.from(mapa.values());

                // ✔️ Buscar el predeterminado entre los datos únicos
                const proveedorPredeterminado = dataUnicaPorProveedor.find(
                    (item) => item.esPredeterminado === true
                ) || null;

                setProveedorDeterminadoOriginal(proveedorPredeterminado);
                setSelectedPredeterminado(proveedorPredeterminado);

                if (onProveedorPredeterminadoChange) {
                    onProveedorPredeterminadoChange(proveedorPredeterminado);
                }

                // ✅ Setear solo los datos únicos
                setData({ datos: dataUnicaPorProveedor });
                setOriginales(JSON.parse(JSON.stringify(dataUnicaPorProveedor)));

            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, [articulo, mode]);





    // RESETEAR estados cuando se cierra el modal
    useEffect(() => {
        if (!show) {
            setSelectedPredeterminado(proveedorDeterminadoOriginal);

            if (proveedorDeterminadoOriginal) {
                const nuevosDatos = data.datos.map((item) => ({
                    ...item,
                    esPredeterminado:
                        item.idArticuloProveedor === proveedorDeterminadoOriginal.idArticuloProveedor,
                }));
                setData({ datos: nuevosDatos });
            }
        }
    }, [show]);


    // Función para cerrar el modal y resetear estados
    const handleClose = () => {
        setSelectedPredeterminado(proveedorDeterminadoOriginal);
        if (proveedorDeterminadoOriginal) {
            const nuevosDatos = data.datos.map((item) => ({
                ...item,
                esPredeterminado:
                    item.idArticuloProveedor === proveedorDeterminadoOriginal.idArticuloProveedor,
            }));
            setData({ datos: nuevosDatos });
        }
        onHide();
    };



    const handleSave = () => {
        const proveedorSeleccionado = data.datos.find(p => p.esPredeterminado);
        if (!proveedorSeleccionado) return;

        setSelectedPredeterminado(proveedorSeleccionado);

        const cambios = data.datos.filter((prov) => {
            const original = originales.find(o => o.idArticuloProveedor === prov.idArticuloProveedor);
            if (!original) return false;
            return prov.esPredeterminado !== original.esPredeterminado;
        });

        if (onSave) {
            if (!proveedorSeleccionado) return;
            onSave({
                proveedorPredeterminado: proveedorSeleccionado,
                cambios,
                proveedorOriginal: proveedorDeterminadoOriginal,
                proveedorNuevo: proveedorSeleccionado,
            });
        }
        onHide();
    };

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const getFilteredData = () => {
        if (showAll) return data.datos;
        if (searchText.trim().length < 1) return data.datos;

        const textoBusqueda = normalizarTexto(searchText);

        return data.datos.filter(articulo => {
            const nombreProveedor = normalizarTexto(articulo.proveedor?.nombre || "");
            return nombreProveedor.includes(textoBusqueda);
        });
    };


    const filteredData = getFilteredData();

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Proveedores {articulo ? "de: " + articulo.descripcion : ""}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            name="srchProveedor"
                            placeholder="Buscar Proveedor"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setShowAll(false);
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setSearchText("");
                                setShowAll(true);
                            }}
                        >
                            Mostrar todos
                        </Button>
                    </InputGroup>

                    <Table className="tableArticulos">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Descripción</th>
                                <th>Proveedor por defecto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-muted">
                                        <p>
                                            {searchText.trim() === "" && !showAll
                                                ? "Busca un proveedor para ver resultados."
                                                : "No se encontraron resultados."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((obj, index) => (
                                    mode === "new" ? (
                                        <tr key={obj.idProveedor}>
                                            <td style={{ width: '22%' }}>
                                                <p>{obj.idProveedor}</p>
                                            </td>
                                            <td style={{ width: '50%' }}>
                                                <p>{obj.nombre}</p>
                                            </td>
                                            <td className="botoneraTabla">
                                                <Form.Check
                                                    type="radio"
                                                    name="providerSelect"
                                                    checked={selectedPredeterminado?.idProveedor === obj.idProveedor}
                                                    onChange={() => {
                                                        const nuevosDatos = data.datos.map((item) => ({
                                                            ...item,
                                                            esPredeterminado: item.proveedor.idProveedor === obj.idProveedor
                                                        }));
                                                        setData({ datos: nuevosDatos });
                                                        setSelectedPredeterminado(obj);
                                                        if (onProveedorPredeterminadoChange) {
                                                            onProveedorPredeterminadoChange(obj);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={obj.proveedor.nombre}>
                                            <td style={{ width: '22%' }}>
                                                <p>{obj.proveedor.idProveedor}</p>
                                            </td>
                                            <td style={{ width: '50%' }}>
                                                <p>{obj.proveedor.nombre}</p>
                                            </td>
                                            <td className="botoneraTabla">
                                                <Form.Check
                                                    type="radio"
                                                    aria-label={`radio-${index}`}
                                                    name="providerSelect"
                                                    checked={obj.idArticuloProveedor === selectedPredeterminado?.idArticuloProveedor}
                                                    disabled={mode === "view"}
                                                    onChange={() => {
                                                        const nuevosDatos = data.datos.map((item) => ({
                                                            ...item,
                                                            esPredeterminado: item.idArticuloProveedor === obj.idArticuloProveedor,
                                                        }));

                                                        setData({ datos: nuevosDatos });
                                                        setSelectedPredeterminado(obj);
                                                    }}
                                                />

                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </Table>
                </Form.Group>
            </Modal.Body>

            {mode !== "view" && (
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button variant={selectedPredeterminado ? "success" : "outline-success"} onClick={handleSave}>
                        Guardar
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default ArtProv;