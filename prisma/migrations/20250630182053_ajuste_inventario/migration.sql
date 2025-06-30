/*
  Warnings:

  - You are about to drop the `ajustesinv` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ajustesinv` DROP FOREIGN KEY `fk_ajustesinv_articulo`;

-- DropTable
DROP TABLE `ajustesinv`;

-- CreateTable
CREATE TABLE `AjustesInventario` (
    `idAjusInv` INTEGER NOT NULL AUTO_INCREMENT,
    `cantOrig` INTEGER NOT NULL,
    `idArticulo` INTEGER NOT NULL,
    `cantNew` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`idAjusInv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AjustesInventario` ADD CONSTRAINT `AjustesInventario_idArticulo_fkey` FOREIGN KEY (`idArticulo`) REFERENCES `Articulo`(`idArticulo`) ON DELETE RESTRICT ON UPDATE CASCADE;
