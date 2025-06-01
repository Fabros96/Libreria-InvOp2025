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
          modeloInventario: 1000 + i,
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
        nombre: 'Creado',
      },
    }),
    prisma.estadoOrdenCompra.create({
      data: {
        nombre: 'Activo',
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


    // Crear inventarios

    // const inventario1 = await prisma.inventario.create({
    //     data: {
    //         costoAlmacenamiento: 100,
    //         costoCompra: 500,
    //         costoPedido: 200,
    //         demandaArticulo: 50,
    //         loteOptimo: 30,
    //         puntoPedido: 20,
    //         stockSeguridad: 10,
    //     },
    // });
    // const inventario2 = await prisma.inventario.create({
    //     data: {
    //         costoAlmacenamiento: 70,
    //         costoCompra: 150,
    //         costoPedido: 45,
    //         demandaArticulo: 200,
    //         loteOptimo: 80,
    //         puntoPedido: 60,
    //         stockSeguridad: 20,
    //     },
    // });
    // const inventario3 = await prisma.inventario.create({
    //     data: {
    //         costoAlmacenamiento: 90,
    //         costoCompra: 200,
    //         costoPedido: 60,
    //         demandaArticulo: 300,
    //         loteOptimo: 120,
    //         puntoPedido: 100,
    //         stockSeguridad: 25,
    //     },
    // });
   
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