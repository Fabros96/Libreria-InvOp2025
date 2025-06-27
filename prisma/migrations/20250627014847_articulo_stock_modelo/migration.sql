/*
  Warnings:

  - Made the column `modeloInventario` on table `articulo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `articulo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `articulo` MODIFY `modeloInventario` VARCHAR(191) NOT NULL,
    MODIFY `stock` INTEGER NOT NULL;
