import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ArticuloRepository } from "../repositories/articulo.repository";

const prisma = new PrismaClient();
const articuloRepository = new ArticuloRepository();

export const ArticuloController = {
    // Obtener todos los articulos
    getAll: async (req: Request, res: Response) => {
        try {
            const articulos = await articuloRepository.findMany(decodeURIComponent(req.url));
            res.status(200).json({ msg: `${articulos.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: articulos });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
            //prueba
        }
    },

    // Obtener un articulo por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await articuloRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo articulo (create)
    // create: async (req: Request, res: Response) => {
    //     let { idInventario, fechaBaja, descripcion, modeloInventario, stock } = req.body;
    //     try {
    //         const nuevoArticulo = await prisma.articulo.create({
    //             data: { idInventario, fechaBaja, descripcion, modeloInventario, stock },
    //         });
    //         res.status(200).json({ msg: 'Se ha creado el articulo.', data: nuevoArticulo });
    //         console.log(nuevoArticulo)
    //     } catch (error: any) {
    //         res.status(500).json({ msg: 'Error al crear el articulo', detail: error.message });
    //         console.log(error)
    //     }
    // },

    create: async (req: Request, res: Response) => {
        // {
        //     "descripcion": "aa",
        //     "modeloInventario": 1,
        //     "stock": 14,
        //     "inventario": {
        //         "costoAlmacenamiento": 12,
        //         "costoCompra": 12,
        //         "costoPedido": 12,
        //         "demandaArticulo": 12,
        //         "loteOptimo": 12,
        //         "puntoPedido": 12,
        //         "stockSeguridad": 12
        //     }
        // }
        const { descripcion, modeloInventario, stock, inventario } = req.body;

        try {
            let data: any = {
                descripcion,
                modeloInventario,
                stock,
                inventario: { ...{ create: { ...inventario } } }
            };
            
            const nuevoArticulo = await prisma.articulo.create({
                data,
                include: { inventario: true }
            });

            res.status(200).json({ msg: 'Se ha creado el artículo.', data: nuevoArticulo });
            console.log(nuevoArticulo);

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el artículo', detail: error.message });
            console.log(error);
        }
    },


    // Actualizar un articulo (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idInventario, fechaBaja, descripcion, modeloInventario, stock } = req.body;
        let payload: any = { idInventario, descripcion, modeloInventario, stock };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const articuloActualizado = await prisma.articulo.update({
                where: { idArticulo: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el articulo.', data: articuloActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el articulo', detail: error.message });
        }
    },

    // Eliminar un articulo (delete)
    // delete: async (req: Request, res: Response) => {
    //     const { id } = req.params;
    //     try {
    //         await prisma.articulo.delete({
    //             where: { idArticulo: parseInt(id) },
    //         });
    //         res.status(200).json({ msg: 'Se ha eliminado el articulo.' });
    //     } catch (error: any) {
    //         res.status(500).json({ msg: 'Error al eliminar el articulo', detail: error.message });
    //     }
    // },

    // Eliminar articulo (Baja lógica)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const articuloBaja = await prisma.articulo.update({
                where: { idArticulo: parseInt(id) },
                data: { fechaBaja: new Date() }
            });
            res.status(200).json({ msg: 'articulo dado de baja', data: articuloBaja });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al dar de baja el articulo', detail: error.message });
        }
    },
}
