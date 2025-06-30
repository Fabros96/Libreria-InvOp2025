export const calcularInventario = ({
  demandaArticulo,
  costoPedido,
  costoAlmacenamiento,
  demoraEntrega,
  modeloInventario,
}: {
  demandaArticulo: number | null;
  costoPedido: number | null;
  costoAlmacenamiento: number | null;
  demoraEntrega: number | null;
  modeloInventario?: string;
}) => {
  if (
    demandaArticulo == null ||
    costoPedido == null ||
    costoAlmacenamiento == null ||
    demoraEntrega == null
  ) {
    throw new Error("Parámetros inválidos para el cálculo de inventario");
  }

  console.log("el modelo inventario que llega a services es:", modeloInventario);

  if (modeloInventario === 'LF') {
    console.log("Recalcularé con lote fijo");
    const demandaAnual = demandaArticulo * 365;
    const EOQ = Math.round(Math.sqrt((2 * demandaAnual * costoPedido) / (costoAlmacenamiento * demoraEntrega)));
    const stockSeguridad = Math.round((demandaArticulo * demoraEntrega) * 0.2);
    const puntoPedido = Math.round((demandaArticulo * demoraEntrega) + stockSeguridad);
    return {
      loteOptimo: EOQ,
      stockSeguridad,
      puntoPedido,
      inventarioMaximo: null, // importante para consistencia
    };
  }

  if (modeloInventario === 'PF') {
    console.log("Recalcularé con punto fijo");
    console.log("demoraEntrega: ",demoraEntrega)
    const stockSeguridad = Math.round((demandaArticulo * demoraEntrega) * 0.2);
    const inventarioMaximo = Math.round((demandaArticulo * 10) + stockSeguridad); // 10: periodo revisión fijo de prueba

    return {
      loteOptimo: null,
      stockSeguridad,
      puntoPedido: null,
      inventarioMaximo,
    };
  }

  // ⚠️ Este fallback evita retornar undefined
  throw new Error("Modelo de inventario no reconocido. Debe ser 'LF' o 'PF'");
};

