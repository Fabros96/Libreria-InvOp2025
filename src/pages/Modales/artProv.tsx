import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import { showToasty } from "../../utils/toasty";
import "../../App.css";
import type { AxiosResponse } from "axios";

interface ArtProvProps {
    articulo: any | null;
    show: boolean;
    onHide: () => void;
    onSave: (updatedArticulo: any) => void;
    mode: "provView" | "provEdit" | "provNew";
    onProveedorPredeterminadoChange?: (proveedor: any | null) => void;
    onReload?: () => void;
}


type Proveedor = {
    idProveedor: number;
    nombre: string;
    fechaBaja: Date | null;
};

type Articulo = {
    idProveedor: number;
    idInventario: number;
    fechaBaja: Date | null;
    descripcion: string;
    modeloInventario: number;
    stock: number;
}

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

type ArticulosData = {
    datos: any[];
};

const ArtProv = ({ articulo, show, mode, onHide, onSave, onProveedorPredeterminadoChange, onReload }: ArtProvProps) => {
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);
    const [selectedPredeterminado, setSelectedPredeterminado] = useState<ArticuloProveedor | null>(null);
    const [selectedIdArticulo, setSelectedIdArticulo] = useState<number | null>(null);
    const [originales, setOriginales] = useState<ArticuloProveedor[]>([]);
    const [selectedDescripcion, setSelectedDescripcion] = useState<string>("");
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

                if (mode === "provEdit" || mode === "provView") {
                    response = await axiosClient.get(
                        `articulo-proveedores/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=proveedor,articulo`
                    );
                } else if (mode === "provNew") {
                    response = await axiosClient.get(`proveedores/`);
                }

                const allData = response?.data?.datos || response?.data || [];

                const proveedores = allData.map((item: any) => ({
                    ...item.proveedor,
                    esPredeterminado: item.esPredeterminado,
                }));

                const proveedorPredeterminado = allData.find((item: any) => item.esPredeterminado === true) || null;
                // ACA
                setProveedorDeterminadoOriginal(proveedorPredeterminado);

                setSelectedPredeterminado(proveedorPredeterminado);
                setSelectedIdArticulo(proveedorPredeterminado?.idArticulo || null);

                if (onProveedorPredeterminadoChange) {
                    onProveedorPredeterminadoChange(proveedorPredeterminado);
                }


                setData({ datos: allData });
                setOriginales(JSON.parse(JSON.stringify(allData)));
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
            setSelectedDescripcion("");

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
        setSelectedDescripcion("");

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

        // Le pasás al padre: proveedor predeterminado y lista de cambios
        if (onSave) {
            onSave({
                proveedorPredeterminado: proveedorSeleccionado,
                cambios,
            });
        }

        onHide();
    };





    const getFilteredData = () => {
        if (showAll) return data.datos;
        if (searchText.trim().length < 1) return data.datos;

        return data.datos.filter(articulo =>
            articulo.proveedor.nombre?.toLowerCase().includes(searchText.toLowerCase())
        );
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
                                    mode === "provNew" ? (
                                        <tr key={obj.proveedor.idProveedor}>
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
                                                    onChange={() => {
                                                        const nuevosDatos = data.datos.map((item) => ({
                                                            ...item,
                                                            esPredeterminado: item.idArticuloProveedor === obj.idArticuloProveedor
                                                        }));
                                                        setData({ datos: nuevosDatos });
                                                        setSelectedIdArticulo(obj.idArticulo);
                                                        setSelectedDescripcion(obj.descripcion);
                                                        setSelectedPredeterminado(prev => {
                                                            if (onProveedorPredeterminadoChange) {
                                                                onProveedorPredeterminadoChange(obj);
                                                            }
                                                            return obj;
                                                        });

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
                                                    disabled={mode === "provView"}
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

            {mode !== "provView" && (
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={onHide}>
                        Cancelar
                    </Button>
                    <Button
                        variant={selectedIdArticulo ? "success" : "outline-success"}
                        onClick={handleSave}
                        disabled={!selectedIdArticulo}
                    >
                        Guardar
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default ArtProv;