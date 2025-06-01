import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { VentaRepository } from "../repositories/venta.repository";

const prisma = new PrismaClient();
const ventaRepository = new VentaRepository();

export const VentaController = {
    // Obtener todos los ventas
    getAll: async (req: Request, res: Response) => {
        try {
            const ventas = await ventaRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${ventas.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ventas});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un venta por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ventaRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo venta (create)
    create: async (req: Request, res: Response) => {
        let { idArticulo, cantidad, fechaCreacion, articulo } = req.body;
        try {
            if (!fechaCreacion) fechaCreacion = new Date();
            const nuevaVenta = await prisma.venta.create({
                data: { idArticulo, cantidad, fechaCreacion, articulo },
            });
            res.status(200).json({ msg: 'Se ha creado el venta.', data: nuevaVenta });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el venta', detail: error.message });
        }
    },
    
    // Actualizar un venta (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idArticulo, cantidad, fechaCreacion, articulo } = req.body;
        let payload: any = {  idArticulo, cantidad, fechaCreacion, articulo };
        try {
            const ventaActualizado = await prisma.venta.update({
                where: { idVenta: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el venta.', data: ventaActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el venta', detail: error.message });
        }
    },
    
    // Eliminar un venta (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.venta.delete({
                where: { idVenta: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el venta.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el venta', detail: error.message });
        }
    },
}
