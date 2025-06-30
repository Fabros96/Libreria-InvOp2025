/*
  Warnings:

  - You are about to drop the `ajustesinventario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ajustesinventario` DROP FOREIGN KEY `AjustesInventario_idArticulo_fkey`;

-- DropTable
DROP TABLE `ajustesinventario`;

-- CreateTable
CREATE TABLE `AjusteInventario` (
    `idAjustesInventario` INTEGER NOT NULL AUTO_INCREMENT,
    `cantOrig` INTEGER NOT NULL,
    `idArticulo` INTEGER NOT NULL,
    `cantNew` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idAjustesInventario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AjusteInventario` ADD CONSTRAINT `AjusteInventario_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;
