/*
  Warnings:

  - The primary key for the `ajusteinventario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idAjustesInventario` on the `ajusteinventario` table. All the data in the column will be lost.
  - Added the required column `idAjusteInventario` to the `AjusteInventario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ajusteinventario` DROP PRIMARY KEY,
    DROP COLUMN `idAjustesInventario`,
    ADD COLUMN `idAjusteInventario` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`idAjusteInventario`);
