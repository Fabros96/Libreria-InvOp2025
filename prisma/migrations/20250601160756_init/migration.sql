/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Inventario` (
    `idInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `costoAlmacenamiento` INTEGER NULL,
    `costoCompra` INTEGER NULL,
    `costoPedido` INTEGER NULL,
    `demandaArticulo` INTEGER NULL,
    `loteOptimo` INTEGER NULL,
    `puntoPedido` INTEGER NULL,
    `stockSeguridad` INTEGER NULL,

    PRIMARY KEY (`idInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proveedor` (
    `idProveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaBaja` DATETIME(3) NULL,
    `nombre` VARCHAR(191) NULL,

    PRIMARY KEY (`idProveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Articulo` (
    `idArticulo` INTEGER NOT NULL AUTO_INCREMENT,
    `idInventario` INTEGER NOT NULL,
    `fechaBaja` DATETIME(3) NULL,
    `descripcion` VARCHAR(191) NULL,
    `modeloInventario` INTEGER NULL,
    `stock` INTEGER NULL,

    UNIQUE INDEX `Articulo_idInventario_key`(`idInventario`),
    PRIMARY KEY (`idArticulo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticuloProveedor` (
    `idArticuloProveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `idProveedor` INTEGER NOT NULL,
    `cargoPedido` INTEGER NULL,
    `demoraEntrega` INTEGER NULL,
    `esPredeterminado` BOOLEAN NULL,
    `precioUnitario` INTEGER NULL,

    PRIMARY KEY (`idArticuloProveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenCompra` (
    `idOrdenCompra` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `idProveedor` INTEGER NOT NULL,
    `cantidad` INTEGER NULL,
    `fechaCreacion` DATETIME(3) NULL,

    PRIMARY KEY (`idOrdenCompra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `idVenta` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `cantidad` INTEGER NULL,
    `fechaCreacion` DATETIME(3) NULL,

    PRIMARY KEY (`idVenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Articulo` ADD CONSTRAINT `Articulo_idInventario_fkey` FOREIGN KEY (`idInventario`) REFERENCES `Inventario`(`idInventario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticuloProveedor` ADD CONSTRAINT `ArticuloProveedor_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticuloProveedor` ADD CONSTRAINT `ArticuloProveedor_idProveedor_fkey` FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idProveedor_fkey` FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;
