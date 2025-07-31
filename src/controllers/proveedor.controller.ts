import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ProveedorRepository } from "../repositories/proveedor.repository";

const prisma = new PrismaClient();
const proveedorRepository = new ProveedorRepository();

export const ProveedorController = {
    // Obtener todos los proveedores
    getAll: async (req: Request, res: Response) => {
        try {
            const proveedores = await proveedorRepository.findMany(decodeURIComponent(req.url));
            //console.log("eldecode: ",req.url)
            //console.log("osssssssss")
            res.status(200).json({ msg: `${proveedores.length > 0 ? 'Se han encontrado registros' : 'No se han encontrado registros'}`, data: proveedores});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener las registros', detail: error.message });
        }
    },
    
    // Obtener un proveedor por su ID (getById)
    getById: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            res.json({ msg: 'Se ha encontrado el registro', data: await proveedorRepository.findById(Number(id), decodeURIComponent(req.url))});
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al obtener el registro', detail: error.message });
        }
    },
    
    // Crear un nuevo proveedor (create)
    create: async (req: Request, res: Response) => {
        let { nombre, fechaBaja } = req.body;
        try {
            const nuevoProveedor = await prisma.proveedor.create({
                data: { nombre, fechaBaja: fechaBaja || null },
            });
            res.status(200).json({ msg: 'Se ha creado el proveedor.', data: nuevoProveedor });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al crear el proveedor', detail: error.message });
        }
    },
    
    // Actualizar un proveedor (update)
    update: async (req: Request, res: Response) => {
        //console.log("si entro al update")
        const { id } = req.params;

        let { nombre, fechaBaja } = req.body;
        let payload: any = { nombre };
        if (fechaBaja) payload['fechaBaja'] = fechaBaja;
        try {
            const proveedorActualizado = await prisma.proveedor.update({
                where: { idProveedor: parseInt(id) },
                data: payload,
            });
            res.status(200).json({ msg: 'Se ha actualizado el proveedor.', data: proveedorActualizado });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al actualizar el proveedor', detail: error.message });
        }
    },

    // Eliminar proveedor (Baja lógica)
    delete: async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const proveedorBaja = await prisma.proveedor.update({
                where: { idProveedor: parseInt(id) },
                data: { fechaBaja: new Date() }
            });
            res.status(200).json({ msg: 'Proveedor dado de baja', data: proveedorBaja });
        } catch (error: any) {
            res.status(500).json({ msg: 'Error al dar de baja el proveedor', detail: error.message });
        }
    },

}
