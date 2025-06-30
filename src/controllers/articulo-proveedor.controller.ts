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
            console.log(req.url)
            console.log("hola")
            res.status(200).json({ msg: `${articuloProveedor.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: articuloProveedor});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un articuloProveedor por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await articuloProveedorRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo articuloProveedor (create)
    create: async (req: Request, res: Response) => {
        let { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario } = req.body;
        try {
            const nuevoArticuloProveedor = await prisma.articuloProveedor.create({
                data: { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario },
            });
            res.status(200).json({ msg: 'Se ha creado el articuloProveedor.', data: nuevoArticuloProveedor });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el articuloProveedor', detail: error.message });
        }
    },
    
    // Actualizar un articuloProveedor (update)
    // update: async (req: Request, res: Response) => {
    //     const { id } = req.params;
    //     let { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario } = req.body;
    //     let payload: any = { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario };
    //     try {
    //         const articuloProveedorActualizado = await prisma.articuloProveedor.update({
    //             where: { idArticuloProveedor: parseInt(id) },
    //             data: payload,
    //         });
    //         res.status(200).json({ msg: 'Se ha actualizado el articuloProveedor.', data: articuloProveedorActualizado });
    //     } catch (error: any) {
    //         res.status(500).json({ msg: 'Error al actualizar el articuloProveedor', detail: error.message });
    //     }
    // },

    // Actualizar un articuloProveedor (update)


    update: async (req: Request, res: Response) => {
    const { id } = req.params;
    let { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario } = req.body;
    let payload: any = { idArticulo, idProveedor, cargoPedido, demoraEntrega, esPredeterminado, precioUnitario };

    try {
        // 1. Actualizar artículoProveedor
        const articuloProveedorActualizado = await prisma.articuloProveedor.update({
            where: { idArticuloProveedor: parseInt(id) },
            data: payload,
        });

        // 2. Buscar artículo con inventario
        const articulo = await prisma.articulo.findUnique({
            where: { idArticulo },
            include: { inventario: true }
        });

        if (articulo?.inventario) {
            const {
                demandaArticulo,
                costoPedido,
                costoAlmacenamiento,
                idInventario,
                
            } = articulo.inventario;

            const tipoInventario: 'LF' | 'PF' = articulo.modeloInventario === 'PF' ? 'PF' : 'LF';


            console.log("Tipo inventario:", tipoInventario);
            console.log("Inventario actual:", articulo.inventario);

            // 3. Calcular nuevos valores
            const nuevosValores = calcularInventario({
                demandaArticulo,
                costoPedido,
                costoAlmacenamiento,
                demoraEntrega,
                
                //periodoRevision // puede ser undefined si LF
            });

            console.log("Recalculando...");
            console.log(nuevosValores);

            // 4. Actualizar inventario
            await prisma.inventario.update({
                where: { idInventario },
                data: nuevosValores
            });
        }

        res.status(200).json({
            msg: 'Se ha actualizado el articuloProveedor y recalculado el inventario.',
            data: {
                articuloProveedor: articuloProveedorActualizado,
                articulo: articulo,
            }
        });
    } catch (error: any) {
        res.status(500).json({
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
                include: {
                    proveedor: true,
                    articulo: true
                }
            });
            res.status(200).json({ msg: 'Proveedor predeterminado encontrado', data: resultado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener proveedor predeterminado', detail: error.message });
        }
    },






 

    
    // Eliminar un articuloProveedor (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.articuloProveedor.delete({
                where: { idArticuloProveedor: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el articuloProveedor.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el articuloProveedor', detail: error.message });
        }
    },
}
