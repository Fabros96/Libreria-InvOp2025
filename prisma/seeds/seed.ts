// import { PrismaClient } from '@prisma/client';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Crear Inventarios
  const inventarios = await Promise.all([
    prisma.inventario.create({
      data: {
        costoAlmacenamiento: 100,
        costoCompra: 500,
        costoPedido: 200,
        demandaArticulo: 50,
        loteOptimo: 30,
        puntoPedido: 20,
        stockSeguridad: 10,
      },
    }),
    prisma.inventario.create({
      data: {
        costoAlmacenamiento: 80,
        costoCompra: 400,
        costoPedido: 150,
        demandaArticulo: 40,
        loteOptimo: 25,
        puntoPedido: 18,
        stockSeguridad: 8,
      },
    }),
     prisma.inventario.create({
      data: {
        costoAlmacenamiento: 120,
        costoCompra: 600,
        costoPedido: 250,
        demandaArticulo: 60,
        loteOptimo: 35,
        puntoPedido: 22,
        stockSeguridad: 12,
      },
    }),
  ]);

  // 2. Crear Artículos (1:1 con Inventario)
  const articulos = await Promise.all(
    inventarios.map((inv, i) =>
      prisma.articulo.create({
        data: {
          idInventario: inv.idInventario,
          descripcion: `Artículo ${i + 1}`,
          modeloInventario: 'LF',
          stock: 10 * (i + 1),
        },
      })
    )
  );

  // 3. Crear Proveedores
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: { nombre: 'Proveedor A' },
    }),
    prisma.proveedor.create({
      data: { nombre: 'Proveedor B' },
    }),
    prisma.proveedor.create({
      data: { nombre: 'Proveedor C' },
    }),
  ]);

  // 4. Crear ArticuloProveedor (N:N entre Articulo y Proveedor)
  await Promise.all([
    prisma.articuloProveedor.create({
      data: {
        idArticulo: articulos[0].idArticulo,
        idProveedor: proveedores[0].idProveedor,
        precioUnitario: 100,
        demoraEntrega: 5,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        idProveedor: proveedores[1].idProveedor,
        precioUnitario: 110,
        demoraEntrega: 4,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        idProveedor: proveedores[2].idProveedor,
        precioUnitario: 120,
        demoraEntrega: 3,
        esPredeterminado: false,
      },
    }),
  ]);

  await Promise.all([
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Pendiente',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Enviado',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Cancelado',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Finalizado',
      },
    }),
  ]);

  // 5. Crear Ordenes de Compra (uno por Articulo y Proveedor)
  await Promise.all([
    prisma.ordenCompra.create({
      data: {
        idArticulo: articulos[0].idArticulo,
        idProveedor: proveedores[0].idProveedor,
        idEstadoOrdenCompra: 1,
        cantidad: 50,
        fechaCreacion: new Date(),
      },
    }),
    prisma.ordenCompra.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        idProveedor: proveedores[1].idProveedor,
        idEstadoOrdenCompra: 2,
        cantidad: 30,
        fechaCreacion: new Date(),
      },
    }),
    prisma.ordenCompra.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        idProveedor: proveedores[2].idProveedor,
        idEstadoOrdenCompra: 3,
        cantidad: 70,
        fechaCreacion: new Date(),
      },
    }),
  ]);

  // 6. Crear Ventas
  await Promise.all([
    prisma.venta.create({
      data: {
        idArticulo: articulos[0].idArticulo,
        cantidad: 3,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        cantidad: 5,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        cantidad: 2,
        fechaCreacion: new Date(),
      },
    }),
  ]);

  const TOTAL_VENTAS = 1000;           // Cantidad de registros que quieres crear
  const MAX_CANTIDAD = 20;             // Cantidad máxima por venta
  const FECHA_INICIO = new Date(2023, 0, 1);
  const FECHA_FIN = new Date(2023, 11, 31);
  const MIN_ARTICULO = 1;              // Id mínimo de artículo existente
  const MAX_ARTICULO = 3;             // Id máximo de artículo existente

  // FUNCIONES UTILES
  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  const ventas = [];
  for (let i = 0; i < TOTAL_VENTAS; i++) {
    ventas.push({
      idArticulo: randomInt(MIN_ARTICULO, MAX_ARTICULO),
      cantidad: randomInt(1, MAX_CANTIDAD),
      fechaCreacion: randomDate(FECHA_INICIO, FECHA_FIN),
    });
  }
  await prisma.venta.createMany({ data: ventas });
  console.log(`${TOTAL_VENTAS} ventas creadas exitosamente!`);

  const ajuste1 = await prisma.ajusteInventario.create({
    data: {
      cantOrig: 150,
      idArticulo: 1, // Asegúrate de que el artículo con id 1 exista
      cantNew: 145,
      fecha: new Date(),
      userName: 'admin',
    },
  });

  const ajuste2 = await prisma.ajusteInventario.create({
    data: {
      cantOrig: 75,
      idArticulo: 2, // Asegúrate de que el artículo con id 2 exista
      cantNew: 80,
      fecha: new Date(),
      userName: 'operario_ajustes',
    },
  });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

// REFERENCIA
// npx prisma db seed
// o npx prisma migrate reset (vuela todo por los aires)