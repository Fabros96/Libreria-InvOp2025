import { Modal, Button, Form, InputGroup, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

import "../styles/Articulos.css";
import "../styles/Proveedores.css";

type ArticulosData = { datos: any[] };

interface ProvAsocProps {
    show: boolean;
    proveedor: any | null;
    onHide: () => void;
    onSiguiente: (articulosSeleccionados: any[]) => void;
}

type Proveedor = {
    idProveedor: number;
    nombre: string;
    fechaBaja: Date | null;
};

type Articulo = {
    idArticulo: number;  // Asegurarse que sea idArticulo, no idInventario
    descripcion: string;
    fechaBaja: Date | null;

    
};

type ArticuloProveedor = {
    idArticuloProveedor: number;
    idArticulo: number;
    idProveedor: number;
    articulo: Articulo;
    // otros campos
};

const ProvAsoc = ({ show, onHide, proveedor, onSiguiente }: ProvAsocProps) => {
    const [selectedIdsArticulos, setSelectedIdsArticulos] = useState<string[]>([]);
    const [data, setData] = useState<ArticulosData>({ datos: [] });
    //const [articulosProveedorList, setArticulosProveedorList] = useState<ArticuloProveedor[]>([]);
    const [articulosProveedorList, setArticulosProveedorList] = useState<Articulo[]>([]);
    const [searchText, setSearchText] = useState("");
    const [showAll, setShowAll] = useState(true);

    // Cargar artículos generales
    useEffect(() => {
        const fetchArticulos = async () => {
            try {
                const response = await axiosClient.get("articulos");
                setData({ datos: response.data || [] });
            } catch (error) {
                console.error("Error al obtener artículos:", error);
            }
        };
        fetchArticulos();
    }, []);

    // Cargar artículos asociados al proveedor cuando cambia el proveedor o modal se abre
    // useEffect(() => {
    //     if (!proveedor) return;

    //     const fetchArticulosProveedor = async () => {
    //         try {
    //             console.log("hola")
    //             const response = await axiosClient.get(
    //                 `articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}&filter[include]=articulo,proveedor&filter[articulo.fechaBaja][eq]=null`
    //             );

    //             const articulosProv: ArticuloProveedor[] = response.data || [];
    //             setArticulosProveedorList(articulosProv);

    //             // Inicializar checkboxes marcados con los idArticulo que ya están asociados
    //             const idsSeleccionados = articulosProv.map((ap) => ap.idArticulo.toString());
    //             setSelectedIdsArticulos(idsSeleccionados);
    //         } catch (error) {
    //             console.error("Error al obtener artículos del proveedor:", error);
    //         }
    //     };

    //     fetchArticulosProveedor();
    // }, [proveedor, show]);

    useEffect(() => {
    if (!proveedor) return;

    const fetchArticulosProveedor = async () => {
        try {
            console.log("🔄 Iniciando búsqueda de artículos activos y asociaciones para proveedor ID:", proveedor.idProveedor);

            // 1️⃣ Obtener todos los artículos activos (sin fecha de baja)
            const responseArticulos = await axiosClient.get(
                `articulos/?filter[fechaBaja][eq]=null`
            );
            const articulosActivos: Articulo[] = responseArticulos.data?.datos || responseArticulos.data || [];
            console.log("📦 Artículos activos:", articulosActivos);

            // 2️⃣ Obtener las asociaciones artículo-proveedor del proveedor actual
            const responseAsociaciones = await axiosClient.get(
                `articulo-proveedores/?filter[idProveedor][eq]=${proveedor.idProveedor}`
            );
            const asociaciones: ArticuloProveedor[] = responseAsociaciones.data?.datos || responseAsociaciones.data || [];
            console.log("🔗 Artículos asociados al proveedor:", asociaciones);

            // 3️⃣ Obtener los IDs de artículos asociados a este proveedor
            const idsAsociados = asociaciones.map((ap) => ap.idArticulo.toString());

            // 4️⃣ Guardar en el estado los artículos activos
            setArticulosProveedorList(articulosActivos);

            // 5️⃣ Guardar los IDs de artículos ya asociados al proveedor (para checkboxes)
            setSelectedIdsArticulos(idsAsociados);

            console.log("✅ IDs seleccionados:", idsAsociados);
        } catch (error) {
            console.error("❌ Error al obtener artículos o asociaciones:", error);
        }
    };


    fetchArticulosProveedor();
}, [proveedor, show]);

/*para dar de alta el proveedor y muestro articulos activos asi puede asociar al  menos uno*/ 
useEffect(() => {
    if (proveedor) return; // este bloque es solo para proveedor nuevo

    const fetchArticulosActivos = async () => {
        try {
            console.log("📦 Cargando artículos activos para nuevo proveedor...");

            const response = await axiosClient.get(
                `articulos/?filter[fechaBaja][eq]=null`
            );
            const articulosActivos: Articulo[] = response.data?.datos || response.data || [];
            setArticulosProveedorList(articulosActivos);

            console.log("✅ Artículos disponibles:", articulosActivos);
        } catch (error) {
            console.error("❌ Error al obtener artículos activos:", error);
        }
    };

    fetchArticulosActivos();
}, [show]);




    const handleCheckboxChange = (idArticulo: string) => {
        setSelectedIdsArticulos((prev) =>
            prev.includes(idArticulo)
                ? prev.filter((id) => id !== idArticulo)
                : [...prev, idArticulo]
        );
    };

    const filteredData = showAll
        ? data.datos
        : searchText.trim() === ""
            ? []
            : data.datos.filter((articulo) =>
                articulo.descripcion?.toLowerCase().includes(searchText.toLowerCase())
            );

    const handleSiguiente = () => {
        
        const seleccionados = selectedIdsArticulos.map((idStr) => {
            const id = Number(idStr);
            
            // Buscar en articulosProveedorList primero (artículos ya asociados)
            const articuloProvExistente = articulosProveedorList.find(
                (ap) => ap.idArticulo === id
            );
            
            if (articuloProvExistente) {
                // Retorna el objeto completo del artículo-proveedor con sus datos
                return articuloProvExistente;
            }
            
            // Si no está en articulosProveedorList, buscar en data.datos (artículo básico)
            const articuloNuevo = data.datos.find((art) => art.idArticulo === id);
            
            return articuloNuevo || null;
        }).filter(Boolean); // filtrar posibles nulls

        onSiguiente(seleccionados);
    };


    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <h3>Asociar Proveedor-Artículo/s</h3>
                    <h5>
                        Proveedor:{" "}
                        {proveedor ? (
                            <strong>
                                {proveedor.idProveedor + " -- " + proveedor.nombre}
                            </strong>
                        ) : (
                            ""
                        )}
                    </h5>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group>
                    <InputGroup className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Buscar Artículo/s"
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

                    <div className="tableProveedores">
                        <Table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Descripción</th>
                                    <th>Seleccionar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center text-muted">
                                            {searchText.trim() === "" && !showAll
                                                ? "Busca un artículo para ver resultados."
                                                : "No se encontraron resultados."}
                                        </td>
                                    </tr>
                                ) : (
                                    articulosProveedorList.map((art) => (
                                        <tr key={art.idArticulo}>
                                            <td>{art.idArticulo}</td>
                                            <td>{art.descripcion}</td>
                                            <td>
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedIdsArticulos.includes(
                                                        art.idArticulo.toString()
                                                    )}
                                                    onChange={() =>
                                                        handleCheckboxChange(art.idArticulo.toString())
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Form.Group>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>
                    Cancelar
                </Button>
                <Button
                    variant="success"
                    onClick={handleSiguiente}
                    disabled={selectedIdsArticulos.length === 0}
                >
                    Siguiente
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProvAsoc;
