import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { AjusteInventarioRepository } from "../repositories/ajuste-inventario.repository";

const prisma = new PrismaClient();
const ajusteInventarioRepository = new AjusteInventarioRepository();

export const AjusteInventarioController = {
    // Obtener todos los ajusteInventarios
    getAll: async (req: Request, res: Response) => {
        try {
            const ajusteInventarios = await ajusteInventarioRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${ajusteInventarios.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ajusteInventarios });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un ajuste inventario por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ajusteInventarioRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    create: async (req: Request, res: Response) => {
        let { idArticulo, cantOrig, cantNew, fecha, userName } = req.body;
        try {

            const nuevoAjusteInventario = await prisma.ajusteInventario.create({
                data: { idArticulo, cantOrig, cantNew, fecha, userName }
            });

            res.status(201).json({ msg: 'Ajuste inv creado correctamente.', data: nuevoAjusteInventario });

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la ajuste-inventario', detail: error.message });
        }
    },

    // Actualizar un ajuste-inventario (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idArticulo, cantOrig, cantNew, fecha, userName } = req.body;
        let payload: any = { idArticulo, cantOrig, cantNew, fecha, userName };
        try {
            const ajusteInventarioActualizado = await prisma.ajusteInventario.update({
                where: { idAjusteInventario: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el ajuste-inventario.', data: ajusteInventarioActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el ajuste-inventario', detail: error.message });
        }
    },

    // Eliminar un ajuste-inventario (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.ajusteInventario.delete({
                where: { idAjusteInventario: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el ajuste-inventario.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el ajuste-inventario', detail: error.message });
        }
    },

}
