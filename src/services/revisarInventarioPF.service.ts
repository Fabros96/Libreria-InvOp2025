import { PrismaClient } from '@prisma/client';

//Servicio de revisión por periodo fijo, recorremos todos los artículos activos con su inventario configurado.

const prisma = new PrismaClient();

export const revisarUnArticulo = async (idArticulo: number) => {
  const resultados: any[] = [];

  const articulo = await prisma.articulo.findUnique({
    where: { idArticulo },
    include: { inventario: true },
  });

  if (!articulo) {
    throw new Error("Artículo no encontrado");
  }

  const stock = articulo.stock;
  const inventarioItem = articulo.inventario;

  const ordenExistente = await prisma.ordenCompra.findFirst({
    where: {
      idArticulo,
      idEstadoOrdenCompra: { in: [1, 3] },
    },  
  });

  if (ordenExistente) {
    return [{mensaje: 'Ya existe una orden de compra activa para este artículo.'}]
  }

  if (!inventarioItem || inventarioItem.inventarioMaximo === null) {
    resultados.push({
      idArticulo,
      mensaje: 'No se encuentra configurado el inventario máximo',
    });
    return resultados;
  }

  if (stock < inventarioItem.inventarioMaximo) {
    const cantidadAComprar = inventarioItem.inventarioMaximo - stock;
    //console.log("lacantidadacomprar: ",cantidadAComprar)

    const articuloProveedor = await prisma.articuloProveedor.findFirst({
      where: { idArticulo },
    });

    if (!articuloProveedor) {
      resultados.push({
        idArticulo,
        mensaje: 'No se encontró proveedor asociado al artículo',
      });
      return resultados;
    }

    const nuevaOrden = await prisma.ordenCompra.create({
      data: {
        idArticulo,
        idProveedor: articuloProveedor.idProveedor,
        idEstadoOrdenCompra: 1,
        cantidad: cantidadAComprar,
        fechaCreacion: new Date(),
      },
    });

    resultados.push({
      idArticulo,
      mensaje: 'Orden de compra generada',
      orden: nuevaOrden,
    });
  } else {
    resultados.push({
      idArticulo,
      mensaje: 'Stock suficiente. No se requiere reposición',
    });
  }

  return resultados;
};
