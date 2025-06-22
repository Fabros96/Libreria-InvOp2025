import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const VentaService = {
    /**
     * Verifica si se debe generar una orden de compra automática
     * cuando se realiza una venta. Aplica solo para modelo LF,
     * si el stock actual es mayor o igual al punto de pedido (PP)
     * y no existen órdenes pendientes o enviadas.
     */
    verificarYCargarOrdenCompraAutomatica: async (idArticulo: number) => {
        const articulo = await prisma.articulo.findUnique({
            where: { idArticulo },
            include: {
                inventario: true
            }
        });

}
}
