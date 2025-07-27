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
            res.status(200).json({ msg: `${ventas.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ventas });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },

    // Obtener un venta por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ventaRepository.findById(Number(id), decodeURIComponent(req.url)) });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },

    create: async (req: Request, res: Response) => {
        let { idArticulo, cantidad, fechaCreacion, forzarVenta } = req.body;
        try {
            if (!fechaCreacion) fechaCreacion = new Date(Date.now());

            // Traer stock actual
            const stockArticulo = await prisma.articulo.findUnique({
                where: { idArticulo },
                select: { stock: true }
            });

            // Traer modeloInventario y datos de inventario
            const inventarioArticulo = await prisma.articulo.findUnique({
                where: { idArticulo },
                select: {
                    modeloInventario: true,
                    inventario: {
                        select: {
                            loteOptimo: true,
                            puntoPedido: true,
                        }
                    }
                }
            });

            // Verificar OC existente
            const ordenExistente = await prisma.ordenCompra.findFirst({
                where: {
                    idArticulo,
                    idEstadoOrdenCompra: { in: [1, 3] } // pendiente o enviada
                }
            });

            if (ordenExistente && !forzarVenta) {
                return res.status(200).json({
                    advertencia: true,
                    msg: 'Existe una orden de compra activa para este artículo y no se va a generar una orden automática hasta que finalice la orden de compra. ¿Desea continuar con la venta?'
                })
            }

            // Traer proveedores del artículo
            const articuloProveedor = await prisma.articuloProveedor.findMany({
                where: { idArticulo },
                orderBy: { precioUnitario: 'desc' }
            });

            if (!stockArticulo) {
                return res.status(404).json({ msg: 'Artículo no encontrado.' });
            }

            if (typeof cantidad !== 'number' || cantidad <= 0 || stockArticulo.stock === null) {
                return res.status(400).json({ msg: 'Cantidad o stock inválidos.' });
            }

            if (cantidad > stockArticulo.stock) {
                return res.status(400).json({ msg: 'La cantidad solicitada supera el stock disponible.' });
            }

            // Generar la venta
            const nuevaVenta = await prisma.venta.create({
                data: { idArticulo, cantidad, fechaCreacion }
            });

            // Decrementar stock
            const updateArticulo = await prisma.articulo.update({
                where: { idArticulo },
                data: {
                    stock: {
                        decrement: cantidad
                    }
                },
                include: {
                    inventario: true
                }
            });

            // Revisar si hay que generar OC
            const nuevoStock = updateArticulo.stock;
            const puntoPedido = updateArticulo.inventario?.puntoPedido ?? 0;
            const loteOptimo = updateArticulo.inventario?.loteOptimo ?? 0;
            const modeloInventario = inventarioArticulo?.modeloInventario;
            
            if (
                modeloInventario === 'LF' &&
                nuevoStock < puntoPedido &&
                !ordenExistente
            ) {
                await prisma.ordenCompra.create({
                    data: {
                        idArticulo,
                        idProveedor: articuloProveedor[0].idProveedor,
                        idEstadoOrdenCompra: 1, // pendiente
                        cantidad: loteOptimo,
                        fechaCreacion: new Date(Date.now()),
                    }
                });
            }

            res.status(201).json({
                msg: 'Venta creada correctamente.',
                data: nuevaVenta,
                updateArticulo
            });

        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear la venta', detail: error.message });
        }
    },

}
