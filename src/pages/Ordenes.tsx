import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient";
import type { OrdenCompra, Articulo, Proveedor } from "../types/ordenCompra";
import { Modal, Button, Form, Table, Container } from "react-bootstrap";
import { showToasty } from "../utils/toasty";
import "react-toastify/dist/ReactToastify.css";
import TablaEliminadosGenerica from "../utils/TablaEliminadosGenerica";
import { useConfirmModal } from "../utils/useConfirmModal";


export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [idArticulo, setIdArticulo] = useState<number | null>(null);
  const [idProveedor, setIdProveedor] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompra | null>(null);
  const [modo, setModo] = useState<"crear" | "modificar" | "estado">("crear");
  const [showModal, setShowModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [loteOptimoSugerido, setLoteOptimoSugerido] = useState<number | null>(null);
  const [showCronModal, setShowCronModal] = useState(false)
  const [cronMensajes, setCronMensajes] = useState<string[]>([]);
  const [showEliminadosModal, setShowEliminadosModal] = useState(false);
  const { requestConfirmation, modal: confirmModal } = useConfirmModal();



  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  const esFinalizada = ordenSeleccionada?.idEstadoOrdenCompra === 4;
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrdenes = async () => {
    const res = await axiosClient.get("/orden-compras?filter[include]=articulo,proveedor,estadoOrdenCompra");
    setOrdenes(res.data);
    setPaginaActual(1);
  };

  useEffect(() => {
    fetchOrdenes();
    const fetchDatos = async () => {
      const resArt = await axiosClient.get("articulos/?filter[fechaBaja][eq]=null");
      setArticulos(resArt.data);
      const resProv = await axiosClient.get("proveedores/?filter[fechaBaja][eq]=null");
      setProveedores(resProv.data);
    };
    fetchDatos();
  }, []);

  useEffect(() => {
    const buscarProveedorPredeterminado = async (idArt: number) => {
      try {
        const res: any = await axiosClient.get(`/articulo-proveedores/predeterminado/${idArt}`);
        const proveedor = res.data?.proveedor;
        if (proveedor?.idProveedor)
          //console.log(proveedor?.idProveedor)
        setIdProveedor(proveedor.idProveedor);

        const resLote: any = await axiosClient.get(`/inventarios/lote-optimo/${idArt}`);
        setLoteOptimoSugerido(resLote.loteOptimo ?? null);
        //setCantidad(resLote.loteOptimo ?? null);
      } catch (error) {
        console.error("Error al buscar proveedor predeterminado:", error);
      }
    };

    if (idArticulo !== null && proveedores.length > 0) {
      buscarProveedorPredeterminado(idArticulo);
    } else {
      setLoteOptimoSugerido(null);
    }
  }, [idArticulo, proveedores]);

  const crearOrden = async () => {
    try {
      if (!idArticulo || !idProveedor || cantidad <= 0) {
        showToasty("Todos los campos son obligatorios.", "error");
        return;
      }
      const nuevaOrden = {
        idArticulo,
        idProveedor,
        idEstadoOrdenCompra: 1,
        cantidad,
        fechaCreacion: new Date().toISOString(),
      };
      await axiosClient.post("/orden-compras", nuevaOrden);
      showToasty("Orden creada exitosamente.", "success");
      setShowModal(false);
      await fetchOrdenes();
    } catch (err: any) {
      showToasty("Error al crear: " + (err.response?.data?.msg || err.message), "error");
    }
  };

  const modificarOrden = async () => {
    if (!ordenSeleccionada) return;
    try {
      const actualizada = {
        idArticulo: idArticulo!,
        idProveedor: idProveedor!,
        idEstadoOrdenCompra: ordenSeleccionada.idEstadoOrdenCompra,
        cantidad,
        fechaCreacion: ordenSeleccionada.fechaCreacion,
      };
      const res = await axiosClient.put(`/orden-compras/${ordenSeleccionada.idOrdenCompra}`, actualizada);
      const mensajeBase = res.data.msg || "Orden modificada exitosamente.";
      if (res.data.advertencia) {
        showToasty("Advertencia: " + mensajeBase, "warning");
      } else {
        showToasty(mensajeBase, "success");
      }
      setShowModal(false);
      await fetchOrdenes();
    } catch (err: any) {
      showToasty("Error al modificar: " + (err.response?.data?.msg || err.message), "error");
    }
  };

  const cambiarEstadoOrden = async (nuevoEstado: number) => {
    if (!ordenSeleccionada) return;

    try {
      // 🚨 Recordá: axiosClient ya devuelve directamente el response.data
      const res: any = await axiosClient.put(`/orden-compras/${ordenSeleccionada.idOrdenCompra}`, {
        idEstadoOrdenCompra: nuevoEstado,
      });

      // 🔍 Si hay advertencia (pero no error), consultamos al usuario
      if (res.advertencia) {
        const confirmar = window.confirm(`${res.msg}\n¿Desea continuar de todos modos?`);
        if (!confirmar) {
          showToasty("El estado de la orden no fue modificado.", "info");
          return;
        }

        // Si confirmó continuar, reenviamos la misma solicitud con "forzar"
        const confirmacion: any = await axiosClient.put(`/orden-compras/${ordenSeleccionada.idOrdenCompra}`, {
          idEstadoOrdenCompra: nuevoEstado,
          confirmarEnvioForzado: true, //flag para confirmar el envio de que quiere continuar con la cantidad < al punto pedido
        });

        showToasty(confirmacion.msg || "Estado actualizado correctamente.", "success");
      } else {
        //No hubo advertencia, todo ok
        showToasty(res.msg || "Estado actualizado correctamente.", "success");
      }

      setShowEstadoModal(false);
      await fetchOrdenes();

    } catch (err: any) {
      showToasty("Error al cambiar estado: " + (err.response?.data?.msg || err.message), "error");
    }
  };


  const eliminarOrden = async (id: number) => {
    const confirm = await requestConfirmation(
      <>
        <h4>¿Seguro que desea eliminar la Orden <strong> #{id}</strong>?<br /></h4>
        <h5><i>(Esta acción no se puede deshacer. ⚠️)</i></h5>
      </>
    );
    if (!confirm) return false;

    try {
      await axiosClient.delete(`/orden-compras/${id}`);
      showToasty("Orden eliminada correctamente.", "success");
      await fetchOrdenes();
    } catch (err: any) {
      showToasty("Error al eliminar: " + (err.response?.data?.msg || err.message), "error");
    }
  };

  const iniciarControlAutomatico = async () => {
    try {
      await axiosClient.post("/cron/iniciar");
      setShowCronModal(true); // mostrar el modal

      const fetchMensajes = async () => {
        try {
          const res: any = await axiosClient.get("/cron/mensajes");
          //console.log("mensajes recibidos: ", res.mensajes)
          if (res.mensajes) {
            setCronMensajes(res.mensajes);

            //Si alguno de los mensajes indica que se creó una orden, actualizamos
            const hayOrdenNueva = res.mensajes.some((msg: string) =>
              msg.toLowerCase().includes("orden") && msg.toLowerCase().includes("generada")
            );
            //console.log("hayOrdenNueva: ", hayOrdenNueva)
            if (hayOrdenNueva) {
              await fetchOrdenes(); // actualiza la tabla
            }
          }

        } catch (err) {
          console.error("Error al obtener mensajes del cron:", err);
        }
      };

      await fetchMensajes(); // primera consulta

      // iniciar polling
      intervalIdRef.current = setInterval(fetchMensajes, 5000);
    } catch (err) {
      console.error("Error al iniciar control automático", err);
      showToasty("Error al iniciar el control automático", "error");
    }
  };

  const detenerControlAutomatico = async () => {
    try {
      await axiosClient.post("/cron/detener");
      showToasty("Detenido correctamente.", "success");

      // detener polling si está activo
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }

      setShowCronModal(false); // cerrar modal
    } catch (error: any) {
      console.error("Error al detener cron", error);
      showToasty("Error al detener el control automático.", "error");
    }
  };

  useEffect(() => {
    return () => {
      // limpieza por si el modal se cierra manualmente
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, []);


  const ordenesActivas = ordenes.filter((orden) => !orden.fechaBaja);
  const totalPaginas = Math.ceil(ordenesActivas.length / porPagina);
  const ordenesPaginadas = ordenesActivas.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Órdenes de Compra</h2>

      <div className="d-flex justify-content-between mb-3">
        <Button
          variant="dark"
          onClick={iniciarControlAutomatico}
        >
          Iniciar Control Automático Periodo Fijo
        </Button>



        <Button
          variant="primary"
          onClick={() => {
            setModo("crear");
            setOrdenSeleccionada(null);
            setIdArticulo(null);
            setIdProveedor(null);
            setCantidad(1);
            setLoteOptimoSugerido(null);
            setShowModal(true);
          }}
        >
          Nueva Orden
        </Button>
      </div>


      <Table striped bordered hover responsive className="text-center">
        <thead className="table-light">
          <tr>
            <th>Artículo</th>
            <th>Proveedor</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenesPaginadas.map((orden) => (
            <tr key={orden.idOrdenCompra}>
              <td>{orden.articulo?.descripcion}</td>
              <td>{orden.proveedor?.nombre}</td>
              <td>{orden.cantidad}</td>
              <td>{new Date(orden.fechaCreacion).toLocaleDateString()}</td>
              <td>{orden.estadoOrdenCompra?.nombre}</td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  disabled={orden.idEstadoOrdenCompra === 2 || orden.idEstadoOrdenCompra === 4}
                  onClick={() => {
                    setModo("modificar");
                    setOrdenSeleccionada(orden);
                    setIdArticulo(orden.idArticulo);
                    setIdProveedor(orden.idProveedor);
                    setCantidad(orden.cantidad);
                    setShowModal(true);
                  }}
                >
                  Modificar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="me-2"
                  disabled={orden.idEstadoOrdenCompra === 2 || orden.idEstadoOrdenCompra === 4}
                  onClick={() => {
                    setModo("estado");
                    setOrdenSeleccionada(orden);
                    setShowEstadoModal(true);
                  }}
                >
                  Cambiar Estado
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => eliminarOrden(orden.idOrdenCompra)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >
          Anterior
        </Button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <Button
          variant="outline-secondary"
          size="sm"
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >
          Siguiente
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modo === "crear" ? "Crear Orden" : "Modificar Orden"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Artículo</Form.Label>
            <Form.Select
              value={idArticulo ?? ""}
              onChange={(e) => setIdArticulo(Number(e.target.value))}
              disabled={esFinalizada}
            >
              <option value="">Seleccionar...</option>
              {articulos.map((a) => (
                <option key={a.idArticulo} value={a.idArticulo}>{a.descripcion}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Proveedor</Form.Label>
            <Form.Select
              value={idProveedor ?? ""}
              onChange={(e) => setIdProveedor(Number(e.target.value))}
              disabled={esFinalizada}
            >
              <option value="">Seleccionar...</option>
              {proveedores.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>{p.nombre}</option>

              ))
              }
            </Form.Select>
          </Form.Group>

          {loteOptimoSugerido !== null && (
            <Form.Text className="text-muted">
              Lote óptimo sugerido: <strong>{loteOptimoSugerido}</strong>
            </Form.Text>
          )}

          <Form.Group className="mt-3">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              disabled={esFinalizada}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between w-100">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={modo === "crear" ? crearOrden : modificarOrden}>
            {modo === "crear" ? "Crear" : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Orden #{ordenSeleccionada?.idOrdenCompra} — Artículo:{" "}
            <strong>{ordenSeleccionada?.articulo?.descripcion}</strong>
          </p>
          <div className="d-grid gap-2">
            <Button variant="outline-success" onClick={() => cambiarEstadoOrden(1)}>Pendiente</Button>
            <Button variant="outline-dark" onClick={() => cambiarEstadoOrden(2)}>Cancelada</Button>
            <Button variant="outline-primary" onClick={() => cambiarEstadoOrden(3)}>Enviada</Button>
            <Button variant="outline-danger" onClick={() => cambiarEstadoOrden(4)}>Finalizada</Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showCronModal}
        onHide={() => setShowCronModal(false)}
        backdrop="static" //evita que se cierre clic afera
        keyboard={false} //evita que se cierre con la tecla esc
      >
        <Modal.Header>
          <Modal.Title>Resultado del Control Automático</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="mb-0">
            {cronMensajes.map((msg, idx) => (
              <li key={idx}>🔔 {msg}</li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={detenerControlAutomatico}>
            Detener control automático
          </Button>
        </Modal.Footer>
      </Modal>
      <Button className="delArtButton" onClick={() => setShowEliminadosModal(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
        </svg>
        <span>OCs. Eliminadas</span>
      </Button>
      <TablaEliminadosGenerica
        show={showEliminadosModal}
        onHide={() => setShowEliminadosModal(false)}
        title="Ordenes de Compra Eliminadas"
        axiosUrl="orden-compras/"
        secondThText="Orden de Compra"
        firstTdKey="idOrdenCompra"
        secondTdKey={null}
      />
      {confirmModal}
    </Container >

  );

}

