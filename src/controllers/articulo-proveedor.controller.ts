import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ArticuloProveedorRepository } from "../repositories/articulo-proveedor.repository";
import { calcularInventario } from "../services/inventario.service";

const prisma = new PrismaClient();
const articuloProveedorRepository = new ArticuloProveedorRepository();

export const ArticuloProveedorController = {

    // Obtener todos los articuloProveedor
    getAll: async (req: Request, res: Response) => {
        try {
            const articuloProveedor = await articuloProveedorRepository.findMany(decodeURIComponent(req.url));
            //console.log(req.url)
            //console.log(articuloProveedor)
            res.status(200).json({ msg: `${articuloProveedor.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: articuloProveedor });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un articuloProveedor por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await articuloProveedorRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    // Crear un nuevo articuloProveedor (create)
    create: async (req: Request, res: Response) => {
        let { idArticulo, idProveedor, demoraEntrega, esPredeterminado, precioUnitario, nivelServicio, desviacionEstandar } = req.body;
        try {
            const nuevoArticuloProveedor = await prisma.articuloProveedor.create({
                data: { idArticulo, idProveedor, demoraEntrega, esPredeterminado, precioUnitario, nivelServicio, desviacionEstandar },
            });
            res.status(200).json({ msg: 'Se ha creado el articuloProveedor.', data: nuevoArticuloProveedor });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el articuloProveedor', detail: error.message });
        }
    },

    // Actualizar un articuloProveedor (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;

         const {
            idArticulo,
            idProveedor,
            demoraEntrega, 
            fechaBaja,
            esPredeterminado, 
            precioUnitario, 
            nivelServicio, 
            desviacionEstandar
        } = req.body;

        const payload: any = { idArticulo, idProveedor, demoraEntrega, esPredeterminado, precioUnitario, nivelServicio, desviacionEstandar };
        if (fechaBaja) payload.fechaBaja = fechaBaja;
        try {
            // 1. Actualizar artículoProveedor
            const articuloProveedorActualizado = await prisma.articuloProveedor.update({
                where: { idArticuloProveedor: parseInt(id) },
                data: payload,
            });

            // 2. Buscar inventario del artículo
            const articulo = await prisma.articulo.findUnique({
                where: { idArticulo },
                include: {
                    inventario: true
                }
            });

            const articuloActual = await prisma.articulo.findUnique({
                where: { idArticulo },
                select: { modeloInventario: true }
            });

            //console.log("estoy viendo como llega articulo.inventario desde articulo-proveed: "+articulo?.inventario)

            if (articulo?.inventario) {
                const { demandaArticulo, costoPedido, costoAlmacenamiento, periodoRevision, idInventario } = articulo.inventario;

                const nuevosValores = calcularInventario({
                    demandaArticulo,
                    costoPedido,
                    costoAlmacenamiento,
                    demoraEntrega,
                    modeloInventario: articuloActual?.modeloInventario,
                    nivelServicio,
                    desviacionEstandar,
                    periodoRevision: periodoRevision ?? undefined,
                    precioUnitario,
                });

                await prisma.inventario.update({
                    where: { idInventario },
                    data: nuevosValores
                });

                //console.log("losCalculos")
                //console.log(nuevosValores)
                //console.log(periodoRevision)
                //console.log("losCalculos")
            }

            return res.status(200).json({
                msg: 'Se ha actualizado el articuloProveedor y recalculado el inventario.',
                data: {
                    articuloProveedor: articuloProveedorActualizado,
                    articulo: articulo,
                }
            });

        } catch (error: any) {
            return res.status(500).json({
                msg: 'Error al actualizar el articuloProveedor',
                detail: error.message
            });
        }
    },



    // En el controller
    getPredeterminadoPorArticulo: async (req: Request, res: Response) => {
        const { idArticulo } = req.params;
        try {
            const resultado = await prisma.articuloProveedor.findFirst({
                where: {
                    idArticulo: Number(idArticulo),
                    esPredeterminado: true
                },
                orderBy: {
                    idProveedor: 'desc'
                },
                include: {
                    proveedor: true,
                    articulo: true
                }
            });
            //console.log("Asi trae un articulo que tiene proveedores")
            //console.log(resultado)
            res.status(200).json({ msg: 'Proveedor predeterminado encontrado', data: resultado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener proveedor predeterminado', detail: error.message });
        }
    },




    // Eliminar un articuloProveedor (Baja lógica)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const articuloProveedorBaja = await prisma.articuloProveedor.update({
                where: { idArticuloProveedor: parseInt(id) },
                data: { fechaBaja: new Date() }
            });
            res.status(200).json({ msg: 'Se ha eliminado el articuloProveedor.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el articuloProveedor', detail: error.message });
        }
    },
}
