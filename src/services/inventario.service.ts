export const calcularInventario = ({
  demandaArticulo, //esto se utiliza como demanda diaria del artículo
  costoPedido,
  costoAlmacenamiento,
  demoraEntrega,
  modeloInventario,
  nivelServicio,
  desviacionEstandar,
  periodoRevision,
  precioUnitario,
  
}: {
  demandaArticulo: number | null;
  costoPedido: number | null;
  costoAlmacenamiento: number | null;
  demoraEntrega: number | null;
  modeloInventario?: string;
  nivelServicio?: number;
  desviacionEstandar?: number;
  periodoRevision?: number;
  precioUnitario?: number;

}) => {
  if (
    demandaArticulo == null ||
    costoPedido == null ||
    costoAlmacenamiento == null ||
    demoraEntrega == null ||
    nivelServicio == null ||
    desviacionEstandar == null ||
    precioUnitario == null ||
    (modeloInventario === 'PF' && periodoRevision == null) // solo se valida si se usa
  ) {
    throw new Error("Parámetros inválidos para el cálculo de inventario");
  }

  //console.log("el modelo inventario que llega a services es:", modeloInventario);


  if (modeloInventario === 'LF') {
    //console.log("Recalcularé con lote fijo");

    const demandaAnual = demandaArticulo * 360; //360 por que común en planificación, control de stock, y contabilidad usar "año comercial" = 12 meses de 30 días

    const EOQ = Math.round(Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento));

    const stockSeguridad = Math.round(nivelServicio * desviacionEstandar * Math.sqrt(demoraEntrega))

    const puntoPedido = Math.round((demandaArticulo * demoraEntrega) + stockSeguridad);

    const cgi = Math.round(( demandaArticulo * precioUnitario ) + (demandaArticulo / EOQ) * costoPedido+ (EOQ/2 * costoAlmacenamiento))

    return {
      loteOptimo: EOQ,
      stockSeguridad,
      puntoPedido,
      inventarioMaximo: null, // importante para consistencia
      cgi,
    };
  }

  if (modeloInventario === 'PF') {

    //console.log("Recalcularé con Periodo Fijo");

    const stockSeguridad = Math.round(nivelServicio * desviacionEstandar * Math.sqrt(periodoRevision!+demoraEntrega))
    const inventarioMaximo = Math.round(demandaArticulo * (periodoRevision! + demoraEntrega) + stockSeguridad)

    return {
      loteOptimo: null,
      stockSeguridad,
      puntoPedido: null,
      inventarioMaximo,
    };
  }

  throw new Error("Modelo de inventario no reconocido. Debe ser 'LF' o 'PF'");
};

