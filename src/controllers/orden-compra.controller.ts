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
            res.status(200).json({ msg: `${ordenCompras.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ordenCompras});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener networkeo registros', detail: error.message });
        }
    },
    
    // Obtener un ordenCompra por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ordenCompraRepository.findById(Number(id), decodeURIComponent(req.url))});
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
            const ordenExistente = await prisma.ordenCompra.findFirst({
                where: {
                    idArticulo: Number(idArticulo),
                    idEstadoOrdenCompra: {
                        in: [3, 4]
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
        let { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion } = req.body;
        let payload: any = { idArticulo, idProveedor, cantidad, fechaCreacion };

        try {
            // Traer la OC actual
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

            // Obtener el artículo relacionado (modeloInventario y puntoPedido)
            const articuloRelacionado = await prisma.articulo.findUnique({
                where: { idArticulo: ordenCompraActual.idArticulo },
                select: {
                    modeloInventario: true,
                    stock: true,
                    inventario: {
                        select: {
                            puntoPedido: true
                        }
                    }
                }
            });


            if (!articuloRelacionado) {
                return res.status(404).json({ msg: 'Artículo relacionado no encontrado.' });
            }


            // OC ya enviada (4) => no se permite modificar ni cancelar
            console.log(ordenCompraActual.idEstadoOrdenCompra) //a
            if (ordenCompraActual.idEstadoOrdenCompra === 1) {
                return res.status(400).json({ msg: 'La orden ya fue Cancelada.' });
            }

            if (ordenCompraActual.idEstadoOrdenCompra === 4 && idEstadoOrdenCompra !== 2) {
                // Enviada solo puede pasar a Finalizada
                return res.status(400).json({ msg: 'Una orden Enviada solo puede cambiarse a Finalizada.' });
            }

            // Cancelar => solo si está en estado Pendiente (3)
            if (idEstadoOrdenCompra === 1) {
                if (ordenCompraActual.idEstadoOrdenCompra !== 3) {
                    return res.status(400).json({ msg: 'Solo se puede cancelar una orden cuando está en estado Pendiente.' });
                }
                payload.idEstadoOrdenCompra = 1;
            }

            // Finalizar => actualizar stock y validar punto de pedido
            if (idEstadoOrdenCompra === 4) {
                if (ordenCompraActual.idEstadoOrdenCompra !== 2) {
                    return res.status(400).json({ msg: 'La orden Enviada solo puede pasar al estado Finalizada.' });
                }

                if (ordenCompraActual.cantidad === null || ordenCompraActual.cantidad <= 0) {
                    return res.status(400).json({ msg: 'La cantidad debe ser mayor a cero para finalizar la orden.' });
                }

                // Actualizar stock
                await prisma.articulo.update({
                    where: { idArticulo: ordenCompraActual.idArticulo },
                    data: {
                        stock: {
                            increment: ordenCompraActual.cantidad
                        }
                    }
                });

                payload.idEstadoOrdenCompra = 2;

                // Verificar Punto de Pedido si modelo es Lote Fijo (1002)
            //if (
                    //articuloRelacionado.modeloInventario === 1002 &&
                  //  (articuloRelacionado.stock + ordenCompraActual.cantidad) < (articuloRelacionado.puntoPedido ?? 0)
                //) {
                    //return res.status(200).json({
                     //   msg: 'Orden finalizada. Sin embargo, la cantidad total no supera el Punto de Pedido.',
                   //     advertencia: true
                 //   });
               // }
            }

            // Si no es cancelación ni finalización, y el estado no está definido, mantenerlo
            if (idEstadoOrdenCompra && !payload.idEstadoOrdenCompra) {
                payload.idEstadoOrdenCompra = idEstadoOrdenCompra;
            }

            // Actualizar OC
            const ordenCompraActualizado = await prisma.ordenCompra.update({
                where: { idOrdenCompra: parseInt(id) },
                data: payload,
            });

            res.status(200).json({ msg: 'Se ha actualizado la orden de compra.', data: ordenCompraActualizado });

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar la orden de compra', detail: error.message });
        }
    },


    // Eliminar un ordenCompra (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.ordenCompra.delete({
                where: { idOrdenCompra: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el ordenCompra.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el ordenCompra', detail: error.message });
        }
    },
}
