import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { AjustesRepository } from "../repositories/ajustes.repository";

const prisma = new PrismaClient();
const ajustesRepository = new AjustesRepository();

export const AjustesController = {

    // Obtener un ajuste por su ID
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const ajuste = await ajustesRepository.findById(Number(id), decodeURIComponent(req.url));
            res.json({ msg: 'Se ha encontrado el registro', data: ajuste });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo ajuste de inventario
    create: async (req: Request, res: Response) => {
        const { idArticulo, cantOrig, cantNew, fecha, UserName } = req.body;
        try {
            // Validamos si el artículo existe
            const articulo = await prisma.articulo.findUnique({
                where: { idArticulo: Number(idArticulo) }
            });

            if (!articulo) {
                return res.status(404).json({ msg: 'Artículo no encontrado' });
            }

            // Creamos el ajuste
            const data: any = {
                idArticulo: Number(idArticulo),
                cantOrig,
                cantNew,
                UserName
            };
            if (fecha) {
                data.fecha = new Date(fecha);
            }
            const nuevoAjuste = await prisma.ajustesInv.create({
                data,
                include: {
                    articulo: true // opcional: para traer también los datos del artículo asociado
                }
            });

            res.status(200).json({ msg: 'Se ha creado el ajuste.', data: nuevoAjuste });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el ajuste', detail: error.message });
        }
    }

};
