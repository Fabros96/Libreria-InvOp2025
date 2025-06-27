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
            res.status(200).json({ msg: `${ventas.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: ventas});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un venta por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await ventaRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo venta (create)
    create: async (req: Request, res: Response) => {
        let { idArticulo, cantidad, fechaCreacion, articulo } = req.body;
        try {
            if (!fechaCreacion) fechaCreacion = new Date();

            const stockArticulo = await prisma.articulo.findUnique({
                where: {idArticulo},
                select: { stock: true } 
            });

            if (!stockArticulo) {
                return res.status(404).json({msg: 'Articulo no encontrado.'})
            }

            if (cantidad === null || stockArticulo.stock === null) { //hago esto por que no me deja comparar cantidad con articulo.stock
                return res.status(400).json({
                    msg: 'Cantidad o stock no pueden ser nulas'
                })
            }

            //Validar stock disponible
            if (cantidad > stockArticulo.stock) {
                return res.status(400).json({msg: 'La cantidad solicita supera el stock disponible.'})
            }

            const nuevaVenta = await prisma.venta.create({
                data: { idArticulo, cantidad, fechaCreacion, articulo },
            });

            const updateArticulo = await prisma.articulo.update({
                where: {idArticulo},
                data: {
                    stock: {
                        decrement: cantidad
                    }
                },
                include: {
                    inventario: true
                }
            });
            if (updateArticulo.modeloInventario === 'LF' && updateArticulo.stock! < updateArticulo.inventario.puntoPedido!) {
                const ordenExistente = await prisma.ordenCompra.findFirst({
                    where: {
                        idArticulo: idArticulo,
                        idEstadoOrdenCompra: {
                            in: [1, 4]
                        }
                    }
                });
                if (!ordenExistente) {
                    const articuloProveedor = await prisma.articuloProveedor.findMany({
                        where: {
                            idArticulo: idArticulo
                        },
                        orderBy: {
                            precioUnitario: 'desc'
                        }
                    });
                    //              Al generar una venta verificar el stock del artículo. Si el modelo de Inventario es LF, la 
                    // cantidad actual es >= al PP y no hay ordenes pendientes/enviada para el articulo, 
                    // generar una orden de compra en estado pendiente.  
    
                    // q = d *(T + L) + zσ (T + L) − I 
                    // Donde 
                    // q = Cantidad a pedir 
                    // T = El número de días entre revisiones 
                    // L = Tiempo de entrega en días (tiempo entre el momento de hacer un pedido y recibirlo) 
                    // d = Demanda diaria promedio pronosticada 
                    // z = Número de desviaciones estándar para una probabilidad de servicio específica 
                    // σT + L = Desviación estándar de la demanda durante el periodo de revisión y entrega 
                    // I = Nivel de inventario actual (incluye las piezas pedidas)
                    // calcular q que seria la cantidad
                    const cantidadAPedir = Math.round(updateArticulo.inventario.demandaArticulo! * articuloProveedor[0].demoraEntrega!  - (updateArticulo.stock! + cantidad));        
    
                    const nuevoOrdenCompra = await prisma.ordenCompra.create({
                        data: { 
                            idArticulo, 
                            idProveedor: 1, 
                            idEstadoOrdenCompra: articuloProveedor[0].idProveedor, 
                            cantidad: cantidadAPedir
                        },
                    });
                }
            }

            res.status(200).json({ msg: 'Se ha creado el venta.', data: nuevaVenta });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el venta', detail: error.message });
        }
    },
    
    // Actualizar un venta (update)
    update: async (req: Request, res: Response) => {
        const { id } = req.params;
        let { idArticulo, cantidad, fechaCreacion, articulo } = req.body;
        let payload: any = {  idArticulo, cantidad, fechaCreacion, articulo };
        try {
            const ventaActualizado = await prisma.venta.update({
                where: { idVenta: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el venta.', data: ventaActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el venta', detail: error.message });
        }
    },
    
    // Eliminar un venta (delete)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            await prisma.venta.delete({
                where: { idVenta: parseInt(id) },
            });
            res.status(200).json({ msg: 'Se ha eliminado el venta.' });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al eliminar el venta', detail: error.message });
        }
    },

}
