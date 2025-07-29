import { Table, Col, Form, Row, Stack, Button, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import dayjs from "dayjs";
import "dayjs/locale/es";
import customParseFormat from "dayjs/plugin/customParseFormat";


import { useRef } from "react";
import { CSSTransition } from "react-transition-group";
import MyDatePicker from "../utils/DatePicker";



import "../utils/calendarAnimation.css";
import 'bootstrap-icons/font/bootstrap-icons.css';


import './styles/Proveedores.css';
import '../App.css';
import { showToasty } from "../utils/toasty";
import VtaNew from "./Modales/vtaNew";
import VtaDetalle from "./Modales/VtaDetalles";
import { useConfirmModal } from "../utils/useConfirmModal";
import TablaEliminadosGenerica from "../utils/TablaEliminadosGenerica";

dayjs.locale("es");
dayjs.extend(customParseFormat);


interface Articulo {
    descripcion: string;
    fechaBaja: Date | null;
    idArticulo: number;
    idInventario: number;
    modeloInventario: string; // 'LF' o 'PF'
    stock: number;
}

interface Venta {
    idVenta: number;
    idArticulo: number;
    fechaCreacion: Date;
    cantidad: number;
    total: number;
    articulo: Articulo;
}


type VentasData = {
    datos: Venta[];
    totalPages: number;
};

const PAGE_SIZE = 8;

const Ventas = () => {
    const [data, setData] = useState<VentasData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
    const [modalType, setModalType] = useState<"new" | "view" | "edit" | "baja" | "hist" | null>(null);

    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);
    const datePickerRef = useRef(null);
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [inputFecha, setInputFecha] = useState('');


    const [searchDescripcion, setSearchDescripcion] = useState('');
    const [searchIdArticulo, setSearchIdArticulo] = useState('');
    const [searchIdVenta, setSearchIdVenta] = useState('');

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);

    const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
    const [showVtaNew, setShowVtaNew] = useState(false);
    const [showOtroModal, setShowOtroModal] = useState(false);
    const [showEliminadosModal, setShowEliminadosModal] = useState(false);

    const { requestConfirmation, modal: confirmModal } = useConfirmModal();

    const handleArticuloSeleccionado = (articulo: any) => {
        setArticuloSeleccionado(articulo); // guardás el artículo
        setShowOtroModal(true);            // abrís el otro modal
    };

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;



    const handleClick = async (ap: Venta | null, op: typeof modalType) => {
        setSelectedVenta(ap);
        setModalType(op);
        if (op === "edit" || op === "view" || op === "new") {
            setShowOtroModal(true); // este es el modal de VtaDetalle
        } else if (op === "baja") {
            try {
                const confirm = await requestConfirmation(
                    <>
                        <h4>¿Seguro que desea eliminar la venta <strong>#{ap?.idVenta}</strong>?</h4>
                        <h5><i>(Esta acción no se puede deshacer. ⚠️)</i></h5>
                    </>
                );
                if (!confirm) return;

                await axiosClient.delete(`ventas/${ap?.idVenta}`);

                showToasty("Venta eliminada exitosamente", "success");
                setShowModal(true);
            } catch (error) {
                showToasty("Error al eliminar la venta", "error");
            }
            await fetchData();
        };

    }

    //agrego para que se de alta un nuevo venta
    const handleCreateVenta = async (nuevaVenta: any) => {
        try {

            const response: any = await axiosClient.post("/ventas", nuevaVenta);
            if (response.advertencia) {
                const confirmar = window.confirm(response.msg);
                if (!confirmar) {
                    showToasty("Venta cancelada por el usuario.", "info");
                    return;
                }
            }
            await axiosClient.post("/ventas", {
                ...nuevaVenta,
                forzarVenta: true,
            });

        } catch (error) {
            showToasty("Error al crear el venta", "error");
        }
        showToasty("Venta realizada exitosamente", "success");
        await fetchData();
        setShowModal(false);
        setShowOtroModal(false);
        setShowVtaNew(false);
    };

    const aplicarFiltro = (
        valor: string,
        setFechaSeleccionada: React.Dispatch<React.SetStateAction<Date | null>>,
        setInputFecha: React.Dispatch<React.SetStateAction<string>>,
        setMostrarCalendario: React.Dispatch<React.SetStateAction<boolean>>,
        setPage: React.Dispatch<React.SetStateAction<number>>
    ) => {
        // Limpiar caracteres no numéricos
        let limpio = valor.replace(/\D/g, '');

        if (limpio.length > 2) limpio = limpio.slice(0, 2) + "/" + limpio.slice(2);
        if (limpio.length > 5) limpio = limpio.slice(0, 5) + "/" + limpio.slice(5);

        setInputFecha(limpio);

        if (limpio.length === 10) {
            const fecha = dayjs(limpio, "DD/MM/YYYY", true);
            if (fecha.isValid()) {
                setFechaSeleccionada(fecha.toDate());
                setMostrarCalendario(false);
                setPage(1);
            } else {
                setFechaSeleccionada(null);
                showToasty("Fecha inválida. Intenta de nuevo.", "error");
            }
        } else {
            setFechaSeleccionada(null);
        }
    };



    const fetchData = async () => {
        try {
            const response = await axiosClient.get("ventas/?filter[fechaBaja][eq]=null&filter[include]=articulo&filter[orderBy][desc]=idVenta");


            // Ajustá según la estructura real:
            const allData: Venta[] = Array.isArray(response.data) ? response.data : response.data?.data || [];

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
            console.error("Error en fetchData:", error);
            setSinDatos(true);
        }
    };




    useEffect(() => {

        fetchData();
    }, []);

    useEffect(() => {
        if (fechaSeleccionada) {
            setInputFecha(dayjs(fechaSeleccionada).format("DD/MM/YYYY"));
        } else {
            setInputFecha('');
        }
    }, [fechaSeleccionada]);

    const normalizarTexto = (texto: string) =>
        texto.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const textoDescripcion = normalizarTexto(searchDescripcion);

    const filteredData = data.datos.filter(ap => {
        const descripcionNormalizada = normalizarTexto(ap.articulo.descripcion || "");
        const cumpleDescripcion = descripcionNormalizada.includes(textoDescripcion);
        const cumpleIdVenta = ap.idVenta.toString().includes(searchIdVenta);
        const cumpleIdArticulo = ap.idArticulo.toString().includes(searchIdArticulo);
        const cumpleFecha = fechaSeleccionada
            ? dayjs(ap.fechaCreacion).startOf('day').isSame(dayjs(fechaSeleccionada).startOf('day'))
            || dayjs(ap.fechaCreacion).startOf('day').isAfter(dayjs(fechaSeleccionada).startOf('day'))
            : true;

        return cumpleDescripcion && cumpleIdVenta && cumpleIdArticulo && cumpleFecha;
    });




    useEffect(() => {
        const total = Math.ceil(filteredData.length / PAGE_SIZE);
        setFilteredTotalPages(total);
        if (page > total && total > 0) {
            setPage(1);
        }
    }, [filteredData, page]);



    const currentData: Venta[] = filteredData.slice(startIndex, endIndex);

    const handleChangePage = useCallback((page: number) => {
        setPage(page)
    }, [])


    return (
        <>
            <Stack className="proveedores-container">
                <div className="p-2"><h3>Ventas</h3></div>
                <Row className="p-2 barraBusquedaDiv">

                    <Col sm={1}>
                        <Form.Control
                            type="text"
                            name="srchIDVenta"
                            placeholder="ID Venta"
                            value={searchIdVenta}
                            onChange={(e) => setSearchIdVenta(e.target.value)}
                        />
                    </Col>
                    <Col sm={1}>
                        <Form.Control
                            type="text"
                            name="srchIDArticulo"
                            placeholder="ID Artículo"
                            className="mr-sm-2"
                            value={searchIdArticulo}
                            onChange={(e) => setSearchIdArticulo(e.target.value)}
                        />
                    </Col>
                    <Col sm={6}>
                        <Form.Control
                            type="text"
                            name="srchDescripcion"
                            placeholder="Descripción"
                            className="mr-sm-2"
                            value={searchDescripcion}
                            onChange={(e) => setSearchDescripcion(e.target.value)}

                        />
                    </Col>
                    <Col sm={2}>
                        <Stack direction="horizontal" gap={2}>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="srchFDesde"
                                    value={inputFecha}
                                    placeholder="Fecha Desde"
                                    onFocus={() => setMostrarCalendario(true)}
                                    maxLength={10}

                                    onChange={(e) =>
                                        aplicarFiltro(
                                            e.target.value,
                                            setFechaSeleccionada,
                                            setInputFecha,
                                            setMostrarCalendario,
                                            setPage
                                        )
                                    }
                                    onBlur={() => {
                                        if (fechaSeleccionada) {
                                            setInputFecha(dayjs(fechaSeleccionada).format("DD/MM/YYYY"));
                                        } else {
                                            setInputFecha('');
                                        }
                                    }}



                                />


                                <CSSTransition
                                    in={mostrarCalendario}
                                    timeout={300}
                                    classNames="fade"
                                    unmountOnExit
                                    nodeRef={datePickerRef}
                                >
                                    <div
                                        ref={datePickerRef}
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            zIndex: 9999,
                                            backgroundColor: "white",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                            borderRadius: "0.5rem",
                                            padding: "0.5rem",
                                        }}
                                    >
                                        <MyDatePicker
                                            selectedDate={fechaSeleccionada || new Date()}
                                            minDate={new Date(1900, 0, 1)}
                                            maxDate={new Date(3000, 11, 31)}
                                            onChange={(fecha: Date | false) => {
                                                if (fecha && typeof fecha !== "boolean") {
                                                    setFechaSeleccionada(fecha);
                                                } else {
                                                    setFechaSeleccionada(null);
                                                }
                                                setMostrarCalendario(false);
                                                setPage(1);  // Reiniciamos página al filtrar por fecha
                                            }}
                                        />
                                    </div>
                                </CSSTransition>
                            </div>

                            <Button
                                variant="outline-primary"
                                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                            >
                                {mostrarCalendario ? <i className="bi bi-x" /> : <i className="bi bi-calendar-check" />}
                            </Button>
                        </Stack>

                    </Col>

                    <Col sm={2}>
                        <Button className="newProvButton1" onClick={() => {
                            setShowVtaNew(!showVtaNew);
                            setSelectedVenta(null);
                            setModalType("new");
                            setShowModal(true);
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                            <span> Nueva Venta</span>
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
                                        <th>IdVenta</th>
                                        <th >IdArticulo</th>
                                        <th >Descripción</th>
                                        <th >Fecha</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...new Map(currentData.map(item => [item.idVenta, item])).values()].map(
                                        (vta: Venta) => (
                                            <tr key={vta.idVenta}>
                                                <td style={{ width: '5%' }} >
                                                    <p>{vta.idVenta}</p>
                                                </td>
                                                <td style={{ width: '5%' }} >
                                                    <p>{vta.idArticulo}</p>
                                                </td>
                                                <td style={{ width: '40%' }} >
                                                    <Form.Control
                                                        type="text"
                                                        name="tblDescripcion"
                                                        className="mr-sm-2"
                                                        value={vta.articulo.descripcion}
                                                        readOnly
                                                    />

                                                </td>
                                                <td style={{ width: '10%' }} >
                                                    <Form.Control
                                                        type="text"
                                                        name="tblFecha"
                                                        className="mr-sm-2"
                                                        value={vta.fechaCreacion
                                                            ? dayjs(vta.fechaCreacion).format("DD/MM/YYYY")
                                                            : "Sin fecha"}

                                                        readOnly
                                                    />

                                                </td>
                                                <td style={{ width: '10%' }}  >
                                                    <div className="botoneraTabla">

                                                        <OverlayTrigger key={vta.idArticulo + 'btn2'} overlay={<Tooltip id={`top`}> Ver Detalles </Tooltip>} >
                                                            <Button variant="primary" onClick={() => handleClick(vta, "view")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                                fill="currentColor" className="bi bi-receipt" viewBox="0 0 16 16">
                                                                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27m.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0z" />
                                                                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5" />
                                                            </svg>
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger key={vta.idArticulo + 'btn3'} overlay={<Tooltip id={`top`}> Editar Venta </Tooltip>} >
                                                            <Button variant="warning" onClick={() => { handleClick(vta, "edit"); }} > <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                                fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                                            </svg>
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger key={vta.idArticulo + 'btn1'} overlay={<Tooltip id={`top`}> Historial </Tooltip>} >
                                                            <Button variant="light" onClick={() => handleClick(vta, "hist")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                                fill="currentColor" className="bi bi-clock-history" viewBox="0 0 16 16">
                                                                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                                                                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                                                                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
                                                            </svg>
                                                            </Button>
                                                        </OverlayTrigger>
                                                        <OverlayTrigger key={vta.idArticulo + 'btn5'} overlay={<Tooltip id={`top`}> Eliminar Venta</Tooltip>} >
                                                            <Button variant="danger" onClick={() => handleClick(vta, "baja")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                                fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                            </svg>
                                                            </Button>
                                                        </OverlayTrigger>
                                                    </div>
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
            </Stack >
            <VtaDetalle
                show={showOtroModal}
                onHide={() => setShowOtroModal(false)}
                venta={(modalType === "view" || modalType === "edit") ? selectedVenta : articuloSeleccionado}
                modo={modalType}
                onSave={handleCreateVenta} // pasamos la función para manejar la venta creada

            />
            <VtaNew
                show={showVtaNew}
                onHide={() => setShowVtaNew(false)}
                onSelect={handleArticuloSeleccionado}
                onSave={handleCreateVenta}
            />


            <Button className="delArtButton" onClick={() => setShowEliminadosModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
                <span>Ventas Eliminadas</span>
            </Button>
            <TablaEliminadosGenerica
                show={showEliminadosModal}
                onHide={() => setShowEliminadosModal(false)}
                title="Ventas Eliminadas"
                axiosUrl="ventas/"
                secondThText="Venta"
                firstTdKey="idVenta"
                secondTdKey={null}
            />
            {confirmModal}
        </>
    );
}

export default Ventas;