import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ArticuloRepository } from "../repositories/articulo.repository";
import { calcularInventario } from "../services/inventario.service";

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

    create: async (req: Request, res: Response) => {
        console.log("holatoyentrandingjeejej")

        const { descripcion, modeloInventario, stock, inventario } = req.body;

        try {

            const { demandaArticulo, costoPedido, costoAlmacenamiento, costoCompra, demoraEntrega, periodoRevision } = inventario;

            console.log(inventario)

            let data: any = {
                descripcion,
                modeloInventario,
                stock,
                inventario: {
                    create: {
                        demandaArticulo,
                        costoPedido,
                        costoAlmacenamiento,
                        costoCompra,
                        periodoRevision,
                        loteOptimo: 0,
                        puntoPedido: 0,
                        stockSeguridad: 0
                    }
                }
            };

            const nuevoArticulo = await prisma.articulo.create({
                data,
                include: { inventario: true }
            });

            res.status(200).json({ msg: 'Se ha creado el artículo.', data: nuevoArticulo });
            console.log(nuevoArticulo);

        } catch (error: any) {
            console.log("error en create articulo")
            console.log(error)
            res.status(500).json({ msg: 'Error al crear el artículo', detail: error.message });
            console.log(error);
        }
    },


    //actualizar articulo version mejorada
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            idInventario,
            fechaBaja,
            descripcion,
            modeloInventario,
            stock,
            inventario,
            articuloProveedor
        } = req.body;

        const payload: any = { idInventario, descripcion, modeloInventario, stock };
        if (fechaBaja) payload.fechaBaja = fechaBaja;

        try {
            // 1. Actualizar artículo principal
            const articuloActualizado = await prisma.articulo.update({
                where: { idArticulo: parseInt(id) },
                data: payload,
            });

            // 2. Actualizar inventario si viene presente
            if (inventario && inventario.idInventario) {
                await prisma.inventario.update({
                    where: { idInventario: inventario.idInventario },
                    data: {
                        demandaArticulo: inventario.demandaArticulo,
                        costoAlmacenamiento: inventario.costoAlmacenamiento,
                        costoPedido: inventario.costoPedido,
                        costoCompra: inventario.costoCompra,
                        periodoRevision: inventario.periodoRevision,
                    },
                });
            }

            // 3. Actualizar artículo-proveedor si viene presente
            if (articuloProveedor && articuloProveedor.idArticuloProveedor) {
                await prisma.articuloProveedor.update({
                    where: { idArticuloProveedor: articuloProveedor.idArticuloProveedor },
                    data: {
                        idProveedor: articuloProveedor.idProveedor,
                        idArticulo: parseInt(id),
                        precioUnitario: articuloProveedor.precioUnitario,
                        demoraEntrega: articuloProveedor.demoraEntrega,
                        cargoPedido: articuloProveedor.cargoPedido,
                        esPredeterminado: articuloProveedor.esPredeterminado,
                        nivelServicio: articuloProveedor.nivelServicio,
                        desviacionEstandar: articuloProveedor.desviacionEstandar,
                    },
                });
            }

            // 4. Recalcular inventario si todo está presente
            if (
                inventario &&
                articuloProveedor &&
                typeof inventario.demandaArticulo === "number" &&
                typeof inventario.costoAlmacenamiento === "number" &&
                typeof inventario.costoPedido === "number" &&
                typeof articuloProveedor.demoraEntrega === "number" &&
                typeof articuloProveedor.nivelServicio === "number" &&
                typeof articuloProveedor.desviacionEstandar === "number" &&
                typeof inventario.periodoRevision === "number"
            ) {
                const nuevosValores = calcularInventario({
                    demandaArticulo: inventario.demandaArticulo,
                    costoPedido: inventario.costoPedido,
                    costoAlmacenamiento: inventario.costoAlmacenamiento,
                    demoraEntrega: articuloProveedor.demoraEntrega,
                    modeloInventario: articuloActualizado.modeloInventario,
                    nivelServicio:  articuloProveedor.nivelServicio,
                    desviacionEstandar: articuloProveedor.desviacionEstandar,
                    periodoRevision: inventario.periodoRevision,
                });

                console.log("🔁 Recalculando inventario con:", nuevosValores);

                await prisma.inventario.update({
                    where: { idInventario: inventario.idInventario },
                    data: {
                        ...nuevosValores,
                    }
                });
            } else {

                //caso de que no funcione la condición del if
                console.log("⚠️ No se entra al if de calcularInventario. Revisar los siguientes valores:");

                console.log("inventario:", inventario);
                console.log("articuloProveedor:", articuloProveedor);
                console.log("demandaArticulo:", inventario?.demandaArticulo, "→", typeof inventario?.demandaArticulo);
                console.log("costoAlmacenamiento:", inventario?.costoAlmacenamiento, "→", typeof inventario?.costoAlmacenamiento);
                console.log("costoPedido:", inventario?.costoPedido, "→", typeof inventario?.costoPedido);
                console.log("demoraEntrega:", articuloProveedor?.demoraEntrega, "→", typeof articuloProveedor?.demoraEntrega);
                console.log("nivelServicio:", articuloProveedor?.nivelServicio, "→", typeof articuloProveedor?.nivelServicio);
                console.log("desviacionEstandar:", articuloProveedor?.desviacionEstandar, "→", typeof articuloProveedor?.desviacionEstandar);
                console.log("periodoRevision:", inventario?.periodoRevision, "→", typeof inventario?.periodoRevision);
            }


            return res.status(200).json({
                msg: 'Se ha actualizado el articulo y se ha recalculado el inventario.',
                data: articuloActualizado,
            });

        } catch (error: any) {
            console.error("❌ Error al actualizar artículo:", error);
            console.log("fffffffffffffffffff")
            return res.status(500).json({
                msg: 'Error al actualizar el articulo',
                detail: error.message,
            });
        }
    },


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
