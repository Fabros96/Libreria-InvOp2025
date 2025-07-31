const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Crear Inventarios manualmente
  const inventarios = await Promise.all([
    prisma.inventario.create({
      data: {
        idInventario:1,
        costoAlmacenamiento: 80,
        costoPedido: 150,
        demandaArticulo: 40,
        loteOptimo: 232,
        puntoPedido: 460,
        stockSeguridad: 300,
        periodoRevision: 0,
        cgi: 13680,
      },
    }),
    prisma.inventario.create({
      data: {
        idInventario: 2, // Asegúrate de que este ID no choque con el anterior
        costoAlmacenamiento: 120,
        costoPedido: 250,
        demandaArticulo: 60,
        loteOptimo: 300,
        puntoPedido: 440,
        stockSeguridad: 260,
        periodoRevision: 0,
        cgi: 25250,
      },
    }),
    prisma.inventario.create({
      data: {
        idInventario: 3, // Asegúrate de que este ID no choque con los anteriores
        costoAlmacenamiento: 100,
        costoPedido: 200,
        demandaArticulo: 50,
        loteOptimo: 0,
        puntoPedido: 0,
        stockSeguridad: 277,
        inventarioMaximo: 877,
        periodoRevision: 7,
        cgi: 0,
      },
    }),
  ]);

  // 2. Crear Artículos, enlazando con los inventarios recién creados
  const datosArticulos = [
    {
      descripcion: 'Cartulinas',
      modeloInventario: 'LF',
      stock: 400,
    },
    {
      descripcion: 'Fibras Faber-Castell',
      modeloInventario: 'LF',
      stock: 20,
    },
    {
      descripcion: 'Tijeras para zurdos',
      modeloInventario: 'PF',
      stock: 500,
    },
  ];

  // 3. Crear artículos en paralelo, enlazando con los inventarios creados
  const articulos = await Promise.all(
    datosArticulos.map((articulo, i) =>
      prisma.articulo.create({
        data: {
          ...articulo,
          idArticulo:inventarios[i].idInventario,
          idInventario: inventarios[i].idInventario, // usa el ID real generado por Prisma
        },
      })
    )
  );

  // Descomentar el siguiente bloque para crear artículos de forma automática
  // const articulos = await Promise.all(
  //   inventarios.map((inv, i) =>
  //     prisma.articulo.create({
  //       data: {
  //         idInventario: inv.idInventario,
  //         descripcion: `Artículo ${i + 1}`,
  //         modeloInventario: 'LF',
  //         stock: 10 * (i + 1),
  //       },
  //     })
  //   )
  // );

  // 3. Crear Proveedores
  const proveedores = await Promise.all([
    prisma.proveedor.create({
      data: { idProveedor: 1, nombre: 'Ricardo Fernandez' },
    }),
    prisma.proveedor.create({
      data: { idProveedor: 2, nombre: 'Sifer' },
    }),
    prisma.proveedor.create({
      data: { idProveedor: 3, nombre: 'MEGALIBRERIAS' },
    }),
  ]);

  // 4. Crear ArticuloProveedor (N:N entre Articulo y Proveedor)
  await Promise.all([
    prisma.articuloProveedor.create({
      data: {
        idArticuloProveedor: 1,
        idArticulo: articulos[0].idArticulo,
        idProveedor: proveedores[0].idProveedor,
        precioUnitario: 110,
        nivelServicio: 10,
        desviacionEstandar: 15,
        demoraEntrega: 4,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticuloProveedor: 2,
        idArticulo: articulos[1].idArticulo,
        idProveedor: proveedores[1].idProveedor,
        precioUnitario: 1220,
        nivelServicio: 15,
        desviacionEstandar: 10,
        demoraEntrega: 3,
        esPredeterminado: true,
      },
    }),
    prisma.articuloProveedor.create({
      data: {
        idArticuloProveedor: 3,
        idArticulo: articulos[2].idArticulo,
        idProveedor: proveedores[2].idProveedor,
        precioUnitario: 100,
        nivelServicio: 8,
        desviacionEstandar: 10,
        demoraEntrega: 5,
        esPredeterminado: true,
      },
    }),
  ]);

  await Promise.all([
    prisma.estadoOrdenCompra.create({
      data: {
        idEstadoOrdenCompra: 1,
        nombre: 'Pendiente',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        idEstadoOrdenCompra: 2,
        nombre: 'Cancelada',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        idEstadoOrdenCompra: 3,
        nombre: 'Enviada',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        idEstadoOrdenCompra: 4,
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
        total: 300,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[1].idArticulo,
        cantidad: 5,
        total: 550,
        fechaCreacion: new Date(),
      },
    }),
    prisma.venta.create({
      data: {
        idArticulo: articulos[2].idArticulo,
        cantidad: 2,
        total: 240,
        fechaCreacion: new Date(),
      },
    }),
  ]);

  const TOTAL_VENTAS = 0;           // Cantidad de registros que quieres crear
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