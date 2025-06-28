/**
 * Modelo de Lote Fijo (EOQ) con punto de pedido y stock de seguridad
 */
export function calcularModeloLoteFijo({
  demandaAnual,
  costoPedido,
  costoAlmacenamiento,
<<<<<<< HEAD
  diasPorAnio = 365,
  demoraEntregaDias, // opcional: se requiere para calcular punto de pedido
  porcentajeSeguridad = 0.1 // opcional: 10% de la demanda diaria
=======
  demoraEntregaDias 
>>>>>>> 1285832 (fix OC)
}: {
  demandaAnual: number;
  costoPedido: number;
  costoAlmacenamiento: number;
  diasPorAnio?: number;
  demoraEntregaDias?: number;
  porcentajeSeguridad?: number;
}) {
  // Validaciones mínimas
  if (!demandaAnual || !costoPedido || !costoAlmacenamiento) {
    throw new Error("Faltan datos requeridos para el modelo EOQ.");
  }

  // Fórmula EOQ: Q* = sqrt(2DS / H)
  const loteOptimo = Math.round(
    Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento)
  );

  // Demanda diaria
  const demandaDiaria = demandaAnual / diasPorAnio;

  // Stock de seguridad (porcentaje configurable)
  const stockSeguridad = Math.round(demandaDiaria * porcentajeSeguridad * demoraEntregaDias!);

  // Punto de pedido: PP = d * L + SS
  const puntoPedido = demoraEntregaDias
    ? Math.round(demandaDiaria * demoraEntregaDias + stockSeguridad)
    : undefined;

  return {
    loteOptimo,
    demandaDiaria,
    stockSeguridad,
    puntoPedido
  };
}
