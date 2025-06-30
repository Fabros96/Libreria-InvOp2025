import axiosClient from "../api/axiosClient";
import { tieneOrdenesActivas } from "./tieneOrdenesActivas";
import { showToasty } from "./toasty";

export async function generarOCAutomatica(art: any, inv: any) {
  // Verificar si ya hay órdenes activas para este artículo
  const ords = await tieneOrdenesActivas({ idObj: art.idArticulo, tipo: "art" });

  // Si el modelo de inventario es LF, el stock es mayor o igual al punto de pedido,
  // y no hay órdenes pendientes/enviadas, crear una orden de compra.

// OPCION 2
//  if (art.modeloInventario === 'LF' && (art.stock <= inv.puntoPedido) && (!ords)) {

// OPCION 1
    if (art.modeloInventario === 'LF' && (art.stock >= inv.puntoPedido) && (!ords)) {
    const idA = art.idArticulo;
    const stk = art.inventario.stockSeguridad;

    try {
      // Buscar proveedor predeterminado para el artículo
      const proveedor = await axiosClient.get(
        `articulo-proveedores/?&filter[idArticulo][eq]=${idA}&filter[orderBy][desc]=esPredeterminado`
      );

      const idP = proveedor.data[0]?.idProveedor;

      // Validación de datos
      if (!idA || !idP || stk <= 0) {
        showToasty("Todos los campos son obligatorios y la cantidad debe ser mayor que cero.", "error");
        return;
      }

      // Crear el objeto de orden de compra
      const nuevaOrden = {
        idArticulo: idA,
        idProveedor: idP,
        idEstadoOrdenCompra: 3, // Estado "pendiente"
        cantidad: stk,
        fechaCreacion: new Date().toISOString(),
      };

      // Enviar orden al servidor
      await axiosClient.post("/orden-compras", nuevaOrden);
      showToasty("Se creo una Orden de compra automatica en estado pendiente.", "success");
    } catch (err: any) {
      showToasty("Error al crear orden: " + (err.response?.data?.msg || err.message), "error");
    }
  }
}
