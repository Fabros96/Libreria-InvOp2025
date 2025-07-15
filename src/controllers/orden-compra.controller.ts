import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { OrdenCompraRepository } from "../repositories/orden-compra.repository";

const prisma = new PrismaClient();
const ordenCompraRepository = new OrdenCompraRepository();

export const OrdenCompraController = {
    // Obtener todos los ordenCompras
    getAll: async (req: Request, res: Response) => {
        try {
            const ordenCompras = await ordenCompraRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${ordenCompras.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ordenCompras });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener networkeo registros', detail: error.message });
        }
    },

    // Obtener un ordenCompra por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ordenCompraRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo ordenCompra (create)
    create: async (req: Request, res: Response) => {
        console.log("entra a create")
        let { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion } = req.body;
        console.log(idArticulo)
        console.log("articulo")
        try {

            console.log("entra a try")
            // Verificar si ya existe una orden de compra activa para este artículo (pendiente-enviada)
            const ordenExistente = await prisma.ordenCompra.findFirst({
                where: {
                    idArticulo: Number(idArticulo),
                    idEstadoOrdenCompra: {
                        in: [1, 3]
                    }
                }
            });

            console.log(ordenExistente)

            if (ordenExistente) {
                return res.status(400).json({
                    msg: 'Ya existe una orden de compra activa para este artículo.'
                });
            }
            const nuevoOrdenCompra = await prisma.ordenCompra.create({
                data: {
                    idArticulo,
                    idProveedor,
                    idEstadoOrdenCompra: 1,
                    cantidad,
                    fechaCreacion: new Date()
                },
            });
            res.status(200).json({ msg: 'Se ha creado la Orden de Compra.', data: nuevoOrdenCompra });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la Orden de Compra.', detail: error.message });
            console.log(error)
        }
    },

    // Actualizar un ordenCompra (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion, confirmarEnvioForzado } = req.body;
        let payload: any = { idArticulo, idProveedor, cantidad, fechaCreacion };

        try {
            const ordenCompraActual = await prisma.ordenCompra.findUnique({
                where: { idOrdenCompra: parseInt(id) },
                select: {
                    idEstadoOrdenCompra: true,
                    cantidad: true,
                    idArticulo: true
                }
            });

            if (!ordenCompraActual) {
                return res.status(404).json({ msg: 'Orden de compra no encontrada.' });
            }

            if (ordenCompraActual.idEstadoOrdenCompra === 3 && idEstadoOrdenCompra === 1) {
                return res.status(400).json({ msg: 'No se puede volver una orden Enviada al estado Pendiente.' });
            }

            const articuloRelacionado = await prisma.articulo.findUnique({
                where: { idArticulo: ordenCompraActual.idArticulo },
                select: {
                    modeloInventario: true,
                    stock: true,
                    inventario: {
                        select: { puntoPedido: true }
                    }
                }
            });

            if (!articuloRelacionado) {
                return res.status(404).json({ msg: 'Artículo relacionado no encontrado.' });
            }

            // Verificar punto de pedido si corresponde
            const nuevoStock = (articuloRelacionado.stock ?? 0) + (ordenCompraActual.cantidad ?? 0);
            const puntoPedido = articuloRelacionado.inventario?.puntoPedido ?? 0;

            // REGLA 1: Cancelar solo si está en estado Pendiente
            if (idEstadoOrdenCompra === 2) {
                if (ordenCompraActual.idEstadoOrdenCompra !== 1) {
                    return res.status(400).json({ msg: 'Solo se puede cancelar una orden cuando está en estado Pendiente.' });
                }
                payload.idEstadoOrdenCompra = 2;
            }

            // REGLA 2: Enviar solo si está en estado Pendiente
            if (idEstadoOrdenCompra === 3) {
                if (ordenCompraActual.idEstadoOrdenCompra !== 1) {
                    return res.status(400).json({ msg: 'Solo se puede enviar/modificar una orden que está en estado Pendiente.' });
                }

                const puntoPedido = articuloRelacionado.inventario?.puntoPedido ?? 0;
                console.log("orden-compra-linea-129: ", nuevoStock)
                console.log(confirmarEnvioForzado)
                if (
                    articuloRelacionado.modeloInventario === 'LF' &&
                    nuevoStock < puntoPedido &&
                    !confirmarEnvioForzado
                ) {
                    return res.status(200).json({
                        msg: 'La cantidad no supera el Punto de Pedido.',
                        advertencia: true,
                    });
                }

                //Si paso la validación o se confirmó el envío forzado:
                payload.idEstadoOrdenCompra = 3;
                const ordenActualizadaForzada = await prisma.ordenCompra.update({
                    where: { idOrdenCompra: parseInt(id) },
                    data: payload
                });

                const mensaje = (nuevoStock < puntoPedido)
                    ? 'Orden enviada, aunque no supera el Punto de Pedido.'
                    : 'Orden enviada correctamente.'

                return res.status(200).json({ msg: mensaje, data: ordenActualizadaForzada })
            }

            // REGLA 3: Finalizar solo si está en estado Enviada
            if (idEstadoOrdenCompra === 4) {
                if (ordenCompraActual.idEstadoOrdenCompra !== 3) {
                    return res.status(400).json({ msg: 'Solo se puede finalizar una orden que está en estado Enviada.' });
                }

                if (!ordenCompraActual.cantidad || ordenCompraActual.cantidad <= 0) {
                    return res.status(400).json({ msg: 'La cantidad debe ser mayor a cero para finalizar la orden.' });
                }

                payload.idEstadoOrdenCompra = 4;

                // Actualizar stock del artículo
                await prisma.articulo.update({
                    where: { idArticulo: ordenCompraActual.idArticulo },
                    data: {
                        stock: {
                            increment: ordenCompraActual.cantidad
                        }
                    }
                });

                const ordenFinalizada = await prisma.ordenCompra.update({
                    where: { idOrdenCompra: parseInt(id) },
                    data: payload
                });

                return res.status(200).json({
                    msg: 'Orden finalizada correctamente.',
                    data: ordenFinalizada
                });
            }

            // Solo permitir modificar campos si está en estado Pendiente
            const estadoNoCambio = idEstadoOrdenCompra === ordenCompraActual.idEstadoOrdenCompra || idEstadoOrdenCompra === undefined;
            const modificandoCampos = idArticulo !== ordenCompraActual.idArticulo || cantidad !== ordenCompraActual.cantidad;

            if (estadoNoCambio && modificandoCampos && ordenCompraActual.idEstadoOrdenCompra !== 1) {
                return res.status(400).json({ msg: 'Solo se puede modificar una orden cuando está en estado Pendiente.' });
            }

            // Si no es finalización ni cancelación ni envío, mantener o actualizar estado
            if (idEstadoOrdenCompra && !payload.idEstadoOrdenCompra) {
                payload.idEstadoOrdenCompra = idEstadoOrdenCompra;
            }

            const ordenActualizada = await prisma.ordenCompra.update({
                where: { idOrdenCompra: parseInt(id) },
                data: payload
            });

            return res.status(200).json({ msg: 'Se ha actualizado la orden de compra.', data: ordenActualizada });

        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ msg: 'Error al actualizar la orden de compra', detail: error.message });
        }
    },


    // Eliminar un ordenCompra (baja lógica SOLO si está Cancelada)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const orden = await prisma.ordenCompra.findUnique({
                where: { idOrdenCompra: parseInt(id) },
            });

            if (!orden) {
                return res.status(404).json({ msg: "Orden de compra no encontrada." });
            }

            if (orden.idEstadoOrdenCompra !== 2 && orden.idEstadoOrdenCompra !== 4) {
                return res.status(400).json({ msg: "Solo se pueden eliminar órdenes con estado Cancelada o Finalizada." });
            }

            await prisma.ordenCompra.update({
                where: { idOrdenCompra: parseInt(id) },
                data: { fechaBaja: new Date() },
            });

            res.status(200).json({ msg: "La orden de compra fue dada de baja correctamente." });

        } catch (error: any) {
            res.status(500).json({
                msg: "Error al dar de baja la orden de compra.",
                detail: error.message,
            });
        }
    },


 


}
