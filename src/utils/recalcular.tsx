// File: src/utils/recalcular.ts

export type Inventario = {
    demandaAnual: number;          // en unidades
    costoPedido: number;           // en $ por pedido
    costoAlmacenamiento: number;   // en $ por unidad por año
    demoraEntrega?: number;        // en días (opcional)

    modeloInventario: "LF" | "PF"; // Lote Fijo o Periodo Fijo
    periodoRevision?: number;      // solo para modelo PF
    diasExtraSS?: number;          // opcional para ajustar stock seguridad

    // Resultados
    loteOptimo: number;
    puntoPedido: number;
    stockSeguridad: number;
    invMaximo: number;
    CGI?: number;
};

export function calculoModLF(input: any, res: "LO" | "SS" | "PP") {
    if (input.modeloInventario !== "LF") {
        throw new Error("Este cálculo solo es válido para el modelo de inventario Lote Fijo (LF).");
    }

    const {
        demandaAnual = 0,
        costoPedido = 0,
        costoAlmacenamiento = 0,
        demoraEntrega = 0,
        diasExtraSS = 2,
    } = input;

    const demandaDiaria = demandaAnual / 365;

    const loteOptimo = Math.round(Math.sqrt((2 * demandaAnual * costoPedido) / costoAlmacenamiento));
    const stockSeguridad = Math.round(demandaDiaria * diasExtraSS);
    const puntoPedido = Math.round(stockSeguridad + demandaDiaria * demoraEntrega);

    switch (res) {
        case "LO": return loteOptimo;
        case "SS": return stockSeguridad;
        case "PP": return puntoPedido;
        default: throw new Error("Opción no soportada");
    }
}

export function calculoModPF(input: any, res: "SS" | "IM") {

    const {
        demandaAnual = 0,
        demoraEntrega = 2,
        periodoRevision = 7,
        diasExtraSS = 2,
    } = input;


    const demandaDiaria = demandaAnual / 365;
    const stockSeguridad = Math.round(demandaDiaria * diasExtraSS);
    const invMaximo = Math.round((periodoRevision + demoraEntrega) * demandaDiaria + stockSeguridad);

    switch (res) {
        case "SS": return stockSeguridad;
        case "IM": return invMaximo;
        default: throw new Error("Opción no soportada");
    }
}

export function calculoCGI(input: Inventario, lote: number) {
    const {
        demandaAnual = 0,
        costoPedido = 0,
        costoAlmacenamiento = 0,
        stockSeguridad = 0,
        modeloInventario = 0,
        invMaximo = 0,
        loteOptimo = 0,
        puntoPedido = 0
    } = input;

    if (lote <= 0) {
        //throw new Error("El lote óptimo debe ser mayor que 0");
        lote = 1;
    }

    // Número de pedidos al año
    const nPedidos = demandaAnual / lote;

    // Stock promedio = Q/2 + SS
    const stockPromedio = lote / 2 + stockSeguridad;

    // Costo total de pedidos
    const costoPedidos = nPedidos * costoPedido;

    // Costo total de almacenamiento
    const costoAlmacenamientoTotal = stockPromedio * costoAlmacenamiento;

    // Cálculo final y redondeo
    return Math.round(costoPedidos + costoAlmacenamientoTotal);
}




export function calcularDatosInventario({
    demanda,
    costoPedido,
    costoAlmacenamiento,
    modeloInventario,
    demoraEntrega,
    periodoRevision = 7,
}: {
    demanda: number;
    costoPedido: number;
    costoAlmacenamiento: number;
    modeloInventario: string;
    demoraEntrega?: number;
    periodoRevision?: number;
}) {
    if (modeloInventario === "LF") {
        return {
            demandaArticulo: demanda,
            costoAlmacenamiento,
            costoPedido,
            loteOptimo: calculoModLF({
                demandaAnual: demanda,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                modeloInventario: "LF",
            }, "LO"),
            puntoPedido: calculoModLF({
                demandaAnual: demanda,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                modeloInventario: "LF",
            }, "PP"),
            stockSeguridad: calculoModLF({
                demandaAnual: demanda,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                modeloInventario: "LF",
            }, "SS"),
            invMaximo: 0,
        };
    } else {
        return {
            demandaArticulo: demanda,
            costoAlmacenamiento,
            costoPedido,
            loteOptimo: 0,
            puntoPedido: 0,
            stockSeguridad: calculoModPF({
                demandaAnual: demanda,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                periodoRevision,
                modeloInventario: "PF",
            }, "SS"),
            invMaximo: calculoModPF({
                demandaAnual: demanda,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                periodoRevision,
                modeloInventario: "PF",
            }, "IM"),
        };
    }
}
