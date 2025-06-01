import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { EstadoOrdenCompraRepository } from "../repositories/estado-orden-compra.repository";

const prisma = new PrismaClient();
const estadoOrdenCompraRepository = new EstadoOrdenCompraRepository();

export const EstadoOrdenCompraController = {
    // Obtener todos los estadoOrdenCompras
    getAll: async (req: Request, res: Response) => {
        try {
            const estadoOrdenCompras = await estadoOrdenCompraRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${estadoOrdenCompras.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: estadoOrdenCompras});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un estadoOrdenCompra por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await estadoOrdenCompraRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo estadoOrdenCompra (create)
    create: async (req: Request, res: Response) => {
        let { fechaBaja, nombre } = req.body;
        try {
            const nuevoEstadoOrdenCompra = await prisma.estadoOrdenCompra.create({
                data: {fechaBaja, nombre },
            });
            res.status(200).json({ msg: 'Se ha creado el estadoOrdenCompra.', data: nuevoEstadoOrdenCompra });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el estadoOrdenCompra', detail: error.message });
        }
    },
    
    // Actualizar un estadoOrdenCompra (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { fechaBaja, nombre } = req.body;
        let payload: any = {fechaBaja, nombre };
        try {
            const estadoOrdenCompraActualizado = await prisma.estadoOrdenCompra.update({
                where: { idEstadoOrdenCompra: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el estadoOrdenCompra.', data: estadoOrdenCompraActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el estadoOrdenCompra', detail: error.message });
        }
    },
    
    // Eliminar un estadoOrdenCompra (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.estadoOrdenCompra.delete({
                where: { idEstadoOrdenCompra: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el estadoOrdenCompra.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el estadoOrdenCompra', detail: error.message });
        }
    },
}
