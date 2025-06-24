export function recalcularModeloLoteFijo({
  demandaAnual,
  costoPedido,
  costoAlmacenamiento,
  demoraEntregaDias // opcional, para calcular punto de pedido
}: {
  demandaAnual: number;
  costoPedido: number;
  costoAlmacenamiento: number;
  demoraEntregaDias?: number;
}) {
  // Validación básica
  if (!demandaAnual || !costoPedido || !costoAlmacenamiento) {
    return {};
  }

  // Fórmula EOQ
  const loteOptimo = Math.round(
    Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento)
  );

  // Demanda diaria (asumimos año de 365 días)
  const demandaDiaria = demandaAnual / 365;

  // Stock de seguridad fijo (por ejemplo, 10% de la demanda diaria)
  const stockSeguridad = Math.round(demandaDiaria * 5); // configurable

  // Punto de Pedido = d * L + SS
  const puntoPedido = demoraEntregaDias
    ? Math.round(demandaDiaria * demoraEntregaDias + stockSeguridad)
    : undefined;

  return {
    loteOptimo,
    puntoPedido,
    stockSeguridad
  };
}
