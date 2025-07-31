-- CreateTable
CREATE TABLE `Inventario` (
    `idInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `costoAlmacenamiento` INTEGER NULL,
    `costoPedido` INTEGER NULL,
    `demandaArticulo` INTEGER NULL,
    `loteOptimo` INTEGER NULL DEFAULT 0,
    `puntoPedido` INTEGER NULL DEFAULT 0,
    `stockSeguridad` INTEGER NULL DEFAULT 0,
    `inventarioMaximo` INTEGER NULL DEFAULT 0,
    `periodoRevision` INTEGER NULL DEFAULT 0,
    `cgi` INTEGER NULL DEFAULT 0,
    `fechaBaja` DATETIME(3) NULL,

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
    `modeloInventario` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL,

    UNIQUE INDEX `Articulo_idInventario_key`(`idInventario`),
    PRIMARY KEY (`idArticulo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AjusteInventario` (
    `idAjusteInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `atributo` VARCHAR(191) NOT NULL,
    `valorOriginal` VARCHAR(191) NOT NULL,
    `valorNuevo` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idAjusteInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticuloProveedor` (
    `idArticuloProveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `idProveedor` INTEGER NOT NULL,
    `demoraEntrega` INTEGER NULL,
    `fechaBaja` DATETIME(3) NULL,
    `esPredeterminado` BOOLEAN NULL DEFAULT false,
    `precioUnitario` DOUBLE NULL,
    `nivelServicio` DOUBLE NULL,
    `desviacionEstandar` DOUBLE NULL,

    PRIMARY KEY (`idArticuloProveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstadoOrdenCompra` (
    `idEstadoOrdenCompra` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaBaja` DATETIME(3) NULL,
    `nombre` VARCHAR(191) NULL,

    PRIMARY KEY (`idEstadoOrdenCompra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenCompra` (
    `idOrdenCompra` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `idProveedor` INTEGER NOT NULL,
    `idEstadoOrdenCompra` INTEGER NOT NULL,
    `cantidad` INTEGER NULL,
    `fechaCreacion` DATETIME(3) NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idOrdenCompra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Venta` (
    `idVenta` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `cantidad` INTEGER NULL,
    `total` DOUBLE NULL DEFAULT 0,
    `fechaCreacion` DATETIME(3) NULL,
    `fechaBaja` DATETIME(3) NULL,

    PRIMARY KEY (`idVenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Articulo` ADD CONSTRAINT `Articulo_idInventario_fkey` FOREIGN KEY (`idInventario`) REFERENCES `Inventario`(`idInventario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AjusteInventario` ADD CONSTRAINT `AjusteInventario_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticuloProveedor` ADD CONSTRAINT `ArticuloProveedor_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ArticuloProveedor` ADD CONSTRAINT `ArticuloProveedor_idProveedor_fkey` FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idProveedor_fkey` FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idEstadoOrdenCompra_fkey` FOREIGN KEY (`idEstadoOrdenCompra`) REFERENCES `EstadoOrdenCompra`(`idEstadoOrdenCompra`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;
