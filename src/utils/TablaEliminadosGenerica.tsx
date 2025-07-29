import { Modal, ModalFooter, Table } from "react-bootstrap";
import "../App.css";
import axiosClient from "../api/axiosClient";
import { useEffect, useState } from "react";

interface TablaEliminadosGenericaProps {
  show: boolean;
  onHide: () => void;
  title: string;
  axiosUrl: string;
  secondThText: string;
  firstTdKey: string | null;  // puede ser null para ocultar
  secondTdKey: string | null; // puede ser null para ocultar
}

const TablaEliminadosGenerica = ({
  show,
  onHide,
  title,
  axiosUrl,
  secondThText,
  firstTdKey,
  secondTdKey,
}: TablaEliminadosGenericaProps) => {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    if (!show) return;

    const fetchData = async () => {
      try {
        const response = await axiosClient.get(axiosUrl);
        const conFechaBaja = response.data.filter((item: any) => !!item.fechaBaja);
        if (Array.isArray(conFechaBaja) && conFechaBaja.length > 0) {
          const ordenados = conFechaBaja.sort(
            (a, b) => new Date(b.fechaBaja).getTime() - new Date(a.fechaBaja).getTime()
          );
          setDatos(ordenados);
        } else {
          setDatos([]);
        }
      } catch (error) {
        console.error("❌ Error al traer datos:", error);
        setDatos([]);
      }
    };

    fetchData();
  }, [show, axiosUrl]);

  const formatDate = (fecha: string | null | undefined) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div style={{ maxHeight: "60vh", overflowY: "auto", width: "100%" }}>
          <Table
            className="tableArticulos"
            striped
            bordered
            hover
            size="sm"
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                {firstTdKey !== null && <th>#</th>}
                {secondTdKey !== null && <th>{secondThText}</th>}
                <th>Fecha Eliminación</th>
                <th>Eliminado por</th>
              </tr>
            </thead>

            <tbody>
              {datos.map((item: any, index: number) => (
                <tr key={item.id || index} style={{ backgroundColor: "#ff4949c7" }}>
                  {firstTdKey !== null && <td>{item[firstTdKey] ?? "-"}</td>}
                  {secondTdKey !== null && <td>{item[secondTdKey] ?? "-"}</td>}
                  <td>{formatDate(item.fechaBaja)}</td>
                  <td>Usuario</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <ModalFooter />
    </Modal>
  );
};

export default TablaEliminadosGenerica;
