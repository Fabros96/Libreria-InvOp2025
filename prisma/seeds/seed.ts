// import { PrismaClient } from '@prisma/client';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Crear Inventarios
  const inventarios = await Promise.all([
    prisma.inventario.create({
      data: {
        costoAlmacenamiento: 100,
        costoPedido: 200,
        demandaArticulo: 50,
        loteOptimo: 30,
        puntoPedido: 20,
        stockSeguridad: 10,
        periodoRevision: 0,
      },
    }),
    prisma.inventario.create({
      data: {
        costoAlmacenamiento: 80,
        costoPedido: 150,
        demandaArticulo: 40,
        loteOptimo: 25,
        puntoPedido: 18,
        stockSeguridad: 8,
        periodoRevision: 0,
      },
    }),
    prisma.inventario.create({
      data: {
        costoAlmacenamiento: 120,
        costoPedido: 250,
        demandaArticulo: 60,
        loteOptimo: 35,
        puntoPedido: 22,
        stockSeguridad: 12,
        periodoRevision: 0,
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
        nivelServicio: 8,
        desviacionEstandar: 10,
        demoraEntrega: 5,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        idProveedor: proveedores[1].idProveedor,
        precioUnitario: 110,
        nivelServicio: 10,
        desviacionEstandar: 15,
        demoraEntrega: 4,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        idProveedor: proveedores[2].idProveedor,
        precioUnitario: 120,
        nivelServicio: 15,
        desviacionEstandar: 10,
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
        nombre: 'Enviada',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Cancelada',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Finalizada',
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
        total:300,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        cantidad: 5,
        total:550,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        cantidad: 2,
        total:240,
        fechaCreacion: new Date(),
      },
    }),
  ]);

  const TOTAL_VENTAS = 10;           // Cantidad de registros que quieres crear
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
    const cantidad = randomInt(1, MAX_CANTIDAD);
    const precioUnitario = randomInt(100, 500);

    ventas.push({
      idArticulo: randomInt(MIN_ARTICULO, MAX_ARTICULO),
      cantidad: cantidad,
      total: precioUnitario * cantidad,  // Aquí usas la variable cantidad
      fechaCreacion: randomDate(FECHA_INICIO, FECHA_FIN),
    });
  }

  // Luego insertas en la base de datos con Prisma
  await prisma.venta.createMany({ data: ventas });

  console.log(`${TOTAL_VENTAS} ventas creadas exitosamente!`);



  const ajuste1 = await prisma.ajusteInventario.create({
    data: {
      idArticulo: 1, // Asegúrate de que el artículo con id 1 exista
      fecha: new Date(),
      atributo: "stock",
      valorOriginal: "150",
      valorNuevo: "145",
      userName: 'admin',
    },
  });

  const ajuste2 = await prisma.ajusteInventario.create({
    data: {
      idArticulo: 2, // Asegúrate de que el artículo con id 2 exista
      fecha: new Date(),
      atributo: "stock",
      valorOriginal: "75",
      valorNuevo: "80",
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

console.log('\x1b[32m👍 TODO LISTO CAPO/A!! Dale para adelante con el FRONT.\x1b[0m');
// REFERENCIA
// npx prisma db seed
// o npx prisma migrate reset (vuela todo por los aires)