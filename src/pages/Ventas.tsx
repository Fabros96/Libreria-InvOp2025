import { Table, Col, Form, Row, Stack, Button, Accordion, Dropdown, OverlayTrigger, Tooltip, Modal } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ArtVta from "./Modales/artVta";
import ArtProv from "./Modales/artProv";
import ArtEdit from "./Modales/artEdit";
import ArtDel from "./Modales/artDel";


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
    fecha: Date;
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
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
    const [modalType, setModalType] = useState<"new" | "view" | "edit" | "baja" | null>(null);

    const [searchDescripcion, setSearchDescripcion] = useState('');
    const [searchFecha, setSearchFecha] = useState('');
    const [searchIdArticulo, setSearchIdArticulo] = useState('');
    const [searchIdVenta, setSearchIdVenta] = useState('');


    const [filteredTotalPages, setFilteredTotalPages] = useState(0);
    const [filterOption, setFilterOption] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
    const [showVtaNew, setShowVtaNew] = useState(false);
    const [showOtroModal, setShowOtroModal] = useState(false);

    const handleArticuloSeleccionado = (articulo: any) => {
        setArticuloSeleccionado(articulo); // guardás el artículo
        setShowOtroModal(true);            // abrís el otro modal
    };

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




    const handleDelVenta = (ventaToDelete: Venta) => {
        axiosClient.delete(`/ventas/${ventaToDelete.idVenta}`)
            .then(() => {
                setData(prevData => {
                    const nuevosDatos = prevData.datos.filter(
                        venta => venta.idVenta !== ventaToDelete.idVenta
                    );
                    return {
                        ...prevData,
                        datos: nuevosDatos
                    };
                });

                setShowModal(false);
                showToasty("Venta Eliminado exitosamente", "success");
            })
            .catch(error => {
                console.error("Error al eliminar el venta:", error);
                alert("No se pudo eliminar el venta. Intente nuevamente.");
            });
    };

    //agrego para que se de alta un nuevo venta
    const handleCreateVenta = async (nuevoVenta: Venta) => {
        try {

            // VER ESTO A LA HORA DE CREAR UN ARTICULO NUEVO TIRA ERROR SERA POR Inventario? 
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
            const allData: Venta[] = response.data || [];

            if (allData.length > 0) {
                setData({
                    datos: allData.map((ap) => ap),
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


    const filteredData = data.datos.filter(ap =>
        ap.articulo.descripcion.toLowerCase().includes(searchDescripcion.toLowerCase()) &&
        ap.idVenta.toString().toLowerCase().includes(searchIdVenta.toLowerCase()) &&
        ap.idArticulo.toString().toLowerCase().includes(searchIdArticulo.toLowerCase())
    );


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

                    <Col sm={2}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por ID Venta"
                            value={searchIdVenta}
                            onChange={(e) => setSearchIdVenta(e.target.value)}
                        />
                    </Col>
                    <Col sm={2}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por ID Artículo"
                            className="mr-sm-2"
                            value={searchIdArticulo}
                            onChange={(e) => setSearchIdArticulo(e.target.value)}
                        />
                    </Col>
                    <Col sm={4}>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por descripción"
                            className="mr-sm-2"
                            value={searchDescripcion}
                            onChange={(e) => setSearchDescripcion(e.target.value)}

                        />
                    </Col>

                    <Col sm={1}></Col>
                    <Col sm={3}>
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
                                                <td style={{ width: '70%' }} >
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Buscar por descripción"
                                                        className="mr-sm-2"
                                                        value={vta.articulo.descripcion}
                                                        readOnly
                                                    />

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