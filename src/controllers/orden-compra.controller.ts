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
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
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
        let { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion } = req.body;
        try {

            const ordenExistente = await prisma.ordenCompra.findFirst({
                where: {
                    idArticulo: idArticulo,
                    idEstadoOrdenCompra: {
                        in: [1, 4]
                    }
                }
            });

            if (ordenExistente) {
                return res.status(400).json({
                    msg: 'Ya existe una orden de compra activa para este artículo.'
                });
            }
            const nuevoOrdenCompra = await prisma.ordenCompra.create({
                data: { 
                    idArticulo, 
                    idProveedor, 
                    idEstadoOrdenCompra, 
                    cantidad, 
                    fechaCreacion 
                },
            });
            res.status(200).json({ msg: 'Se ha creado el ordenCompra.', data: nuevoOrdenCompra });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el ordenCompra', detail: error.message });
        }
    },
    
    // Actualizar un ordenCompra (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion } = req.body;
        let payload: any = { idArticulo, idProveedor, idEstadoOrdenCompra, cantidad, fechaCreacion };
        try {
            //Traer el estado actual de la OC
            const ordenCompraActual = await prisma.ordenCompra.findUnique({
                where: {idOrdenCompra: parseInt(id)},
                select: {idEstadoOrdenCompra: true,
                        cantidad: true,
                        idArticulo: true}
            });

            if (!ordenCompraActual) {
                return res.status(404).json({msg: 'Orden de compra no encontrada.'})
            }

            //Si se intenta cancelar la OC, validar que esté en estado Pendiente
            //1 = Creado (se cambiaría a Pendiente el 1) - valido que la OC no este cancelada y que sea distinto de pendiente

            if (idEstadoOrdenCompra === 4 && ordenCompraActual.idEstadoOrdenCompra !== 1) {
                return res.status(400).json({msg: 'Solo se puede cancelar una orden cuando está en estado Pendiente.'})
            }

            //Si el estado nuevo es Finalizado, actualizar el inventario.

            if (ordenCompraActual.cantidad === null) { //hago esto por que no me deja utilizar el "increment"
                return res.status(400).json({
                    msg: 'La cantidad no puede ser nula al finalizar la compra.'
                })
            }

            if (idEstadoOrdenCompra === 2 && ordenCompraActual.idEstadoOrdenCompra !== 2) {
                await prisma.articulo.update({
                    where: {idArticulo: ordenCompraActual.idArticulo},
                    data: {
                        stock: {
                            increment: ordenCompraActual.cantidad
                        }
                    }
                });
            }


            //OC no puede ser modificada ni cancelada cuando el estado es Enviada
            if (idEstadoOrdenCompra === 5) {
                return res.status(400).json({msg: 'La orden ya fue enviada y no puede ser modificada.'})
            }

            if (idEstadoOrdenCompra !== undefined) {
                payload.idEstadoOrdenCompra = idEstadoOrdenCompra
            }

            const ordenCompraActualizado = await prisma.ordenCompra.update({
                where: { idOrdenCompra: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el ordenCompra.', data: ordenCompraActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el ordenCompra', detail: error.message });
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
