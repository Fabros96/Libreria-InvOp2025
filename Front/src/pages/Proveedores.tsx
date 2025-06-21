import { Table, Col, Form, Row, Stack, Button, Accordion, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ProvAsoc from "./Modales/provAsoc";
import ProvEdit from "./Modales/provEdit";
import ProvDel from "./Modales/provDel";


import './styles/Proveedores.css';
import '../App.css';
import DetalleProvArtModal from "./Modales/detalleProvArt";


type ProveedoresData = {
    datos: any[];
    totalPages: number;
};

const PAGE_SIZE = 8;

const Proveedores = () => {
    const [data, setData] = useState<ProveedoresData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"new" | "asoc" | "edit" | "baja" | null>(null);

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);
    const [filterOption, setFilterOption] = useState('');


    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    const [showProvAsoc, setShowProvAsoc] = useState(false);

    const [showDetalle, setShowDetalle] = useState(false);
    const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState<any[]>([]);

    const handleSeleccionMultiple = (seleccionados: any[]) => {
        setProveedoresSeleccionados(seleccionados);
        setShowDetalle(true);
    };





    const handleClick = (agent: any, op: any) => {
        setSelectedAgent(agent);
        setModalType(op);
        setShowModal(true);
        switch (op) {
            case "asoc":
                setShowModal(true);
                break;
            case "provNew":
                setShowModal(true);
                break;
            case "provEdit":
                setShowModal(true);
                break;
            case "edit":
                setShowModal(true);
                break;
            case "hdemanda":
                setShowModal(true);
                break;
            case "baja":
                setShowModal(true);
                break;
            default:
                console.log(`Error`);
        };
    }

    const handleSaveAgent = (updatedAgent: any) => {
        setData(prevData => {
            const nuevosDatos = prevData.datos.map(agent =>
                agent.uuid === updatedAgent.uuid ? updatedAgent : agent
            );
            return {
                ...prevData,
                datos: nuevosDatos
            };
        });

        setShowModal(false);
    };

    const handleDelAgent = (updatedAgent: any) => {
        setData(prevData => {
            const nuevosDatos = prevData.datos.map(agent =>
                agent.uuid === updatedAgent.uuid ? updatedAgent : agent
            );
            return {
                ...prevData,
                datos: nuevosDatos
            };
        });
        setShowModal(false);
    };




    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosClient.get("agents");
                const allData = response.data || [];

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

        fetchData();
    }, []);


    const filteredData = data.datos
        .filter(agent =>
            agent.displayName.toLowerCase().includes(searchText.toLowerCase())
        )
        .filter(agent => {
            if (filterOption === 'stock') {
                return agent.displayName === "Gekko"; // ajustá estas propiedades si son otras
                // return agent.stock < agent.stockSeguridad; // ajustá estas propiedades si son otras
            } else if (filterOption === 'pedido') {
                return agent.stock <= agent.puntoPedido; // lo mismo acá
            }
            return true; // sin filtro
        });

    useEffect(() => {
        // Cada vez que cambie el filtro o búsqueda, actualizamos total de páginas
        const total = Math.ceil(filteredData.length / PAGE_SIZE);
        setFilteredTotalPages(total);

        // Si la página actual es mayor que total páginas recalculadas, volver a la página 1
        if (page > total && total > 0) {
            setPage(1);
        }
    }, [filteredData, page]);


    const currentData = filteredData.slice(startIndex, endIndex);



    const handleChangePage = useCallback((page: number) => {
        setPage(page)
    }, [])
    return (
        <>

            {showDetalle && (
                <DetalleProvArtModal
                    show={showDetalle}
                    onHide={() => {
                        setShowDetalle(false);
                        setProveedoresSeleccionados([]);
                    }}
                    proveedores={proveedoresSeleccionados}
                    limpiarProveedores={() => {
                        setProveedoresSeleccionados([]);
                    }}
                />
            )}

            {showModal && modalType === "asoc" && (
                <ProvAsoc
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onSelectMultiple={handleSeleccionMultiple}
                />

            )}
            {showModal && (modalType === "edit" || modalType === "new") && (
                <ProvEdit
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onSave={handleSaveAgent}
                    mode={modalType}
                />

            )}
            {showModal && modalType === "baja" && (
                <ProvDel
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onDel={handleDelAgent}
                />

            )}


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
                            setSelectedAgent(null);
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
                                        <th colSpan={2}>Nombre (Click para ver detalles)</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.datos && data.datos.length > 0 && currentData.map((agent: {
                                        uuid: string;
                                        abilities: any;
                                        displayIcon: string | undefined; displayName: string;
                                    }, index: number) => (
                                        <tr key={index}>
                                            <td style={{ width: '22%' }} >
                                                <p>{agent.uuid}</p>
                                            </td>
                                            <td style={{ width: '5%' }} >
                                                <img
                                                    src={agent.displayIcon}
                                                    alt={agent.displayName}
                                                    style={{ width: '40px', height: 'auto', objectFit: 'contain' }}
                                                />
                                            </td>
                                            <td style={{ width: '50%' }} >
                                                <Accordion defaultActiveKey="1" >

                                                    <Accordion.Item eventKey="0">
                                                        <Accordion.Header>{agent.displayName}</Accordion.Header>
                                                        <Accordion.Body>
                                                            <div style={{ paddingLeft: "1rem", fontSize: "0.85rem" }}>
                                                                {agent.abilities && agent.abilities.map((ability: any, i: number) => (
                                                                    <div key={i}>
                                                                        {ability.displayName + " - "}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Accordion.Body>
                                                    </Accordion.Item>
                                                </Accordion>
                                            </td>
                                            <td className="botoneraTabla" >
                                                <OverlayTrigger key={agent.uuid + 'btn1'} overlay={<Tooltip id={`top`}> Asociar Artículo/s </Tooltip>} >
                                                    <Button variant="success" onClick={() => handleClick(agent, "asoc")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                        fill="currentColor" className="bi bi-diagram-3" viewBox="0 0 16 16">
                                                        <path d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger key={agent.uuid + 'btn2'} overlay={<Tooltip id={`top`}> Editar Proveedor </Tooltip>} >
                                                    <Button variant="warning" onClick={() => handleClick(agent, "edit")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                        fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                                                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger key={agent.uuid + 'btn3'} overlay={<Tooltip id={`top`}> Eliminar </Tooltip>} >
                                                    <Button variant="danger" onClick={() => handleClick(agent, "baja")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
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
        </>
    )
}

export default Proveedores