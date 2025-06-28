
export const calcularInventario = ({
  demandaArticulo,
  costoPedido,
  costoAlmacenamiento,
  demoraEntrega
}: {
  demandaArticulo: number | null;
  costoPedido: number | null;
  costoAlmacenamiento: number | null;
  demoraEntrega: number | null;
}) => {
  if (
    demandaArticulo == null ||
    costoPedido == null ||
    costoAlmacenamiento == null ||
    demoraEntrega == null
  ) {
    throw new Error("Parámetros inválidos para el cálculo de inventario");
  }

  const demandaAnual = demandaArticulo * 365;
  const EOQ = Math.round(Math.sqrt((2 * demandaAnual * costoPedido) / (costoAlmacenamiento * demoraEntrega)));
  const stockSeguridad = Math.round((demandaArticulo * demoraEntrega) * 0.2);
  const puntoPedido = Math.round((demandaArticulo * demoraEntrega) + stockSeguridad);

  return { 
    loteOptimo: EOQ,
    stockSeguridad, 
    puntoPedido
  };
};

