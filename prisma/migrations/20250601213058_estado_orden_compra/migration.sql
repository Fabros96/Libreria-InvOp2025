/*
  Warnings:

  - Added the required column `idEstadoOrdenCompra` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ordencompra` ADD COLUMN `idEstadoOrdenCompra` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `EstadoOrdenCompra` (
    `idEstadoOrdenCompra` INTEGER NOT NULL AUTO_INCREMENT,
    `fechaBaja` DATETIME(3) NULL,
    `nombre` VARCHAR(191) NULL,

    PRIMARY KEY (`idEstadoOrdenCompra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenCompra` ADD CONSTRAINT `OrdenCompra_idEstadoOrdenCompra_fkey` FOREIGN KEY (`idEstadoOrdenCompra`) REFERENCES `EstadoOrdenCompra`(`idEstadoOrdenCompra`) ON DELETE RESTRICT ON UPDATE CASCADE;
