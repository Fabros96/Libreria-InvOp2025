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
        try {
            if (Array.isArray(req.body)) {
                // Inserción múltiple
                const datos = req.body.map(item => ({
                    atributo: String(item.atributo),
                    fecha: new Date(item.fecha),
                    idArticulo: parseInt(item.idArticulo),
                    userName: String(item.userName),
                    valorNuevo: String(item.valorNuevo),
                    valorOriginal: String(item.valorOriginal),
                }));

                const resultado = await prisma.ajusteInventario.createMany({
                    data: datos,
                });

                return res.status(201).json({
                    msg: 'Ajustes de inventario creados correctamente.',
                    data: resultado,
                });

            } else {
                // Inserción individual
                const {atributo,fecha,idArticulo,userName,valorNuevo,valorOriginal} = req.body;

                const data = {
                    atributo: String(atributo),
                    fecha: new Date(fecha),
                    idArticulo: parseInt(idArticulo),
                    userName: String(userName),
                    valorNuevo: String(valorNuevo),
                    valorOriginal: String(valorOriginal),
                };

                const nuevoAjusteInventario = await prisma.ajusteInventario.create({
                    data,
                });

                return res.status(201).json({
                    msg: 'Ajuste de inventario creado correctamente.',
                    data: nuevoAjusteInventario,
                });
            }
        } catch (error: any) {
            return res.status(500).json({
                msg: 'Error al crear el ajuste de inventario.',
                detail: error.message,
            });
        }
    }


}
