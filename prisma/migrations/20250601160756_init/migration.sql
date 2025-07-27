-- CreateTable: Inventario
CREATE TABLE `Inventario` (
    `idInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `costoAlmacenamiento` INTEGER NULL,
    `costoCompra` INTEGER NULL,
    `costoPedido` INTEGER NULL,
    `demandaArticulo` INTEGER NULL,
    `loteOptimo` INTEGER NULL,
    `puntoPedido` INTEGER NULL,
    `stockSeguridad` INTEGER NULL,
    `inventarioMaximo` INTEGER NULL,
    `periodoRevision` INTEGER NULL,
    PRIMARY KEY (`idInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: Proveedor
CREATE TABLE `Proveedor` (
    `idProveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaBaja` DATETIME(3) NULL,
    `nombre` VARCHAR(191) NULL,
    PRIMARY KEY (`idProveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: Articulo
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

-- CreateTable: AjusteInventario
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

-- CreateTable: ArticuloProveedor
CREATE TABLE `ArticuloProveedor` (
    `idArticuloProveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `idProveedor` INTEGER NOT NULL,
    `demoraEntrega` INTEGER NULL,
    `fechaBaja` DATETIME(3) NULL,
    `esPredeterminado` BOOLEAN NULL,
    `precioUnitario` FLOAT NULL,
    `nivelServicio` FLOAT NULL,
    `desviacionEstandar` FLOAT NULL,
    PRIMARY KEY (`idArticuloProveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: EstadoOrdenCompra
CREATE TABLE `EstadoOrdenCompra` (
    `idEstadoOrdenCompra` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaBaja` DATETIME(3) NULL,
    `nombre` VARCHAR(191) NULL,
    PRIMARY KEY (`idEstadoOrdenCompra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: OrdenCompra
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

-- CreateTable: Venta
CREATE TABLE `Venta` (
    `idVenta` INTEGER NOT NULL AUTO_INCREMENT,
    `idArticulo` INTEGER NOT NULL,
    `cantidad` INTEGER NULL,
    `fechaCreacion` DATETIME(3) NULL,
    PRIMARY KEY (`idVenta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Foreign keys
ALTER TABLE `Articulo` 
  ADD CONSTRAINT `Articulo_idInventario_fkey` 
  FOREIGN KEY (`idInventario`) REFERENCES `Inventario`(`idInventario`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `AjusteInventario` 
  ADD CONSTRAINT `AjusteInventario_idArticulo_fkey` 
  FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ArticuloProveedor` 
  ADD CONSTRAINT `ArticuloProveedor_idArticulo_fkey` 
  FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ArticuloProveedor` 
  ADD CONSTRAINT `ArticuloProveedor_idProveedor_fkey` 
  FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `OrdenCompra` 
  ADD CONSTRAINT `OrdenCompra_idArticulo_fkey` 
  FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `OrdenCompra` 
  ADD CONSTRAINT `OrdenCompra_idProveedor_fkey` 
  FOREIGN KEY (`idProveedor`) REFERENCES `Proveedor`(`idProveedor`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `OrdenCompra` 
  ADD CONSTRAINT `OrdenCompra_idEstadoOrdenCompra_fkey` 
  FOREIGN KEY (`idEstadoOrdenCompra`) REFERENCES `EstadoOrdenCompra`(`idEstadoOrdenCompra`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Venta` 
  ADD CONSTRAINT `Venta_idArticulo_fkey` 
  FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) 
  ON DELETE RESTRICT ON UPDATE CASCADE;
