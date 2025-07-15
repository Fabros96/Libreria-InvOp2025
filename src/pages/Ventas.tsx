import { Table, Col, Form, Row, Stack, Button, Accordion, Dropdown, OverlayTrigger, Tooltip, Modal } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState, type SetStateAction } from "react";
import MyPagination from "../components/Pagination/myPagination";
import dayjs from "dayjs";
import "dayjs/locale/es";


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
    articulo: Articulo;
}


type VentasData = {
    datos: Venta[];
    totalPages: number;
};

const PAGE_SIZE = 10;

const Ventas = () => {
    const [data, setData] = useState<VentasData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
    const [modalType, setModalType] = useState<"new" | "view" | "edit" | "baja" | null>(null);

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

    const handleArticuloSeleccionado = (articulo: any) => {
        setArticuloSeleccionado(articulo); // guardás el artículo
        setShowOtroModal(true);            // abrís el otro modal
    };

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;



    const handleClick = (ap: Venta | null, op: typeof modalType) => {
        setSelectedVenta(ap);
        setModalType(op);
        setShowModal(true);
    }

    const handleUpdateVenta = async (updatedVenta: Venta) => {
        if (!selectedVenta) return;

        const originalVenta = selectedVenta;

        const cambios: Partial<Record<keyof Venta, Venta[keyof Venta]>> = {};

        for (const key in updatedVenta) {
            if (
                Object.prototype.hasOwnProperty.call(updatedVenta, key) &&
                key !== "inventario" &&
                key !== "ventaProveedor"
            ) {
                if (updatedVenta[key as keyof Venta] !== originalVenta[key as keyof Venta]) {
                    cambios[key as keyof Venta] = updatedVenta[key as keyof Venta];
                }
            }
        }

        // Si no hay cambios en propiedades simples, salir
        if (Object.keys(cambios).length === 0) {
            setShowModal(false);
            return;
        }


        try {
            const response = await fetch(`http://localhost:3000/ventas/${updatedVenta.idVenta}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(cambios),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar venta");
            }

            const result = await response.json();

            setData(artData => {
                const nuevosDatos = artData.datos.map(art =>
                    art.idVenta === result.data.idVenta
                        ? result.data
                        : art
                );

                return {
                    ...artData,
                    datos: nuevosDatos
                };
            });
            showToasty("Venta actualizado exitosamente", "success");
            await fetchData(); // refresca toda la tabla desde el servidor
            setShowModal(false);
        } catch (error) {
            console.error("Error al actualizar venta:", error);
        }
    };

    //agrego para que se de alta un nuevo venta
    const handleCreateVenta = async (nuevoVenta: Venta) => {
        try {

            // VER ESTO A LA HORA DE CREAR UN ARTICULO NUEVO TIRA ERROR SERA POR Inventario? 
            console.log("handleCreateVenta")
            const response = await axiosClient.post("/ventas", nuevoVenta);

            const ventaCreado = response.data;

            setData(prevData => ({
                ...prevData,
                datos: [...prevData.datos, ventaCreado],
            }));

            showToasty("Venta creado exitosamente", "success")
            setShowModal(false);
        } catch (error) {
            showToasty("Error al crear el venta", "error");
        }
    };



    const fetchData = async () => {
        try {
            const response = await axiosClient.get("ventas/?filter[include]=articulo");


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

    const filteredData = data.datos.filter(ap => {
        const cumpleDescripcion = ap.articulo.descripcion.toLowerCase().includes(searchDescripcion.toLowerCase());
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
                            placeholder="ID Venta"
                            value={searchIdVenta}
                            onChange={(e) => setSearchIdVenta(e.target.value)}
                        />
                    </Col>
                    <Col sm={1}>
                        <Form.Control
                            type="text"
                            placeholder="ID Artículo"
                            className="mr-sm-2"
                            value={searchIdArticulo}
                            onChange={(e) => setSearchIdArticulo(e.target.value)}
                        />
                    </Col>
                    <Col sm={6}>
                        <Form.Control
                            type="text"
                            placeholder="Descripción"
                            className="mr-sm-2"
                            value={searchDescripcion}
                            onChange={(e) => setSearchDescripcion(e.target.value)}

                        />
                    </Col>
                    <Col sm={2}>
                        <Stack direction="horizontal" gap={2}>
                            {/* <Form.Control
                                type="text"
                                placeholder="Fecha"
                                value={fechaSeleccionada ? fechaSeleccionada.toLocaleDateString("es-AR") : ""}
                                readOnly
                                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                                /> */}
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={inputFecha}
                                    placeholder="Fecha Desde"
                                    onFocus={() => setMostrarCalendario(true)}
                                    maxLength={10}
                                    onChange={(e) => {
                                        let valor = e.target.value;

                                        // Eliminar todo excepto números
                                        valor = valor.replace(/\D/g, "");

                                        // Insertar '/' en posición 2 y 4
                                        if (valor.length > 2) {
                                            valor = valor.slice(0, 2) + "/" + valor.slice(2);
                                        }
                                        if (valor.length > 5) {
                                            valor = valor.slice(0, 5) + "/" + valor.slice(5);
                                        }

                                        setInputFecha(valor);

                                        // Si la longitud es 10, intentar parsear y actualizar fechaSeleccionada
                                        if (valor.length === 10) {
                                            const fecha = dayjs(valor, "DD/MM/YYYY", true);
                                            if (fecha.isValid()) {
                                                setFechaSeleccionada(fecha.toDate());
                                                setMostrarCalendario(false); // Cerramos calendario al ingresar fecha completa
                                                setPage(1); // Reiniciar página si usas paginación
                                            } else {
                                                setFechaSeleccionada(null);
                                            }
                                        } else {
                                            setFechaSeleccionada(null);
                                        }
                                    }}
                                    onBlur={() => {
                                        // Si al perder foco hay fecha seleccionada, sincronizamos el input con el formato correcto
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
                                            minDate={new Date(2020, 0, 1)}
                                            maxDate={new Date(2030, 11, 31)}
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
                                                        placeholder="Buscar por descripción"
                                                        className="mr-sm-2"
                                                        value={vta.articulo.descripcion}
                                                        readOnly
                                                    />

                                                </td>
                                                <td style={{ width: '10%' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Buscar por descripción"
                                                        className="mr-sm-2"
                                                        value={vta.fechaCreacion
                                                            ? dayjs(vta.fechaCreacion).format("DD/MM/YYYY")
                                                            : "Sin fecha"}

                                                        readOnly
                                                    />

                                                </td>
                                                <td style={{ width: '10%' }} >

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
            <VtaDetalle
                show={showOtroModal}
                onHide={() => setShowOtroModal(false)}
                articulo={articuloSeleccionado}
            />
            <VtaNew
                show={showVtaNew}
                onHide={() => setShowVtaNew(false)}
                onSelect={handleArticuloSeleccionado}
            />



        </>
    );
}

export default Ventas;