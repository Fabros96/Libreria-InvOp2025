import axiosClient from "../api/axiosClient";
import { showToasty } from "./toasty";

type OrdenParams = { idObj: number; tipo: "art" | "prov" };

export const tieneOrdenesActivas = async (
    params: OrdenParams,
): Promise<boolean> => {
    const { idObj, tipo } = params;

    const filtroId = tipo === "art" ? "idArticulo" : "idProveedor";


    try {
        const [respPendiente, respEnviada] = await Promise.all([
            axiosClient.get(
                `orden-compras/?filter[${filtroId}][eq]=${idObj}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Pendiente`
            ),
            axiosClient.get(
                `orden-compras/?filter[${filtroId}][eq]=${idObj}&filter[include]=estadoOrdenCompra&filter[estadoOrdenCompra.nombre][eq]=Enviado`
            ),
        ]);

        const pendientes: any[] = respPendiente.data || [];
        const enviadas: any[] = respEnviada.data || [];

        if (pendientes.length > 0 || enviadas.length > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error al verificar órdenes activas:", error);
        showToasty('Error al verificar órdenes activas', 'error');
        return true; // Bloquea eliminación en caso de error
    }
};
