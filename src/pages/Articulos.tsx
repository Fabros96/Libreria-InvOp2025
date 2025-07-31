import { Table, Col, Form, Row, Stack, Button, Accordion, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap"
import axiosClient from "../api/axiosClient";
import { useCallback, useEffect, useMemo, useState } from "react";
import MyPagination from "../components/Pagination/myPagination";
import ArtProv from "./Modales/artProv";
import ArtEdit from "./Modales/artEdit";

import './styles/Articulos.css';
import '../App.css';
import { showToasty } from "../utils/toasty";
import { crearAjusteInv } from "../utils/crearAjusteInv";
import ArtHist from "./Modales/artHist";
import { useConfirmModal } from "../utils/useConfirmModal";
import TablaEliminadosGenerica from "../utils/TablaEliminadosGenerica";

interface Articulo {
    descripcion: string;
    fechaBaja: Date | null;
    idArticulo: number;
    idInventario: number;
    modeloInventario: string; // 'LF'; // 'LF' o 'PF'
    stock: number;
    tieneOC?: any;
    tieneProv?: any;
    inventario?: Inventario | Partial<Inventario>;
    articuloProveedor?: ArticuloProveedor;
    articuloProveedorList?: ArticuloProveedor[];
}
interface Inventario {
    costoAlmacenamiento: number;
    costoPedido: number;
    demandaArticulo: number;
    idInventario: number;
    loteOptimo: number;
    puntoPedido: number;
    stockSeguridad: number;
    periodoRevision: number;
    inventarioMaximo?: number; // Solo para modelo PF
    cgi?: number;
}
interface ArticuloProveedor {
    idArticuloProveedor: number;
    demoraEntrega: number;
    fechaBaja: Date | null;
    esPredeterminado: boolean;
    idArticulo: number;
    idProveedor: number;
    precioUnitario: number;
    nivelServicio: number;
    desviacionEstandar: number;
    proveedor: any;
    articulo: any;

}

type ArticulosData = {
    datos: Articulo[];
    totalPages: number;
};

const PAGE_SIZE = 10;

const Articulos = () => {
    const [data, setData] = useState<ArticulosData>({ datos: [], totalPages: 0 });
    const [sinDatos, setSinDatos] = useState(false);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedArticulo, setSelectedArticulo] = useState<Articulo | null>(null);
    const [modalType, setModalType] = useState<"new" | "hist" | "view" | "edit" | "hdemanda" | "baja" | "delHist" | null>(null);

    const [filteredTotalPages, setFilteredTotalPages] = useState(0);
    const [filterOption, setFilterOption] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Aquí guardamos la data filtrada que incluye el tieneOC actualizado
    const [filteredDataWithOC, setFilteredDataWithOC] = useState<Articulo[]>([]);

    const { requestConfirmation, modal: confirmModal } = useConfirmModal();

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

    const verArtOC = async (articulo: Articulo): Promise<Articulo> => {
        try {
            const res = await axiosClient.get(`orden-compras/existeOc/${articulo.idArticulo}`);
            const tieneOC = res;
            return { ...articulo, tieneOC };
        } catch (error) {
            console.error(`Error al consultar OC de artículo ${articulo.idArticulo}`, error);
            return { ...articulo, tieneOC: false };
        }
    };
    const fetchData = async () => {
        try {
            const response = await axiosClient.get("articulos/?filter[fechaBaja][eq]=null&filter[include]=inventario,articuloProveedorList.proveedor");
            const allData: Articulo[] = response.data || [];



            // Extraer todos los idArticulo en un array
            const ids = allData.map(articulo => articulo.idArticulo);

            fetch('http://localhost:3000/articulos/recalcular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }) // paso directo el array
            })
                .then(res => res.json())
                .catch(err => console.error(err));


            if (allData.length > 0) {
                const datosConTieneOC = await Promise.all(allData.map(async (art) => {
                    try {
                        const tieneOCResponse = await axiosClient.get(`orden-compras/existeOc/${art.idArticulo}`);
                        const tieneOC = tieneOCResponse.data;
                        const tieneProv = art.articuloProveedorList?.some(p => p.esPredeterminado === true) ?? false;

                        return { ...art, tieneOC, tieneProv };
                    } catch (e) {
                        console.error(`Error al obtener tieneOC para artículo ${art.idArticulo}`, e);
                        return { ...art, tieneOC: false, tieneProv: false };
                    }
                }));

                setData({
                    datos: datosConTieneOC,
                    totalPages: Math.ceil(datosConTieneOC.length / PAGE_SIZE),
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

    // 1) Primero aplicamos filtro base (por búsqueda y stock)
    // 2) Luego hacemos un efecto que para los filtros 'faltante' o 'reponer' actualice filteredDataWithOC consultando el endpoint

    // Filtro base (sin actualizar tieneOC aún)
    const filteredDataBase = useMemo(() => {
        return data.datos
            .filter(ap => ap && (typeof ap.descripcion === 'string' || typeof ap.idArticulo !== 'undefined'))
            .filter(ap => {
                const descripcionNormalizada = normalizarTexto(ap.descripcion || "");
                const idArticuloNormalizado = normalizarTexto(ap.idArticulo?.toString() || "");

                if (
                    !descripcionNormalizada.includes(textoBusqueda) &&
                    !idArticuloNormalizado.includes(textoBusqueda)
                ) {
                    return false;
                }

                const inv = ap.inventario;
                if (!inv || inv.puntoPedido === undefined || inv.stockSeguridad === undefined) return false;

                const stock = ap.stock ?? 0;
                if (inv.puntoPedido >= stock) {

                    if (filterOption === 'faltante') {
                        return stock <= inv.stockSeguridad;
                    } else if (filterOption === 'reponer') {
                        return stock > inv.stockSeguridad;
                    }
                }

                return true;
            });
    }, [data.datos, textoBusqueda, filterOption]);



    // Efecto que hace consulta para actualizar tieneOC solo cuando el filtro es faltante o reponer
    useEffect(() => {
        const fetchTieneOCForFiltered = async () => {
            try {
                const updatedData = await Promise.all(filteredDataBase.map(verArtOC));
                setFilteredDataWithOC(updatedData);
            } catch (error) {
                console.error("Error en fetchTieneOCForFiltered", error);
                setFilteredDataWithOC(filteredDataBase); // fallback sin OC actualizado
            }
        };
        fetchTieneOCForFiltered();
    }, [filteredDataBase]);



    // Calcular paginación para datos filtrados con tieneOC actualizado
    useEffect(() => {
        const total = Math.ceil(filteredDataWithOC.length / PAGE_SIZE);
        setFilteredTotalPages(total);
        if (page > total && total > 0) {
            setPage(1);
        }
    }, [filteredDataWithOC, page]);

    // Método para controlar la clasificación del stock (sin cambios)
    const controlarStock = (ap: Articulo): string => {
        const inv = ap.inventario;
        if (!inv || inv.puntoPedido === undefined || inv.stockSeguridad === undefined) return "";
        const stock = ap.stock ?? 0;
        if (stock <= inv.stockSeguridad) {
            return "faltante" // Faltante: stock < stock de seguridad
        } else if (stock > inv.stockSeguridad && stock <= inv.puntoPedido) {
            return "reponer" // A reponer: stock está entre stockSeguridad y puntoPedido (exclusivo en SS, inclusivo en PP)
        }
        return "normal";  // sin filtro, mostrar todo
    }

    // Datos paginados para mostrar en tabla
    const currentData: Articulo[] = filteredDataWithOC.slice(startIndex, endIndex);

    const handleChangePage = useCallback((page: number) => {
        setPage(page)
    }, []);

    //------------------------------------------------------------------------------------------------------------------------------------------------//
    const handleDeleteArticuloValidation = async (ap: Articulo) => {

        const confirm = await requestConfirmation(
            <>
                <h4>¿Seguro que desea eliminar el artículo<br /><strong> #{ap.idArticulo} - {ap.descripcion}</strong>?<br /></h4>
                <h5><i>(Esta acción no se puede deshacer. ⚠️)</i></h5>
            </>
        );
        if (!confirm) return false;
        try {
            if (ap.stock > 0) {
                showToasty('No se puede eliminar, todavía tiene stock disponible', 'error');
                return;
            }
            const tieneOrdenesResp = await axiosClient.get(`orden-compras/existeOC/${ap.idArticulo}`);
            console.log("tieneOrdenesResp: "+tieneOrdenesResp)
            const tieneOrdenes = tieneOrdenesResp.data;
            console.log("tieneOrdenes: "+tieneOrdenes)
            if (tieneOrdenesResp) {
                showToasty('No se puede eliminar el artículo, tiene órdenes activas', 'error');
            } else {
                handleDelArticulo(ap);
                showToasty('Articulo eliminado exitosamente', 'success');
                return true;
            }
        } catch (error) {
            console.error("El Error es: ", error);
            showToasty('Error al verificar datos del artículo', 'error');
        }
    };

    const handleClick = async (ap: Articulo | null, op: typeof modalType) => {
        console.log(JSON.stringify(ap, null, 2));

        setSelectedArticulo(ap);
        setModalType(op);

        if (op === "baja" && ap) {
            const eliminado = await handleDeleteArticuloValidation(ap);
            if (eliminado) {
                setShowModal(false);
            }
            return;
        }
        setShowModal(true);
    };
    //MODIFICACIÓN DE UN ARTICULO
    const handleUpdateArticulo = async (artOriginal: Articulo, updatedArticulo: Articulo, provOriginal?: ArticuloProveedor, updateProveedor?: ArticuloProveedor) => {
        if (!selectedArticulo) return;
        const originalArticulo = selectedArticulo;

        const cambios: any = {};

        const camposInventarioIgnoradosXQSeCalculan = [
            "idInventario",
            "loteOptimo",
            "puntoPedido",
            "stockSeguridad",
            "inventarioMaximo",
            "invMaximo"
        ];
        if (updatedArticulo.modeloInventario === 'LF') {
            camposInventarioIgnoradosXQSeCalculan.push("periodoRevision");
        } else {
            const index = camposInventarioIgnoradosXQSeCalculan.indexOf("periodoRevision");
            if (index !== -1) camposInventarioIgnoradosXQSeCalculan.splice(index, 1);
        }

        for (const key in updatedArticulo) {
            if (Object.prototype.hasOwnProperty.call(updatedArticulo, key) && key !== "articuloProveedor") {
                if (key === "inventario") {
                    const updatedInv = updatedArticulo.inventario;
                    const originalInv = originalArticulo.inventario;
                    if (updatedInv) updatedInv.idInventario = updatedArticulo.idInventario;

                    if (updatedInv && originalInv && typeof updatedInv === "object" && typeof originalInv === "object") {
                        const cambiosInventario: any = {};

                        for (const invKey in updatedInv) {
                            if (
                                Object.prototype.hasOwnProperty.call(updatedInv, invKey) &&
                                !camposInventarioIgnoradosXQSeCalculan.includes(invKey)
                            ) {
                                const updatedValue = updatedInv[invKey as keyof typeof updatedInv];
                                const originalValue = originalInv[invKey as keyof typeof originalInv];

                                if (updatedValue !== originalValue) {
                                    cambiosInventario[invKey] = updatedValue;
                                }
                            }
                        }
                        if (Object.keys(cambiosInventario).length > 0 && updatedInv.idInventario) {
                            cambios.inventario = {
                                idInventario: updatedInv.idInventario,
                                ...cambiosInventario
                            };
                        }
                    }
                } else {
                    if (updatedArticulo[key as keyof Articulo] !== originalArticulo[key as keyof Articulo]) {
                        cambios[key] = updatedArticulo[key as keyof Articulo];
                    }
                }
            }
        }

        // Incluir articuloProveedor si hay cambios
        if (updateProveedor) {
            cambios.articuloProveedor = {
                idArticuloProveedor: updateProveedor.idArticuloProveedor,
                idProveedor: updateProveedor.idProveedor,
                idArticulo: updatedArticulo.idArticulo,
                precioUnitario: updateProveedor.precioUnitario,
                demoraEntrega: updateProveedor.demoraEntrega,
                fechaBaja: updateProveedor.fechaBaja,
                esPredeterminado: updateProveedor.esPredeterminado,
                nivelServicio: updateProveedor.nivelServicio,
                desviacionEstandar: updateProveedor.desviacionEstandar
            };
        }

        if (Object.keys(cambios).length === 0 && !updateProveedor) {
            // Si no hay cambios, salir
            setShowModal(false);
            showToasty("No se realizaron cambios", "warning");
            return;
        }

        try {

            const provAux = provOriginal?.proveedor;
            const artAux = provOriginal?.articulo;

            const responseUpdArt = await fetch(`http://localhost:3000/articulos/${updatedArticulo.idArticulo}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedArticulo),
            });
            if (!responseUpdArt.ok) {
                throw new Error("Error al actualizar artículo");
            } else {
                await axiosClient.post("/articulos/recalcular", { ids: [updatedArticulo.idArticulo] });
            }
            if (updateProveedor?.idProveedor === provOriginal?.idProveedor) {
                updateProveedor = undefined;
            } else if (provOriginal) {
                provOriginal.esPredeterminado = false;
                provOriginal.nivelServicio
                // delete provOriginal.articulo;
                // delete provOriginal.proveedor;            

                const responseProvOld = await fetch(
                    `http://localhost:3000/articulo-proveedores/${provOriginal?.idArticuloProveedor}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(provOriginal),
                    }
                );
                if (!responseProvOld.ok) {
                    // console.error("Error al actualizar proveedor original");
                    const errMsg = await responseProvOld.text();
                    console.error("Error al hacer PUT:", responseProvOld.status, responseProvOld.statusText, errMsg);
                    throw new Error(`Error al actualizar proveedor`);
                }
            }


            try {
                delete cambios.articuloProveedor;
                if (provOriginal) {
                    provOriginal.articulo = artAux;
                    provOriginal.proveedor = provAux;
                }

                if (updateProveedor?.idProveedor === provOriginal?.idProveedor) {
                    updateProveedor = undefined;
                    provOriginal = undefined;
                }

                if (Object.keys(cambios).length === 0) {
                    //Si hay cambios en el proveedor pero no en el articulo
                    await axiosClient.post("/articulos/recalcular", { ids: [updatedArticulo.idArticulo] });
                    crearAjusteInv(null, null, provOriginal, updateProveedor)
                } else {
                    //Si hay cambios en el proveedor y en el articulo
                    await axiosClient.post("/articulos/recalcular", { ids: [updatedArticulo.idArticulo] });
                    crearAjusteInv(artOriginal, cambios, provOriginal, updateProveedor)
                }
            } catch (error) {
                console.error("Error al crear el ajuste de inventario:", error);
            }

            const result = await responseUpdArt.json();

            setData(artData => {
                const nuevosDatos = artData.datos.map(art =>
                    art.idArticulo === result.data.idArticulo ? result.data : art
                );
                return { ...artData, datos: nuevosDatos };
            });
            setShowModal(false);
            showToasty("Artículo actualizado exitosamente", "success");
        } catch (error) {
            console.error("Error al actualizar artículo:", error);
        }

        await fetchData(); // refresca toda la tabla desde el servidor
    };



    const handleCreateArticulo = async (nuevoArticulo: Articulo, nuevoAP?: ArticuloProveedor) => {
        try {
            if (!nuevoArticulo.descripcion || !nuevoArticulo.inventario || !nuevoArticulo.articuloProveedor) {
                return;
            }

            // 1️⃣ Armar payload para crear artículo
            const articuloPayload = {
                descripcion: nuevoArticulo.descripcion,
                modeloInventario: nuevoArticulo.modeloInventario,
                stock: nuevoArticulo.stock,
                inventario: {
                    demandaArticulo: nuevoArticulo.inventario.demandaArticulo,
                    costoAlmacenamiento: nuevoArticulo.inventario.costoAlmacenamiento,
                    costoPedido: nuevoArticulo.inventario.costoPedido,
                    periodoRevision: nuevoArticulo.inventario.periodoRevision
                },
                articuloProveedor: {
                    idProveedor: nuevoArticulo.articuloProveedor.idProveedor,
                    precioUnitario: nuevoArticulo.articuloProveedor.precioUnitario,
                    demoraEntrega: nuevoArticulo.articuloProveedor.demoraEntrega,
                    fechaBaja: nuevoArticulo.articuloProveedor.fechaBaja,
                    esPredeterminado: nuevoArticulo.articuloProveedor.esPredeterminado,
                }
            };

            // 2️⃣ Crear artículo
            const response = await axiosClient.post("/articulos", articuloPayload);
            const articuloCreado = response.data;

            // 3️⃣ Crear proveedor (si corresponde)
            if (nuevoAP) {
                try {
                    await axiosClient.post("/articulo-proveedores", {
                        ...nuevoAP,
                        idArticulo: articuloCreado.idArticulo,
                    });
                } catch (error) {
                    console.error("⚠️ Error al crear ArticuloProveedor:", error);
                    showToasty("Artículo creado, pero falló la creación del proveedor", "warning");
                }
            }

            // 4️⃣ Crear ajuste inventario
            crearAjusteInv(null, articuloCreado, null, null);

            // 5️⃣ Recalcular inventario para este artículo
            await axiosClient.post("/articulos/recalcular", { ids: [articuloCreado.idArticulo] });

            // 6️⃣ Obtener artículo completo (ya con inventario calculado)
            const articuloCompleto = (await axiosClient.get(
                `/articulos/${articuloCreado.idArticulo}?filter[include]=inventario`
            )).data;

            // 7️⃣ Agregarlo a la tabla sin recargar todo
            setData(prev => ({
                ...prev,
                datos: [...prev.datos, { ...articuloCompleto, tieneOC: false }]
            }));

            // 8️⃣ Notificar y cerrar modal
            showToasty("Artículo creado exitosamente", "success");
            setShowModal(false);

        } catch (error) {
            console.error("Error al crear el artículo:", error);
            showToasty("Error al crear el artículo", "error");
        }
    };



    const handleDelArticulo = (articuloToDelete: Articulo) => {
        axiosClient.delete(`/articulos/${articuloToDelete.idArticulo}`)
            .then(() => {
                setData(prevData => {
                    const nuevosDatos = prevData.datos.filter(
                        articulo => articulo.idArticulo !== articuloToDelete.idArticulo
                    );
                    return {
                        ...prevData,
                        datos: nuevosDatos
                    };
                });
                crearAjusteInv(articuloToDelete, null, null, null)
                setShowModal(false);
            })
            .catch(error => {
                console.error("Error al eliminar el articulo:", error);
                alert("No se pudo eliminar el articulo. Intente nuevamente.");
            });
    };

    return (
        <>
            {showModal && (modalType === "edit") && (
                <ArtEdit
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    articulo={selectedArticulo}
                    onSave={handleUpdateArticulo}
                    mode={modalType}
                />
            )}
            {showModal && (modalType === "new") && (
                <ArtEdit
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    articulo={selectedArticulo}
                    onSave={handleCreateArticulo}
                    mode={modalType}
                />
            )}
            {(modalType === "view") && (
                <ArtProv
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    articulo={selectedArticulo}
                    onSave={() => { }}
                    mode={modalType}
                />
            )}
            {showModal && (modalType === "delHist") && (
                <TablaEliminadosGenerica
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    title="Artículos Eliminados"
                    axiosUrl="articulos"
                    secondThText="Artículo"
                    firstTdKey="idArticulo"
                    secondTdKey="descripcion"
                />
            )}
            {(modalType === "hist") && (
                <ArtHist
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    articulo={selectedArticulo}
                />
            )}

            <Stack className="articulos-container">
                <div className="p-2"><h3>Artículos</h3></div>
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
                        <Dropdown show={showDropdown} onToggle={handleToggle}>
                            <Dropdown.Toggle
                                size="lg"
                                variant={filterOption === '' ? "outline-light" : "warning"}
                                id="filtrarpor"
                                className="filtrarpor"
                            >

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
                                {filterOption === 'faltante' && 'Arts. Faltantes'}
                                {filterOption === 'reponer' && 'Arts. a Reponer'}
                            </Dropdown.Toggle>


                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => {
                                    setFilterOption('faltante');
                                    setShowDropdown(false);
                                }}>
                                    Prods. Faltantes
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => {
                                    setFilterOption('reponer');
                                    setShowDropdown(false);
                                }}>
                                    Prods. a Reponer
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
                            <Table className="tableArticulos" >
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th >Descripción (Click para más detalles)</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...new Map(
                                        currentData
                                            .filter(item =>
                                                (filterOption === 'faltante' || filterOption === 'reponer')
                                                    ? item.tieneOC !== true
                                                    : true
                                            )
                                            .map(item => [item.idArticulo, item])
                                    ).values()]
                                        .map((ap: Articulo) => (
                                            <tr key={ap.idArticulo} >
                                                <td style={{ width: '5%' }} >
                                                    <p>{ap.idArticulo}</p>
                                                </td>
                                                <td style={{ width: '70%' }} >
                                                    <Accordion defaultActiveKey="1"  >
                                                        <Accordion.Item eventKey="0" className={`item-stock-${controlarStock(ap)}`}>
                                                            <Accordion.Header>
                                                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>

                                                                    {/* Texto a la izquierda */}
                                                                    <span>{ap.descripcion}</span>

                                                                    {/* Contenedor de iconos a la derecha */}
                                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                                                                        {!ap.tieneOC && (
                                                                            <span
                                                                                style={{
                                                                                    backgroundColor: 'rgb(0 0 0 / 84%)',
                                                                                    borderRadius: '100px',
                                                                                    padding: '0px 1px 4px 0px'
                                                                                }}
                                                                                title="No tiene Orden de Compra activa"
                                                                            >
                                                                                ⚠️
                                                                            </span>
                                                                        )}

                                                                        {!ap.tieneProv && (
                                                                            <span
                                                                                style={{
                                                                                    backgroundColor: 'rgb(255 0 101)',
                                                                                    borderRadius: '100px',
                                                                                    padding: '0px 2px 2px 4px'
                                                                                }}
                                                                                title="No tiene un proveedor predeterminado seleccionado"
                                                                            >
                                                                                <svg
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                    width="16"
                                                                                    height="16"
                                                                                    fill="currentColor"
                                                                                    className="bi bi-truck"
                                                                                    viewBox="0 0 16 16"
                                                                                >
                                                                                    <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
                                                                                </svg>
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </Accordion.Header>

                                                            <Accordion.Body>
                                                                <div style={{ paddingLeft: "1rem", fontSize: "0.85rem" }}>
                                                                    <div>
                                                                        <strong> Modelo:</strong> {ap.modeloInventario === 'LF' ? 'Lote Fijo' : ap.modeloInventario === 'PF' ? 'Periodo Fijo' : 'SinModelo x.x'} --
                                                                        <strong> Stock:</strong> {ap.stock} --
                                                                        <strong> Demanda Diaria:</strong> {ap.inventario?.demandaArticulo}
                                                                        <strong> Costo de Almacenamiento:</strong> {ap.inventario?.costoAlmacenamiento} --
                                                                        <strong> Costo de Pedido:</strong> {ap.inventario?.costoPedido}
                                                                    </div>
                                                                    <div style={{ fontSize: "1.2rem" }}>

                                                                        {ap.modeloInventario === 'LF' ? (
                                                                            ap.inventario?.loteOptimo !== 0 &&
                                                                                ap.inventario?.stockSeguridad !== 0 &&
                                                                                ap.inventario?.puntoPedido !== 0 ? (
                                                                                <>
                                                                                    <strong> Lote Óptimo: </strong>{ap.inventario?.loteOptimo} --
                                                                                    <strong> Punto de Pedido: </strong>{ap.inventario?.puntoPedido} --
                                                                                    <strong> Stock de Seguridad: </strong>{ap.inventario?.stockSeguridad} --
                                                                                    <strong> CGI: </strong>{ap.inventario?.cgi}

                                                                                </>
                                                                            ) : (
                                                                                <i><span>Para ver Lote Óptimo, Punto de Pedido y Stock de Seguridad, seleccione un proveedor.</span></i>
                                                                            )
                                                                        ) : ap.modeloInventario === 'PF' ? (
                                                                            ap.inventario?.stockSeguridad !== 0 &&
                                                                                ap.inventario?.inventarioMaximo !== 0 ? (
                                                                                <>
                                                                                    <strong> Stock de Seguridad: </strong>{ap.inventario?.stockSeguridad} --
                                                                                    <strong> Inventario Máximo: </strong>{ap.inventario?.inventarioMaximo}
                                                                                </>
                                                                            ) : (
                                                                                <i><span>Para ver Stock de Seguridad e Inventario Máximo, Seleccione un proveedor.</span></i>
                                                                            )
                                                                        ) : (
                                                                            ''
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </Accordion.Body>

                                                        </Accordion.Item>
                                                    </Accordion>
                                                </td>
                                                <td className="botoneraTabla" >
                                                    <OverlayTrigger key={ap.idArticulo + 'btn2'} overlay={<Tooltip id={`top`}> Ver Proveedores </Tooltip>} >
                                                        <Button variant="primary" onClick={() => handleClick(ap, "view")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-truck" viewBox="0 0 16 16">
                                                            <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5zm1.294 7.456A2 2 0 0 1 4.732 11h5.536a2 2 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456M12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger key={ap.idArticulo + 'btn3'} overlay={<Tooltip id={`top`}> Editar Artículo </Tooltip>} >
                                                        <Button variant="warning" onClick={() => { handleClick(ap, "edit"); }} > <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger key={ap.idArticulo + 'btn1'} overlay={<Tooltip id={`top`}> Historial de Ajustes </Tooltip>} >
                                                        <Button variant="light" onClick={() => handleClick(ap, "hist")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-clock-history" viewBox="0 0 16 16">
                                                            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
                                                            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
                                                            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger key={ap.idArticulo + 'btn5'} overlay={<Tooltip id={`top`}> Eliminar </Tooltip>} >
                                                        <Button variant="danger" onClick={() => handleClick(ap, "baja")}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                            fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                                        </svg>
                                                        </Button>
                                                    </OverlayTrigger>
                                                </td>

                                            </tr>
                                        )
                                        )}
                                </tbody>
                            </Table>
                        )}
                    </div>
                </div >
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
            <Button className="newArtButton" onClick={() => handleClick(null, "new")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
                <span>Nuevo Artículo</span>
            </Button>
            <Button className="delArtButton" onClick={() => handleClick(null, "delHist")}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
                <span>Arts. Eliminados</span>
            </Button>
            {confirmModal}
        </>
    )
}

export default Articulos