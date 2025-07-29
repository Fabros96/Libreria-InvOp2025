import { Table, Col, Form, Row, Stack, Button, Accordion, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ProvEdit from "./Modales/provEdit";

import './styles/Proveedores.css';
import '../App.css';
import { showToasty } from "../utils/toasty";
import ProvArtList from "./Modales/provArtList";
import { useConfirmModal } from "../utils/useConfirmModal";
import TablaEliminadosGenerica from "../utils/TablaEliminadosGenerica";

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
    demoraEntrega: number,
    fechaBaja: Date | null,
    esPredeterminado: boolean,
    precioUnitario: number,
    nivelServicio: number,
    desviacionEstandar: number,
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
    const [modalType, setModalType] = useState<"new" | "asoc" | "artList" | "edit" | "baja" | "delHist" | null>(null);

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);

    const { requestConfirmation, modal: confirmModal } = useConfirmModal();

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;


    // Para flujo de asociación artículos
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [articulos, setArticulos] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showProvAsoc, setShowProvAsoc] = useState(false);


    const handleDeleteProveedorValidation = async (prov: Proveedor) => {
        // Confirmación inicial para eliminar proveedor
        const confirm = await requestConfirmation(
            <>
                <h4>¿Seguro que desea eliminar el proveedor<br /><strong> #{prov.idProveedor} - {prov.nombre}</strong>?<br /></h4>
                <h5><i>(Esta acción no se puede deshacer. ⚠️)</i></h5>
            </>
        );
        if (!confirm) return false;

        try {
            // Validar si proveedor es predeterminado en algún artículo activo
            const responseEsPredeterminado = await axiosClient.get(
                `articulo-proveedores/?filter[idProveedor][eq]=${prov.idProveedor}&filter[include]=articulo&filter[articulo.fechaBaja][eq]=null&filter[fechaBaja][eq]=null`
            );
            const lista = responseEsPredeterminado.data;

            if (Array.isArray(lista) && lista.some(item => item.esPredeterminado === true)) {
                showToasty('No se puede eliminar este proveedor, es predeterminado de al menos un artículo', 'error');
                return false;
            }

            // Validar órdenes pendientes
            const responsePendiente = await axiosClient.get(
                `orden-compras/?filter[idProveedor][eq]=${prov.idProveedor}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Pendiente`
            );
            // Validar órdenes enviadas
            const responseEnviada = await axiosClient.get(
                `orden-compras/?filter[idProveedor][eq]=${prov.idProveedor}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Enviado`
            );

            const pendientes = responsePendiente.data || [];
            const enviadas = responseEnviada.data || [];

            if (pendientes.length > 0 || enviadas.length > 0) {
                if (pendientes.length > 0 && enviadas.length > 0) {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes pendientes y enviadas', 'error');
                } else if (pendientes.length > 0) {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes pendientes', 'error');
                } else {
                    showToasty('No se puede eliminar el proveedor, tiene órdenes enviadas', 'error');
                }
                return false;
            }

            // Si pasa todas las validaciones, eliminar proveedor
            handleDelProveedor(prov);
            showToasty('Proveedor eliminado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error("Error al verificar datos del proveedor:", error);
            showToasty('Error al verificar datos del proveedor', 'error');
            return false;
        }
    };



    const handleClick = async (prov: Proveedor | null, op: typeof modalType) => {
        setSelectedProveedor(prov);
        setModalType(op);

        if (op === "asoc") {
            setShowProvAsoc(true);
            setShowModal(true);
            return;
        }

        if (op === "baja" && prov) {
            const eliminado = await handleDeleteProveedorValidation(prov);
            if (eliminado) {
                setShowModal(false);
            }
            return;
        }

        setShowModal(true);
    };


    // Función para crear asociaciones nuevas (sin idArticuloProveedor)
    const crearNuevasAsociaciones = async (articulos: any[], idProveedor: number) => {
        for (const articulo of articulos) {
            // Solo crear las que no tienen idArticuloProveedor válido
            if (!articulo.idArticuloProveedor || articulo.idArticuloProveedor === 0) {
                const data = {
                    idProveedor,
                    idArticulo: articulo.idArticulo,
                    esPredeterminado: false,
                    demoraEntrega: articulo.demoraEntrega ?? 0,
                    precioUnitario: articulo.precioUnitario ?? 0,
                    nivelServicio: articulo.nivelServicio ?? 0,
                    desviacionEstandar: articulo.desviacionEstandar ?? 0,
                    modeloInventario: articulo.articulo?.modeloInventario ?? "LF",
                    // Si necesitás más campos, agregalos acá
                };

                const response = await fetch(`http://localhost:3000/articulo-proveedores`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    console.error("Error creando asociación:", errorMsg);
                    showToasty("Error al crear asociación de artículo", "error");
                    return false;
                }
            }
        }
        return true;
    };

    // Función para actualizar asociaciones existentes o crear las nuevas si no tienen id
    const actualizarAsociaciones = async (updatedProveedor: any) => {
        for (const articulo of updatedProveedor.articulos) {
            const data = {
                idArticulo: articulo.idArticulo,
                demoraEntrega: articulo.demoraEntrega ?? 0,
                precioUnitario: articulo.precioUnitario ?? 0,
                nivelServicio: articulo.nivelServicio ?? 0,
                desviacionEstandar: articulo.desviacionEstandar ?? 0,
                modeloInventario: articulo.articulo?.modeloInventario ?? "LF",
                // agregar más campos si necesario
            };

            if (articulo.idArticuloProveedor && articulo.idArticuloProveedor > 0) {
                // PUT → actualizar asociación existente
                const response = await fetch(`http://localhost:3000/articulo-proveedores/${articulo.idArticuloProveedor}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorMsg = await response.text();
                    console.error(`Error actualizando artículo-proveedor ${articulo.idArticuloProveedor}:`, errorMsg);
                    showToasty(`Error al actualizar artículo ${articulo.idArticuloProveedor}`, "error");
                    return false;
                }
            }
        }
        // Luego crear nuevas asociaciones que no tengan id
        const crearOk = await crearNuevasAsociaciones(updatedProveedor.articulos, updatedProveedor.idProveedor);
        if (!crearOk) return false;

        showToasty("Proveedor actualizado exitosamente.", "success");
        return true;
    };


    // Modificación en handleUpdateProveedor
    const handleUpdateProveedor = async (updatedProveedor: any, x?: string | null, articulosProveedorList?: any[]) => {

        //Metodo para borrar los deseleccionados
        const actualizarAsociacionesEliminadas = async () => {
            const nuevosIds = updatedProveedor.articulos.map((a: { idArticulo: any; }) => a.idArticulo);
            const eliminados = (articulosProveedorList || []).filter(a => !nuevosIds.includes(a.idArticulo));

            for (const articuloEliminado of eliminados) {
                if (articuloEliminado.esPredeterminado) {
                    const confirm = await requestConfirmation(
                        `El artículo ${articuloEliminado.articulo.descripcion} es el predeterminado. ¿Confirmas eliminar la asociación?`
                    );
                    if (!confirm) {
                        continue; // saltar a siguiente sin borrar
                    }
                }
                try {
                    const response = await fetch(`http://localhost:3000/articulo-proveedores/${articuloEliminado.idArticuloProveedor}`, {
                        method: "DELETE",
                    });
                    if (!response.ok) {
                        const errorMsg = await response.text();
                        console.error(`Error al eliminar asociación id ${articuloEliminado.idArticuloProveedor}:`, errorMsg);
                        return false;
                    }
                } catch (error) {
                    console.error("Error en fetch eliminar asociación:", error);
                    showToasty("Error de conexión al eliminar asociación", "error");
                    return false;
                }
            }
            return true;
        };
        //Metodo para actualizar solo el nombre
        const actualizarNombreProveedor = async () => {
            await fetch(`http://localhost:3000/proveedores/${updatedProveedor.idProveedor}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: updatedProveedor.nombre,
                    // agregar otros campos si corresponde
                }),
            });
        }


        try {
            let cambiosRealizados = false;

            switch (x) {
                case "asoc":
                    await actualizarAsociacionesEliminadas(); // primero eliminar
                    cambiosRealizados = await actualizarAsociaciones(updatedProveedor);
                    break;
                case "nomProv":
                    await actualizarNombreProveedor();
                    showToasty("Proveedor actualizado exitosamente.", "success");
                    cambiosRealizados = true;
                    break;
                case "ambos":
                    await actualizarNombreProveedor();
                    await actualizarAsociacionesEliminadas();
                    cambiosRealizados = await actualizarAsociaciones(updatedProveedor);
                    break;
                default:
                    console.error("Error: opción desconocida");
                    break;
            }

            if (cambiosRealizados) {
                await fetchData();
                setShowModal(false);
            }
        } catch (error) {
            console.error("Error actualizando proveedor y artículos:", error);
            showToasty("Error actualizando proveedor", "error");
        }
    };

    // Modificación en handleCreateProveedor para usar crearNuevasAsociaciones
    const handleCreateProveedor = async (newProveedor: any) => {
        try {
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
            const idProveedorCreado = proveedorCreado.data.idProveedor;
            if (!idProveedorCreado) {
                throw new Error("No se recibió idProveedor del backend");
            }

            const crearOk = await crearNuevasAsociaciones(newProveedor.articulos, idProveedorCreado);
            if (!crearOk) throw new Error("Error creando asociaciones");

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

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();


    const textoBusqueda = normalizarTexto(searchText);

    const filteredData = data.datos.filter(prov => {
        const nombreNormalizado = normalizarTexto(prov.nombre || "");
        const idProveedorStr = prov.idProveedor?.toString() || "";

        return (
            nombreNormalizado.includes(textoBusqueda) ||
            idProveedorStr.includes(searchText)
        );
    });


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
            case "delHist":
                return (
                    <TablaEliminadosGenerica
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        title="Proveedores Eliminados"
                        axiosUrl="proveedores/"
                        secondThText="Proveedor"
                        firstTdKey="idProveedor"
                        secondTdKey="nombre"
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
    return (
        <>
            <Stack className="proveedores-container">
                <div className="p-2"><h3>Proveedores</h3></div>
                <Row className="p-2 barraBusquedaDiv">
                    <Col sm={8}>
                        <Form.Control
                            type="text"
                            name="barraBusqueda"
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
            <Button className="delArtButton" onClick={() => handleClick(null, "delHist")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
                <span>Provs. Eliminados</span>
            </Button>
            {confirmModal}
        </>
    )
}

export default Proveedores