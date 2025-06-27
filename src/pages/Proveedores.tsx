import { Table, Col, Form, Row, Stack, Button, Accordion, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ProvEdit from "./Modales/provEdit";
import ProvDel from "./Modales/provDel";




import './styles/Proveedores.css';
import '../App.css';
import { showToasty } from "../utils/toasty";
import ProvArtList from "./Modales/provArtList";

// Define the Proveedor type if not imported
type Proveedor = {
    idProveedor: number; // Added to match usage in cod
    nombre: string;
    fechaBaja: Date | null;
    // Add other fields as needed
};

type Articulo = {
    idProveedor: number;
    idInventario: number;
    fechaBaja: Date | null;
    descripcion: string;
    modeloInventario: number;
    stock: number;
}

// Define ProveedorProveedor type to fix the error
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

type ProveedoresData = {
    datos: any[];
    totalPages: number;
};

const PAGE_SIZE = 10;

const Proveedores = () => {
    const [data, setData] = useState<ProveedoresData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
    const [modalType, setModalType] = useState<"new" | "asoc" | "artList" | "edit" | "baja" | null>(null);

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;


    // Para flujo de asociación artículos
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showTabsModal, setShowTabsModal] = useState(false);
    const [articulos, setArticulos] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [articulosEdit, setArticulosEdit] = useState<any[]>([]);
    const [activeTabKey, setActiveTabKey] = useState<string>("");

    const [showProvAsoc, setShowProvAsoc] = useState(false);
    const [showDetalleModal, setShowDetalleModal] = useState(false);
    const [articulosSeleccionados, setArticulosSeleccionados] = useState<any[]>([]);


    const handleAsociarSiguiente = (articulos: any[]) => {
        setArticulosSeleccionados(articulos); // Guarda los artículos seleccionados
        setShowProvAsoc(false);               // Cierra el modal ProvAsoc
        setShowDetalleModal(true);            // Abre el modal con Tabs (DetalleProvArtModal)
    };


    const handleClick = (prov: Proveedor | null, op: typeof modalType) => {
        setSelectedProveedor(prov);
        setModalType(op);
        setShowModal(true);

        if (op === "asoc") {
            setShowProvAsoc(true); // ✅ Esto es lo que faltaba
        }
    }

    const handleUpdateProveedor = async (updatedProveedor: any) => {
        try {


            // Procesar artículos
            for (const articulo of updatedProveedor.articulos) {
                const data = {
                    idProveedor: updatedProveedor.idProveedor,
                    idArticulo: articulo.idArticulo,
                    cargoPedido: articulo.cargoPedido,
                    demoraEntrega: articulo.demoraEntrega,
                    precioUnitario: articulo.precioUnitario,
                };

                if (articulo.idArticuloProveedor && articulo.idArticuloProveedor !== 0) {
                    // PUT → actualizar artículo-proveedor existente
                    await fetch(`http://localhost:3000/articulo-proveedores/${articulo.idArticuloProveedor}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });
                } else {
                    //Actualizar proveedor (nombre, etc.)

                    await fetch(`http://localhost:3000/proveedores/${updatedProveedor.idProveedor}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nombre: updatedProveedor.nombre,
                            // agregar otros campos si corresponde
                        }),
                    });

                    // POST → nuevo artículo-proveedor
                    const response = await fetch(`http://localhost:3000/articulo-proveedores`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    });
                    const creado = await response.json();

                }
            }
            showToasty("Proveedor actualizado correctamente", "success");
            setShowModal(false);
        } catch (error) {
            console.error("Error actualizando proveedor y artículos:", error);
        }
    };


    const handleCreateProveedor = async (newProveedor: any) => {
        try {
            // Crear proveedor
            const responseProv = await fetch(`http://localhost:3000/proveedores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: newProveedor.nombre,
                    // otros campos si hay
                }),
            });

            if (!responseProv.ok) {
                throw new Error("Error creando proveedor");
            }

            const proveedorCreado = await responseProv.json();

            // Extraer idProveedor desde data
            const idProveedorCreado = proveedorCreado.data.idProveedor;

            if (!idProveedorCreado) {
                throw new Error("No se recibió idProveedor del backend");
            }

            // Crear artículos vinculados al proveedor creado
            for (const articulo of newProveedor.articulos) {
                const data = {
                    idProveedor: idProveedorCreado,
                    idArticulo: articulo.idArticulo,
                    cargoPedido: articulo.cargoPedido,
                    demoraEntrega: articulo.demoraEntrega,
                    precioUnitario: articulo.precioUnitario,
                };

                const responseArt = await fetch(`http://localhost:3000/articulo-proveedores`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!responseArt.ok) {
                    throw new Error("Error creando artículo-proveedor");
                }
            }

            showToasty("Proveedor creado correctamente", "success");
            await fetchData();
            setShowModal(false);
        } catch (error) {
            console.error("Error creando proveedor y artículos:", error);
            showToasty("Error al crear proveedor", "error");
        }
    };






    const handleDelProveedor = (proveedorToDelete: Proveedor) => {
        axiosClient.delete(`/proveedores/${proveedorToDelete.idProveedor}`)
            .then(() => {
                setData(prevData => {
                    const nuevosDatos = prevData.datos.filter(
                        proveedor => proveedor.idProveedor !== proveedorToDelete.idProveedor
                    );
                    return {
                        ...prevData,
                        datos: nuevosDatos
                    };
                });
                setShowModal(false);
            })
            .catch(error => {
                console.error("Error al eliminar el proveedor:", error);
                alert("No se pudo eliminar el proveedor. Intente nuevamente.");
            });
        fetchData();
    };


    const fetchData = async () => {
        try {
            const response = await axiosClient.get("proveedores/?filter[fechaBaja][eq]=null");
            const allData: Proveedor[] = response.data || [];

            if (allData.length > 0) {
                setData({
                    datos: allData,
                    totalPages: Math.ceil(allData.length / PAGE_SIZE),
                });
                setSinDatos(false);
            } else {
                setSinDatos(true);
            }

        } catch (error) {
            console.error("El Error es: ", error);
            setSinDatos(true);
        }

    };

    useEffect(() => {
        fetchData();
    }, []);





    const filteredData = data.datos
        .filter(prov =>
            prov.nombre.toLowerCase().includes(searchText.toLowerCase()) || prov.idProveedor.toString().includes(searchText)
        )

    useEffect(() => {

        const total = Math.ceil(filteredData.length / PAGE_SIZE);
        setFilteredTotalPages(total);
        if (page > total && total > 0) {
            setPage(1);
        }
    }, [filteredData, page]);


    const currentData: Proveedor[] = filteredData.slice(startIndex, endIndex);




    const handleChangePage = useCallback((page: number) => {
        setPage(page)
    }, [])
    const renderModal = () => {
        if (!showModal || !modalType) return null;

        switch (modalType) {
            case "edit":

                return (
                    <ProvEdit
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        proveedor={selectedProveedor}
                        onSave={handleUpdateProveedor}
                        mode={modalType}
                    />
                );

            case "new":
                return (
                    <ProvEdit
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        proveedor={selectedProveedor}
                        onSave={handleCreateProveedor}
                        mode={modalType}
                    />
                );
            case "baja":
                return (
                    <ProvDel
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        proveedor={selectedProveedor}
                        onDel={handleDelProveedor}
                    />
                );
            case "artList":
                return (
                    <ProvArtList
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        proveedor={selectedProveedor ? selectedProveedor : null}
                    />
                );
            default:
                return null;
        }
    };

    const [proveedores, setProveedores] = useState<any[]>([]);



    // Cargar artículos para selección
    useEffect(() => {
        if (showSelectModal) {
            axiosClient.get("articulo-proveedores/?filter[include]=articulo&filter[articulo.fechaBaja][eq]=null")
                .then(res => setArticulos(res.data || []))
                .catch(console.error);
            setSelectedIds([]);
        }
    }, [showSelectModal]);

    const toggleSelectArticulo = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleOpenSelectModal = (proveedor: any) => {
        setSelectedProveedor(proveedor);
        setShowSelectModal(true);
    };

    const handleNextFromSelect = () => {
        const seleccionados = articulos.filter(art => selectedIds.includes(art.uuid));
        setArticulosEdit(seleccionados);
        if (seleccionados.length > 0) setActiveTabKey(seleccionados[0].uuid);
        setShowSelectModal(false);
        setShowTabsModal(true);
    };

    // Navegación tabs
    const currentIndex = articulosEdit.findIndex(a => a.uuid === activeTabKey);

    const goPrev = () => {
        if (currentIndex > 0) setActiveTabKey(articulosEdit[currentIndex - 1].uuid);
    };

    const goNext = () => {
        if (currentIndex < articulosEdit.length - 1) setActiveTabKey(articulosEdit[currentIndex + 1].uuid);
    };

    const isLast = currentIndex === articulosEdit.length - 1;

    const handleFieldChange = (uuid: string, field: string, value: any) => {
        setArticulosEdit(prev =>
            prev.map(a => (a.uuid === uuid ? { ...a, [field]: value } : a))
        );
    };

    const handleSaveAll = () => {
        // Aquí enviá los artículos actualizados y asociados al proveedor al backend
        showToasty("Artículos asociados guardados", "success");
        setShowTabsModal(false);
    };

    const handleBackToSelect = () => {
        setShowTabsModal(false);
        setShowSelectModal(true);
    };
    return (
        <>
            <Stack className="proveedores-container">
                <div className="p-2"><h3>Proveedores</h3></div>
                <Row className="p-2 barraBusquedaDiv">
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar"
                            className="mr-sm-2"
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setPage(1);
                            }}

                        />

                    </Col>

                    <Col sm={1}></Col>
                    <Col sm={3}>
                        <Button className="newProvButton1" onClick={() => {
                            setSelectedProveedor(null);
                            setModalType("new");
                            setShowModal(true);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            <span> Nuevo Proveedor</span>
                        </Button>

                    </Col>
                </Row>
                <div className="p-2 divmedio">



                    <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {sinDatos ? (
                            <div style={{ fontSize: '18px', color: '#666' }}>No hay datos para mostrar</div>
                        ) : (
                            <Table className="tableProveedores">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th >Descripción (Click para más detalles)</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...new Map(currentData.map(item => [item.idProveedor, item])).values()].map(
                                        (prov: Proveedor) => (
                                            <tr key={prov.idProveedor}>
                                                <td style={{ width: '5%' }} >
                                                    <p>{prov.idProveedor}</p>
                                                </td>
                                                <td style={{ width: '70%' }} >
                                                    <Accordion defaultActiveKey="1" >

                                                        <Accordion.Item eventKey="0">
                                                            <Accordion.Header>{prov.nombre}</Accordion.Header>
                                                            <Accordion.Body>
                                                                <div style={{ paddingLeft: "1rem", fontSize: "0.85rem" }}>
                                                                    <div>
                                                                        <strong> Datos como Direccion y otros:</strong>
                                                                    </div>
                                                                </div>
                                                            </Accordion.Body>

                                                        </Accordion.Item>
                                                    </Accordion>
                                                </td>
                                                <td className="botoneraTabla" >
                                                    {/* <OverlayTrigger key={prov.idProveedor + 'btn1'} overlay={<Tooltip id={`top`}> Asociar Artículo/s </Tooltip>} >
                                                        <Button variant="success" onClick={() => handleClick(prov, "asoc")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-arrow-left-right" viewBox="0 0 16 16">
                                                            <path d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger> */}
                                                    <OverlayTrigger key={prov.idProveedor + 'btn2'} overlay={<Tooltip id={`top`}> Ver Artículos de este Proveedor </Tooltip>} >
                                                        <Button variant="primary" onClick={() => handleClick(prov, "artList")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-boxes" viewBox="0 0 16 16">
                                                            <path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2.001a.5.5 0 0 1-.496 0l-3.75-2.143A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger key={prov.idProveedor + 'btn3'} overlay={<Tooltip id={`top`}> Editar Proveedor </Tooltip>} >
                                                        <Button variant="warning" onClick={() => handleClick(prov, "edit")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                                                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger key={prov.idProveedor + 'btn5'} overlay={<Tooltip id={`top`}> Eliminar Proveedor</Tooltip>} >
                                                        <Button variant="danger" onClick={() => handleClick(prov, "baja")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                </td>

                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div>
                <div className="fixed-pagination d-flex justify-content-center">
                    {data.totalPages > 1 && (
                        <MyPagination
                            total={Math.ceil(filteredTotalPages)}
                            current={page}
                            onChangePage={handleChangePage}
                        />
                    )}
                </div>
            </Stack>
            {renderModal()}

        </>
    )
}

export default Proveedores