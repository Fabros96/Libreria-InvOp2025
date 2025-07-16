import cron, { ScheduledTask } from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { revisarUnArticulo } from './revisarInventarioPF.service';
import {
  agregarMensajeCron,
  limpiarMensajesCron,
} from './cron-mensajes.service'; // 👈 importar funciones correctas

const prisma = new PrismaClient();

let tareasCron: { [key: number]: ScheduledTask } = {};

export const iniciarCronPorPeriodo = async () => {
  const articulos = await prisma.articulo.findMany({
    where: {
      fechaBaja: null,
      modeloInventario: { contains: 'PF' },
      inventario: {
        periodoRevision: { not: null },
      },
    },
    include: { inventario: true },
  });

  limpiarMensajesCron(); // 🧹 Limpia mensajes anteriores

  for (const articulo of articulos) {
    const id = articulo.idArticulo;
    const descripcion = articulo.descripcion || 'Sin nombre';
    const segundos = articulo.inventario?.periodoRevision ?? 30;
    const cronExp = `*/${segundos} * * * * *`;

    if (tareasCron[id]) {
      tareasCron[id].stop();
    }

    const tarea = cron.schedule(cronExp, async () => {
      const resultado = await revisarUnArticulo(id);
      const mensaje = resultado[0]?.mensaje || 'Sin mensaje';
      const linea = `🔔 [${descripcion}] ${mensaje}`;
      console.log(linea);
      agregarMensajeCron(linea); 

    });

    tareasCron[id] = tarea;
  }

  return {
    mensaje: 'Crons iniciados correctamente',
    total: Object.keys(tareasCron).length,
  };

  
};

export const detenerTodosLosCrons = () => {
  Object.values(tareasCron).forEach((t) => t.stop()); // Detiene cada tarea activa
  tareasCron = {}; // Limpia el registro de tareas
  console.log('⛔ Todos los crons detenidos.');
};
