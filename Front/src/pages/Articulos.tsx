import { Table, Col, Form, Row, Stack, Button, Accordion, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ArtVta from "./Modales/artVta";
import ArtProv from "./Modales/artProv";
import ArtEdit from "./Modales/artEdit";
import ArtDel from "./Modales/artDel";


import './styles/Articulos.css';
import '../App.css';


type ArticulosData = {
    datos: any[];
    totalPages: number;
};

const PAGE_SIZE = 8;

const Articulos = () => {
    const [data, setData] = useState<ArticulosData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [modalType, setModalType] = useState<"new" | "venta" | "provNew" | "provEdit" | "edit" | "hdemanda" | "baja" | null>(null);

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);
    const [filterOption, setFilterOption] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    const handleToggle = (nextShow: boolean) => {
        if (filterOption !== '') {
            setFilterOption('');
            setShowDropdown(false);
        } else {
            setShowDropdown(nextShow);
        }
    };




    const handleClick = (agent: any, op: any) => {
        setSelectedAgent(agent);
        setModalType(op);
        setShowModal(true);
        switch (op) {
            case "venta":
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

    const handleVtaAgent = (updatedAgent: any) => {
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
            {showModal && modalType === "venta" && (
                <ArtVta
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onVta={handleVtaAgent}
                />

            )}
            {showModal && (modalType === "edit" || modalType === "new") && (
                <ArtEdit
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onSave={handleSaveAgent}
                    mode={modalType}
                />

            )}
            {showModal && (modalType === "provEdit" || modalType === "provNew") && (
                <ArtProv
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onSave={handleSaveAgent}
                    mode={modalType}
                />

            )}
            {/* 
            ESTE DEBERIA SER EL DEL HISTORIAL DE DMD
            {showModal && modalType === "baja"  && (
                <ArtDel
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onDel={handleDelAgent}
                />

            )} */}
            {showModal && modalType === "baja" && (
                <ArtDel
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    agent={selectedAgent}
                    onDel={handleDelAgent}
                />

            )}


            <Stack className="articulos-container">
                <div className="p-2"><h3>Artículos</h3></div>
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
                        <Dropdown show={showDropdown} onToggle={handleToggle}>
                            <Dropdown.Toggle size="lg" variant="outline-light" id="filtrarpor" className="filtrarpor">
                                {filterOption === '' && (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="bi bi-funnel-fill" viewBox="0 0 16 16">
                                            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
                                        </svg>
                                    </>
                                )}

                                {' '}
                                {filterOption !== '' && (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle mx-2" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                        </svg>
                                    </>
                                )}

                                {filterOption === '' && 'Filtrar por'}
                                {filterOption === 'stock' && 'Stock de Seguridad'}
                                {filterOption === 'pedido' && 'Punto de Pedido'}
                            </Dropdown.Toggle>


                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => {
                                    setFilterOption('stock');
                                    setShowDropdown(false);
                                }}>
                                    Stock de Seguridad
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => {
                                    setFilterOption('pedido');
                                    setShowDropdown(false);
                                }}>
                                    Punto de Pedido
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Col>
                </Row>
                <div className="p-2 divmedio">



                    <div style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {sinDatos ? (
                            <div style={{ fontSize: '18px', color: '#666' }}>No hay datos para mostrar</div>
                        ) : (
                            <Table className="tableArticulos">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th colSpan={2}>Descripción (Click para más detalles)</th>
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
                                                <OverlayTrigger key={agent.uuid + 'btn1'} overlay={<Tooltip id={`top`}> Venta </Tooltip>} >
                                                    <Button variant="success" onClick={() => handleClick(agent, "venta")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                        fill="currentColor" className="bi bi-cart-plus" viewBox="0 0 16 16" >
                                                        <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z" />
                                                        <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger key={agent.uuid + 'btn2'} overlay={<Tooltip id={`top`}> Proveedor por defecto </Tooltip>} >
                                                    <Button variant="primary" onClick={() => handleClick(agent, "provEdit")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-truck" viewBox="0 0 16 16">
                                                        <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger key={agent.uuid + 'btn3'} overlay={<Tooltip id={`top`}> Editar Artículo </Tooltip>} >
                                                    <Button variant="warning" onClick={() => handleClick(agent, "edit")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                        fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                                                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger key={agent.uuid + 'btn4'} overlay={<Tooltip id={`top`}> Histórico de Demanda </Tooltip>} >
                                                    <Button variant="info" onClick={() => handleClick(agent, "hdemanda")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                        fill="currentColor" className="bi bi-clock-history" viewBox="0 0 16 16" >
                                                        <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                                                        <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                                                        <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
                                                    </svg>
                                                    </Button>
                                                </OverlayTrigger>
                                                <OverlayTrigger key={agent.uuid + 'btn5'} overlay={<Tooltip id={`top`}> Eliminar </Tooltip>} >
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
            <Button className="newArtButton" onClick={() => {
                setSelectedAgent(null);
                setModalType("new");
                setShowModal(true);
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
                <span>Nuevo Artículo</span>
            </Button>
        </>
    )
}

export default Articulos