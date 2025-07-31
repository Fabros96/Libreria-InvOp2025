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

        const { descripcion, modeloInventario, stock, inventario } = req.body;

        try {

            const { demandaArticulo, costoPedido, costoAlmacenamiento, demoraEntrega, periodoRevision } = inventario;

            //console.log(inventario)

            let data: any = {
                descripcion,
                modeloInventario,
                stock,
                inventario: {
                    create: {
                        demandaArticulo,
                        costoPedido,
                        costoAlmacenamiento,
                        periodoRevision,
                        loteOptimo: 0,
                        puntoPedido: 0,
                        stockSeguridad: 0,
                        cgi: 0
                    }
                }
            };

            const nuevoArticulo = await prisma.articulo.create({
                data,
                include: { inventario: true }
            });

            res.status(200).json({ msg: 'Se ha creado el artículo.', data: nuevoArticulo });
            //console.log(nuevoArticulo);

        } catch (error: any) {
            //console.log("error en create articulo")
            //console.log(error)
            res.status(500).json({ msg: 'Error al crear el artículo', detail: error.message });
            //console.log(error);
        }
    },

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
        //console.log("📥 Body recibido:", req.body);

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
                        periodoRevision: inventario.periodoRevision,
                        cgi: inventario.cgi,
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
                        esPredeterminado: articuloProveedor.esPredeterminado,
                        nivelServicio: articuloProveedor.nivelServicio,
                        desviacionEstandar: articuloProveedor.desviacionEstandar,
                    },
                });
            }

            // 4. Buscar proveedor predeterminado si no viene o está incompleto
            let proveedorAUsar = articuloProveedor;

            if (
                !proveedorAUsar ||
                typeof proveedorAUsar.demoraEntrega !== "number" ||
                typeof proveedorAUsar.nivelServicio !== "number" ||
                typeof proveedorAUsar.desviacionEstandar !== "number"
            ) {
                proveedorAUsar = await prisma.articuloProveedor.findFirst({
                    where: {
                        idArticulo: parseInt(id),
                        esPredeterminado: true,
                        fechaBaja: null
                    },
                    orderBy: { idProveedor: 'desc' }
                });

                if (!proveedorAUsar) {
                    //console.log("⚠️ No se encontró proveedor predeterminado. No se recalcula inventario.");
                }
            }

            // 5. Recalcular inventario si todo está presente
            //console.log("invent: ",inventario)
            //console.log("proveedorAUsar:",proveedorAUsar)
            if (
                inventario &&
                proveedorAUsar &&
                typeof inventario.demandaArticulo === "number" &&
                typeof inventario.costoAlmacenamiento === "number" &&
                typeof inventario.costoPedido === "number" &&
                typeof proveedorAUsar.demoraEntrega === "number" &&
                typeof proveedorAUsar.nivelServicio === "number" &&
                typeof proveedorAUsar.desviacionEstandar === "number" &&
                typeof inventario.periodoRevision === "number" &&
                typeof articuloProveedor.precioUnitario === "number"

            ) {
                const nuevosValores = calcularInventario({
                    demandaArticulo: inventario.demandaArticulo,
                    costoPedido: inventario.costoPedido,
                    costoAlmacenamiento: inventario.costoAlmacenamiento,
                    demoraEntrega: proveedorAUsar.demoraEntrega,
                    modeloInventario: articuloActualizado.modeloInventario,
                    nivelServicio: proveedorAUsar.nivelServicio,
                    desviacionEstandar: proveedorAUsar.desviacionEstandar,
                    periodoRevision: inventario.periodoRevision,
                    precioUnitario: articuloProveedor.precioUnitario,

                });

                //console.log("🔁 Recalculando inventario con:", nuevosValores);

                await prisma.inventario.update({
                    where: { idInventario: inventario.idInventario },
                    data: nuevosValores
                });
            } else {
                //console.log("⚠️ No se cumplen condiciones para recalcular inventario.");
            }

            return res.status(200).json({
                msg: 'Se ha actualizado el artículo y se ha recalculado el inventario si correspondía.',
                data: articuloActualizado,
            });

        } catch (error: any) {
            // console.error("❌ Error al actualizar artículo:", error);
            return res.status(500).json({
                msg: 'Error al actualizar el artículo',
                detail: error.message,
            });
        }
    },

    recalcular: async (req: Request, res: Response) => {
        try {
            // console.info("♻️  Recalculando inventarios para artículos");

            const { ids } = req.body; // ids debería ser un array de números

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ msg: "Se debe enviar un arreglo de IDs válido" });
            }

            const filter = {
                where: {
                    idArticulo: { in: ids },
                    fechaBaja: null
                },
                include: {
                    inventario: true
                }
            };

            const articulos = await prisma.articulo.findMany(filter);

            for (const articulo of articulos) {
                const inventario = articulo.inventario;

                const proveedor = await prisma.articuloProveedor.findFirst({
                    where: {
                        idArticulo: articulo.idArticulo,
                        esPredeterminado: true,
                        fechaBaja: null
                    },
                });

                const faltantes: string[] = [];

                if (!inventario) faltantes.push("inventario");
                if (!proveedor) faltantes.push("proveedor");

                // Si inventario o proveedor no existen, no tiene sentido seguir
                if (faltantes.length > 0) {
                    // console.warn(`❌ Artículo ${articulo.idArticulo}: faltan datos - ${faltantes.join(", ")}`);
                    continue;
                }

                // Verificamos cada campo que debe ser number
                if (typeof inventario.demandaArticulo !== "number") faltantes.push("inventario.demandaArticulo");
                if (typeof inventario.costoAlmacenamiento !== "number") faltantes.push("inventario.costoAlmacenamiento");
                if (typeof inventario.costoPedido !== "number") faltantes.push("inventario.costoPedido");
                if (typeof proveedor?.demoraEntrega !== "number") faltantes.push("proveedor.demoraEntrega");
                if (typeof proveedor?.nivelServicio !== "number") faltantes.push("proveedor.nivelServicio");
                if (typeof proveedor?.desviacionEstandar !== "number") faltantes.push("proveedor.desviacionEstandar");
                if (typeof inventario.periodoRevision !== "number") faltantes.push("inventario.periodoRevision");
                if (typeof proveedor?.precioUnitario !== "number") faltantes.push("proveedor.precioUnitario");

                // Validamos también que no sean cero en esos campos relevantes
                if (inventario.demandaArticulo === 0) faltantes.push("inventario.demandaArticulo=0");
                if (inventario.costoAlmacenamiento === 0) faltantes.push("inventario.costoAlmacenamiento=0");
                if (inventario.costoPedido === 0) faltantes.push("inventario.costoPedido=0");
                if (proveedor?.demoraEntrega === 0) faltantes.push("proveedor.demoraEntrega=0");
                if (proveedor?.nivelServicio === 0) faltantes.push("proveedor.nivelServicio=0");
                if (proveedor?.desviacionEstandar === 0) faltantes.push("proveedor.desviacionEstandar=0");
                if (proveedor?.precioUnitario === 0) faltantes.push("proveedor.precioUnitario=0");
                if (articulo.modeloInventario === 'PF' && inventario.periodoRevision === 0) faltantes.push("inventario.periodoRevision=0 (modelo PF)");

                if (faltantes.length > 0) {
                    // console.warn(`❌ Artículo ${articulo.idArticulo}: datos incompletos o inválidos - ${faltantes.join(", ")}`);
                    continue;
                } else {
                    // console.warn(`✔️ ✔️ Se recalcularon todos`);

                }

                // Si todo está OK, calculamos y actualizamos
                const modelo = articulo.modeloInventario;

                const nuevosValores = calcularInventario({
                    demandaArticulo: inventario!.demandaArticulo,
                    costoPedido: inventario!.costoPedido,
                    costoAlmacenamiento: inventario!.costoAlmacenamiento,
                    demoraEntrega: proveedor!.demoraEntrega,
                    modeloInventario: modelo,
                    nivelServicio: proveedor!.nivelServicio ?? undefined,
                    desviacionEstandar: proveedor!.desviacionEstandar ?? undefined,
                    periodoRevision: inventario!.periodoRevision ?? undefined,
                    precioUnitario: proveedor!.precioUnitario ?? undefined,
                });

                const updatePayload: any = {
                    stockSeguridad: nuevosValores.stockSeguridad,
                    cgi: nuevosValores.cgi,
                };

                if (modelo === 'LF') {
                    updatePayload.loteOptimo = nuevosValores.loteOptimo;
                    updatePayload.puntoPedido = nuevosValores.puntoPedido;
                } else if (modelo === 'PF') {
                    updatePayload.inventarioMaximo = nuevosValores.inventarioMaximo;
                }

                await prisma.inventario.update({
                    where: { idInventario: inventario!.idInventario },
                    data: updatePayload,
                });
            }

            return res.status(200).json({ msg: "Inventarios recalculados correctamente" });

        } catch (error: any) {
            return res.status(500).json({
                msg: "Error interno al recalcular inventario.",
                error: error instanceof Error ? error.message : error
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
