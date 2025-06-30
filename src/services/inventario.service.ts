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

  const demandaDiaria = demandaArticulo / 365;
  if (modeloInventario === 'LF') {
    console.log("Recalcularé con lote fijo");

    const EOQ = Math.round(Math.sqrt((2 * demandaArticulo * costoPedido) / costoAlmacenamiento));

    const stockSeguridad = Math.round((demandaDiaria * demoraEntrega) * 0.2);

    const puntoPedido = Math.round((demandaDiaria * demoraEntrega) + stockSeguridad);

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
    const stockSeguridad = Math.round((demandaDiaria * demoraEntrega) * 0.2);
    const inventarioMaximo = demandaDiaria * (10 + demoraEntrega) + stockSeguridad; // 10: periodo revisión fijo de prueba

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

