import { Modal, Button, Form, Table, InputGroup } from "react-bootstrap";
import axiosClient from "../../api/axiosClient";
import { useState, useEffect } from "react";
import "../../App.css";
import type { AxiosResponse } from "axios";
import DetalleProvArt from "./detalleProvArt";
import { showToasty } from "../../utils/toasty";

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

    const [showDetalleProvArt, setShowDetalleProvArt] = useState(false);
    const [articulosSeleccionados, setArticulosSeleccionados] = useState<any[]>([]);
    const [datosASalvar, setDatosASalvar] = useState<any | null>(null);

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
                        `articulo-proveedores/?filter[idArticulo][eq]=${articulo.idArticulo}&filter[include]=proveedor,articulo&filter[proveedor.fechaBaja][eq]=null&filter[fechaBaja][eq]=null`
                        
                    );
                } else if (mode === "new") {
                    setSelectedPredeterminado(null); // 🔧 Reiniciar también aquí
                    response = await axiosClient.get(`proveedores/?filter[fechaBaja][eq]=null`);
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
        if (datosASalvar) {
            const proveedor = datosASalvar.proveedorPredeterminado;
            const articuloProveedorOriginal = datosASalvar.articulosProveedor?.[0];

            const datosAPasar = {
                idArticuloProveedor: articuloProveedorOriginal.idArticuloProveedor,
                idArticulo: articuloProveedorOriginal.idArticulo,
                idProveedor: proveedor.idProveedor, // ← se reemplaza el id del proveedor
                demoraEntrega: articuloProveedorOriginal.demoraEntrega,
                fechaBaja: articuloProveedorOriginal.fechaBaja,
                esPredeterminado: articuloProveedorOriginal.esPredeterminado,
                precioUnitario: articuloProveedorOriginal.precioUnitario,
                nivelServicio: articuloProveedorOriginal.nivelServicio,
                desviacionEstandar: articuloProveedorOriginal.desviacionEstandar,
                articulo: {
                    ...articuloProveedorOriginal.articulo,
                },
                proveedor: {
                    ...proveedor,
                },
            };
            onSave({ nuevoAP: datosAPasar });
            onHide();
        }

    }, [show, datosASalvar]);


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
    const handleNewAP = async () => {
        if (!selectedPredeterminado) return;

        // Este es el nuevo artículo que estás creando
        const nuevoArticulo = {
            idArticulo: 0, // 0 o un ID temporal ficticio, ya que es nuevo
            descripcion: "Nuevo Artículo",
            observaciones: "",
            precioUnitario: 0,
        };

        // El proveedor predeterminado seleccionado
        const proveedor = selectedPredeterminado.proveedor || selectedPredeterminado;

        // Armás el objeto con la forma que espera DetalleProvArt
        const nuevoArticuloProveedor = {
            idArticuloProveedor: 0,
            idArticulo: nuevoArticulo.idArticulo,
            idProveedor: proveedor.idProveedor,
            demoraEntrega: 0,
            fechaBaja: null,
            esPredeterminado: true,
            precioUnitario: 0,
            nivelServicio: 1.65,
            desviacionEstandar: 0,
            proveedor,
            articulo: nuevoArticulo,
        };

        setArticulosSeleccionados([nuevoArticuloProveedor]);
        setShowDetalleProvArt(true);
    };

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const getFilteredData = () => {
        if (showAll) return data.datos;
        if (searchText.trim().length < 1) return data.datos;

        const textoBusqueda = normalizarTexto(searchText);

        return data.datos.filter(proveedor => {

            const nombreProveedor = normalizarTexto(proveedor.nombre || "");
            const idProveedorStr = proveedor.idProveedor?.toString() || "";
            return (
                nombreProveedor.includes(textoBusqueda) ||
                idProveedorStr.includes(searchText)
            );
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
                                <th>Nombre</th>
                                <th>
                                    {mode === "new" ? "Seleccionar" : "Predeterminado"}
                                </th>
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
                                                    onChange={() => {
                                                        const nuevosDatos = data.datos.map((item) => ({
                                                            ...item,
                                                            esPredeterminado: item.idProveedor === obj.idProveedor
                                                        }));
                                                        setData({ datos: nuevosDatos });
                                                        setSelectedPredeterminado(obj);
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
                 <Modal.Footer className="d-flex justify-content-between w-100">
                    <Button variant="outline-danger" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant={selectedPredeterminado ? "success" : "outline-success"} onClick={mode === "new" ? handleNewAP : handleSave} disabled={!selectedPredeterminado} >

                        {mode === "new" ? "Siguiente" : "Guardar"}
                    </Button>
                </Modal.Footer>
            )
            }
            <DetalleProvArt
                show={showDetalleProvArt}
                onHide={() => setShowDetalleProvArt(false)}
                articulos={articulosSeleccionados}
                proveedor={selectedPredeterminado?.proveedor}
                onVolver={(articulosEditados) => {
                    setShowDetalleProvArt(false);
                    setDatosASalvar({
                        proveedorPredeterminado: selectedPredeterminado,
                        articulosProveedor: articulosEditados,
                    });
                    if (onProveedorPredeterminadoChange && selectedPredeterminado) {
                        onProveedorPredeterminadoChange(selectedPredeterminado);
                    }
                }}
            />
        </Modal >
    )
        ;

};

export default ArtProv;