import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { iniciarCronPorPeriodo, detenerTodosLosCrons } from "../services/cron.service";
import { obtenerMensajesCron } from "../services/cron-mensajes.service";

const prisma = new PrismaClient();


export const CronInventarioController = {


    iniciarCronDesdeFrontend: async (req: Request, res: Response) => {
        try {
            const resultado = await iniciarCronPorPeriodo();
            //console.log("desde el controller: ", resultado)
            return res.status(200).json(resultado);

        } catch (err: any) {
            return res.status(500).json({ mensaje: 'Error al iniciar cron', error: err.message });
        }
    },

    verMensajesCron: (req: Request, res: Response) => {
        const mensajes = obtenerMensajesCron();
        return res.status(200).json({ mensajes });
    },

    detenerCronDesdeFrontend: (req: Request, res: Response) => {
        try {
            detenerTodosLosCrons(); 
            return res.status(200).json({ mensaje: 'Crons detenidos correctamente' });
        } catch (err: any) {
            return res.status(500).json({ mensaje: 'Error al detener los crons', error: err.message });
        }
    }

}
