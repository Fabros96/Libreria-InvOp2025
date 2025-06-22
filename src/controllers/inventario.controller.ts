import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { InventarioRepository } from "../repositories/inventario.repository";

const prisma = new PrismaClient();
const inventarioRepository = new InventarioRepository();

export const InventarioController = {
    // Obtener todos los inventarios
    getAll: async (req: Request, res: Response) => {
        try {
            const inventarios = await inventarioRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${inventarios.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: inventarios});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un inventario por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await inventarioRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo inventario (create)
    create: async (req: Request, res: Response) => {
        let { costoAlmacenamiento, costoCompra, costoPedido, demandaArticulo, loteOptimo, puntoPedido, stockSeguridad, articulo } = req.body;
        try {
            const nuevoInventario = await prisma.inventario.create({
                data: { costoAlmacenamiento, costoCompra, costoPedido, demandaArticulo, loteOptimo, puntoPedido, stockSeguridad, articulo },
            });
            res.status(200).json({ msg: 'Se ha creado el inventario.', data: nuevoInventario });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el inventario', detail: error.message });
        }
    },
    
    // Actualizar un inventario (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { costoAlmacenamiento, costoCompra, costoPedido, demandaArticulo, loteOptimo, puntoPedido, stockSeguridad, articulo } = req.body;
        let payload: any = { costoAlmacenamiento, costoCompra, costoPedido, demandaArticulo, loteOptimo, puntoPedido, stockSeguridad, articulo };
        try {
            const inventarioActualizado = await prisma.inventario.update({
                where: { idInventario: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el inventario.', data: inventarioActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el inventario', detail: error.message });
        }
    },
    
    // Eliminar un inventario (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.inventario.delete({
                where: { idInventario: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el inventario.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el inventario', detail: error.message });
        }
    },

    //Recalculo para un inventario
    recalculo: async (req: Request, res: Response) => {
        try {
            const inventarios = await inventarioRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${inventarios.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: inventarios});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
}
